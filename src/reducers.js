import {combineReducers} from "redux";

import {
    PERFORM_INITIAL_AUTH,
    REFRESH_AUTH,
    INVALIDATE_AUTH,
    FETCH_META,
    FETCH_DATA,
    SET_REFRESH_TOKEN
} from "./actions";
import {LS_REFRESH_TOKEN} from "./constants";

const auth = (
    state = {
        tokens: {},
        isAuthenticating: false,
        isRefreshing: false,
        errorMessage: "",
    },
    action
) => {
    switch (action.type) {
        case PERFORM_INITIAL_AUTH.REQUEST:
            return {...state, isAuthenticating: true};
        case PERFORM_INITIAL_AUTH.RECEIVE:
            // LocalStorage hijacking
            localStorage.setItem(LS_REFRESH_TOKEN, action.data.refresh);
            // Normal stuff
            return {
                ...state,
                isAuthenticating: false,
                isRefreshing: false,
                tokens: action.data,
                errorMessage: "",
            };
        case PERFORM_INITIAL_AUTH.ERROR:
            return {
                ...state,
                tokens: {},
                isAuthenticating: false,
                isRefreshing: false,
                errorMessage: action.message,
            };

        case SET_REFRESH_TOKEN:
            // LocalStorage hijacking
            localStorage.setItem(LS_REFRESH_TOKEN, action.refresh);
            // Normal stuff
            return {...state, tokens: {...state.tokens, refresh: action.refresh}};

        case REFRESH_AUTH.REQUEST:
            return {...state, isRefreshing: true};
        case REFRESH_AUTH.RECEIVE:
            return {
                ...state,
                tokens: {...state.tokens, ...action.data},
                isRefreshing: false,
            };
        case REFRESH_AUTH.ERROR:  // TODO: Do we want to invalidate stuff here?
            return {
                ...state,
                isRefreshing: false,
                errorMessage: action.message,
            };

        case INVALIDATE_AUTH:
            return {...state, tokens: {}};

        default:
            return state;
    }
};

const meta = (
    state = {
        data: {},
        isFetching: false,
        errorMessage: "",
    },
    action
) => {
    switch (action.type) {
        case FETCH_META.REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case FETCH_META.RECEIVE:
            return {
                ...state,
                data: action.data,
                isFetching: false,
                errorMessage: "",
            };
        case FETCH_META.ERROR:
            return {
                ...state,
                isFetching: false,
                errorMessage: action.message,
            };
        default:
            return state;
    }
};

const data = (
    state = {
        dataByType: {},
        errorMessage: "",
    },
    action
) => {
    switch (action.type) {
        case FETCH_DATA.REQUEST:
            return {
                ...state,
                dataByType: {
                    ...state.dataByType,
                    [action.params.dataType]: {
                        ...(state.dataByType || {}),
                        isFetching: true,
                        offset: action.params.offset || 0,
                        filters: {},
                    }
                },
            };
        case FETCH_DATA.RECEIVE:
            return {
                ...state,
                dataByType: {
                    ...state.dataByType,
                    [action.params.dataType]: {
                        ...(state.dataByType || {}),
                        isFetching: false,
                        count: action.data.count,
                        data: action.data.results,
                        offset: action.params.offset || 0,
                        limit: action.params.limit || 100,
                        filters: action.filters || {},
                        sorter: action.sorter || null,
                    }
                },
                errorMessage: "",
            };
        case FETCH_DATA.ERROR:
            return {
                ...state,
                dataByType: {
                    ...state.dataByType,
                    [action.params.dataType]: {
                        ...(state.dataByType || {}),
                        isFetching: false,
                    }
                },
                errorMessage: action.message,
            };
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    auth,
    meta,
    data,
});

export default rootReducer;

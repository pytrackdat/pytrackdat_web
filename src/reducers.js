import {combineReducers} from "redux";

import {FETCH_META, FETCH_DATA} from "./actions";

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
    meta,
    data,
});

export default rootReducer;

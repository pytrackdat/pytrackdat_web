import jwtDecode from "jwt-decode";

import {ACCESS_TOKEN_LEEWAY} from "./constants";
import {networkActionTypes, networkAction, refreshTokenValid} from "./utils";

export const PERFORM_INITIAL_AUTH = networkActionTypes("PERFORM_INITIAL_AUTH");

export const performInitialAuth = (username, password) => async (dispatch, getState) => {
    if (getState().auth.isAuthenticating) return;
    await dispatch(networkAction(
        PERFORM_INITIAL_AUTH,
        "/token/",
        "POST",
        {},
        {username, password},
    )());
    return dispatch(fetchSiteMetaIfNeeded());
};

export const SET_REFRESH_TOKEN = "SET_REFRESH_TOKEN";
export const setRefreshToken = refresh => ({type: SET_REFRESH_TOKEN, refresh});

export const INVALIDATE_AUTH = "INVALIDATE_AUTH";
const invalidateAuth = () => ({type: INVALIDATE_AUTH});

export const REFRESH_AUTH = networkActionTypes("REFRESH_AUTH");
export const refreshOrInvalidateAuth = () => (dispatch, getState) => {
    if (getState().auth.isRefreshing) return;

    const access = getState().auth.tokens.access;
    const refresh = getState().auth.tokens.refresh;
    if (!refresh) return;

    // Make sure the refresh token is valid; if not, invalidate the auth state
    if (!refreshTokenValid(refresh)) {
        return dispatch(invalidateAuth());
    }

    if (access) {
        try {
            const tokenData = jwtDecode(access);
            if (Date.now() <= (tokenData.exp - ACCESS_TOKEN_LEEWAY) * 1000) {
                // Access token still OK for now, return without doing anything
                return;
            }
        } catch (e) {
            // Malformed access token, continue with refreshing it
        }
    }

    return dispatch(networkAction(
        REFRESH_AUTH,
        "/token/refresh/",
        "POST",
        {},
        {refresh}
    )())
};


export const FETCH_META = networkActionTypes("FETCH_META");

const fetchMeta = networkAction(FETCH_META, "/meta/");
export const fetchSiteMetaIfNeeded = () => (dispatch, getState) => {
    if (getState().meta.isFetching) return;
    return dispatch(fetchMeta());
};


export const FETCH_DATA = networkActionTypes("FETCH_DATA");
export const fetchDataType = (
    dataType,
    offset=0,
    limit=100,
    filters={},
    sorter=null,
) => (dispatch, getState) => {
    if ((getState().data.dataByType[dataType] || {}).isFetching) return;
    const filterString = Object.entries(filters)
        .filter(e => e[1] !== null)
        .map(([k, v]) => Array.isArray(v) ? `&${k}__in=${v.join(",")}` : `&${k}=${v}`)
        .join("");
    const sortString = (sorter && sorter.field)
        ? `&ordering=${(sorter.order === "ascend" ? "+" : "-")}${sorter.field}`
        : "";
    return dispatch(networkAction(
        FETCH_DATA,
        `/data/${dataType}/?limit=${limit}&offset=${offset}${filterString}${sortString}`,
        "GET",
        {dataType, offset, limit, filters, sorter}
    )());
};


export const PERFORM_SEARCH = networkActionTypes("PERFORM_SEARCH");
export const performSearch = query => (dispatch, getState) => {
    query = query.toLocaleString();
    if (getState().search.isFetching || query.trim() === "") return;

    return dispatch(networkAction(
        PERFORM_SEARCH,
        `/search/?q=${encodeURIComponent(query)}&limit=10`,
        "GET",
        {query},
    )());
};

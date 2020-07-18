import {networkActionTypes, networkAction} from "./utils";

export const FETCH_META = networkActionTypes("FETCH_META");

const fetchMeta = networkAction(FETCH_META, "/meta/");
export const fetchSiteMetaIfNeeded = () => (dispatch, getState) => {
    if (getState().meta.isFetching) return;
    return dispatch(fetchMeta());
};

export const FETCH_DATA = networkActionTypes("FETCH_DATA");
export const fetchDataType = (dataType, offset=0, limit=100) => (dispatch, getState) => {
    if ((getState().data.dataByType[dataType] || {}).isFetching) return;
    return dispatch(networkAction(FETCH_DATA, `/data/${dataType}/?limit=${limit}&offset=${offset}`,
        "GET", {dataType, offset, limit})());
};

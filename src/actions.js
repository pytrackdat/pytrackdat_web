import {networkActionTypes, networkAction} from "./utils";

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

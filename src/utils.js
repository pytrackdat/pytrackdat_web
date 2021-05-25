import {BASE_URL} from "./config";
import {KEY_TYPES} from "./constants";
import jwtDecode from "jwt-decode";

export const isKey = f => KEY_TYPES.includes(f.data_type);

export const getPK = r => ((r || {}).fields || []).filter(isKey)[0] || null;

export const networkActionTypes = name => ({
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`,
});

export const networkAction = (types, url, method="GET", params={}, body={}) => () =>
    async (dispatch, getState) => {
        await dispatch({params, type: types.REQUEST});

        const accessToken = getState().auth.tokens.access;

        try {
            const r = await fetch(BASE_URL + url,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        ...(url.startsWith("/token/") || !accessToken ? {} : {
                            "Authorization": `Bearer ${accessToken}`,
                        }),
                    },
                    ...(Object.keys(body).length ? {body: JSON.stringify(body)} : {})
                });

            if (r.ok) {
                const data = await r.json();
                await dispatch({type: types.RECEIVE, data, params});
            } else {
                await dispatch({
                    params,
                    type: types.ERROR,
                    message: `Request encountered error status: ${r.statusText}`,
                });
            }
        } catch (error) {
            await dispatch({type: types.ERROR, message: error.toString()});
        }
    };

export const refreshTokenValid = refreshToken => {
    try {
        const tokenData = jwtDecode(refreshToken);
        if (Date.now() >= tokenData.exp * 1000) {
            // Refresh token is expired
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}

import {BASE_URL} from "./config";
import {KEY_TYPES} from "./constants";

export const isKey = f => KEY_TYPES.includes(f.data_type);

export const networkActionTypes = name => ({
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`,
});

export const networkAction = (types, url, method="GET", params={}, body={}) => () =>
    async (dispatch, getState) => {
        console.log(types);

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

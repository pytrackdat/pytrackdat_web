import React from "react";
import {render} from "react-dom";

import {applyMiddleware, createStore} from "redux";
import thunkMiddleware from "redux-thunk";
import {Provider} from "react-redux";

import {BrowserRouter} from "react-router-dom";

import rootReducer from "./reducers";
import App from "./components/App";

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

document.addEventListener("DOMContentLoaded", () => render(
    <Provider store={store}><BrowserRouter><App /></BrowserRouter></Provider>,
    document.getElementById("root")
));

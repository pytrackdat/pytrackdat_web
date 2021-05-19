import React, {useEffect} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Redirect, Route, Switch} from "react-router-dom";

import {Alert, Input, Layout, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";

import {fetchSiteMetaIfNeeded, refreshOrInvalidateAuth, setRefreshToken} from "../actions";
import {LS_REFRESH_TOKEN} from "../constants";
import {refreshTokenValid} from "../utils";

import PrivateRoute from "./PrivateRoute";
import RelationsView from "./RelationsView";
import SignInView from "./SignInView";

const App = ({
    tokens,
    isAuthenticating,
    authError,
    metaError,
    isFetchingMeta,
    meta,

    setRefreshToken,
    refreshOrInvalidateAuth,
    fetchSiteMetaIfNeeded,
}) => {
    useEffect(() => {
        (async () => {
            const lsRefresh = localStorage.getItem(LS_REFRESH_TOKEN);
            if (!tokens.refresh && refreshTokenValid(lsRefresh)) {
                await setRefreshToken(lsRefresh);
            }
            await refreshOrInvalidateAuth();
            await fetchSiteMetaIfNeeded();
        })();
    }, []);

    setInterval(() => {
        // Make sure access token is up to date
        refreshOrInvalidateAuth();
    }, 45000);

    return <Layout>
        <Layout.Header style={{padding: "0 24px", height: "100%"}}>
            <div style={{display: "flex"}}>
                <h1 style={{margin: "0 24px 0 0", padding: 0, color: "#DFDFDF"}}>
                    PyTrackDat{meta.site_name ? ":" : ""} {meta.site_name}
                </h1>
                <div style={{flex: 1}}>
                    <Input style={{marginTop: "12px"}}
                           size="large"
                           placeholder="Enter barcode or search term..."
                           prefix={<SearchOutlined />} />
                </div>
            </div>
        </Layout.Header>
        <Layout.Content>
            {authError ? <Alert type="error" showIcon message="Authentication Error" description={authError} /> : null}
            {metaError ? <Alert type="error" showIcon message="Site Metadata Error" description={metaError} /> : null}
            <Spin spinning={isAuthenticating || isFetchingMeta}>
                <Switch>
                    <Route path="/sign-in" exact><SignInView /></Route>
                    <PrivateRoute path="/relations"><RelationsView /></PrivateRoute>
                    <Redirect to={{pathname: "/relations"}} />
                </Switch>
            </Spin>
        </Layout.Content>
    </Layout>;
}

App.propTypes = {
    tokens: PropTypes.shape({
        refresh: PropTypes.string,
        access: PropTypes.string,
    }),
    isAuthenticating: PropTypes.bool,

    authError: PropTypes.string,
    metaError: PropTypes.string,

    isFetchingMeta: PropTypes.bool,
    meta: PropTypes.shape({
        site_name: PropTypes.string,
    }),

    setRefreshToken: PropTypes.func,
    refreshOrInvalidateAuth: PropTypes.func,
    fetchSiteMetaIfNeeded: PropTypes.func,
};

const mapStateToProps = state => ({
    tokens: state.auth.tokens,
    isAuthenticating: state.auth.isAuthenticating,

    authError: state.auth.errorMessage,
    metaError: state.meta.errorMessage,

    isFetchingMeta: state.meta.isFetching,
    meta: state.meta.data,
});

export default connect(mapStateToProps, {
    setRefreshToken,
    refreshOrInvalidateAuth,
    fetchSiteMetaIfNeeded,
})(App);

import React, {useEffect} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Alert, Layout, Spin} from "antd";

import {fetchSiteMetaIfNeeded} from "../actions";

import RelationsView from "./RelationsView";
import SignInView from "./SignInView";

const App = ({
    isAuthenticating,
    isAuthenticated,
    authError,
    metaError,
    isFetchingMeta,
    meta,
    fetchSiteMetaIfNeeded
}) => {
    useEffect(() => {
        fetchSiteMetaIfNeeded();
    }, []);

    return <Layout>
        <Layout.Header style={{padding: "0 24px"}}>
            <h1 style={{margin: 0, padding: 0, color: "#DFDFDF"}}>
                PyTrackDat{meta.site_name ? ":" : ""} {meta.site_name}
            </h1>
        </Layout.Header>
        <Layout.Content>
            {authError ? <Alert type="error" showIcon message="Authentication Error" description={authError} /> : null}
            {metaError ? <Alert type="error" showIcon message="Site Metadata Error" description={metaError} /> : null}
            <Spin spinning={isAuthenticating || isFetchingMeta}>
                {isAuthenticated ? <RelationsView /> : <SignInView />}
            </Spin>
        </Layout.Content>
    </Layout>;
}

App.propTypes = {
    isAuthenticating: PropTypes.bool,
    isAuthenticated: PropTypes.bool,

    authError: PropTypes.string,
    metaError: PropTypes.string,

    isFetchingMeta: PropTypes.bool,
    meta: PropTypes.shape({
        site_name: PropTypes.string,
    }),
};

const mapStateToProps = state => ({
    isAuthenticating: state.auth.isAuthenticating,
    isAuthenticated: !!state.auth.tokens.refresh,

    authError: state.auth.errorMessage,
    metaError: state.meta.errorMessage,

    isFetchingMeta: state.meta.isFetching,
    meta: state.meta.data,
});

export default connect(mapStateToProps, {fetchSiteMetaIfNeeded})(App);

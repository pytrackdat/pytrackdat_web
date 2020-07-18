import React, {useEffect} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Spin} from "antd";
import "antd/es/layout/style/css";
import "antd/es/spin/style/css";

import {fetchSiteMetaIfNeeded} from "../actions";

import RelationsView from "./RelationsView";

const App = ({isFetchingMeta, meta, fetchSiteMetaIfNeeded}) => {
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
            <Spin spinning={isFetchingMeta}>
                <RelationsView />
            </Spin>
        </Layout.Content>
    </Layout>;
}

App.propTypes = {
    isFetchingMeta: PropTypes.bool,
    meta: PropTypes.shape({
        site_name: PropTypes.string,
    })
};

const mapStateToProps = state => ({
    isFetchingMeta: state.meta.isFetching,
    meta: state.meta.data,
});

export default connect(mapStateToProps, {fetchSiteMetaIfNeeded})(App);

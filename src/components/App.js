import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Redirect, Route, Switch, useHistory} from "react-router-dom";

import {throttle} from "lodash";

import {Alert, AutoComplete, Input, Layout, Spin} from "antd";
import {SearchOutlined} from "@ant-design/icons";

import {fetchSiteMetaIfNeeded, refreshOrInvalidateAuth, setRefreshToken, performSearch} from "../actions";
import {LS_REFRESH_TOKEN} from "../constants";
import {refreshTokenValid} from "../utils";

import PrivateRoute from "./PrivateRoute";
import RelationsView from "./RelationsView";
import SignInView from "./SignInView";

const App = ({
    authError,
    isAuthenticating,
    tokens,

    metaError,
    isFetchingMeta,
    meta,

    searchError,
    isFetchingSearch,
    searchResults,

    setRefreshToken,
    refreshOrInvalidateAuth,
    fetchSiteMetaIfNeeded,
    performSearch,
}) => {
    const history = useHistory();

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

    const [searchValue, setSearchValue] = useState();

    // noinspection JSCheckFunctionSignatures
    const throttledSearch = useRef(throttle(performSearch, 200)).current;

    const onSearchChange = query => {
        setSearchValue(query);
        // noinspection JSValidateTypes
        throttledSearch(query);
    };

    const onSearchSelect = item => {
        if (!item) return;
        const data = JSON.parse(item);
        history.push(`/relations/${data[0]}/items/${data[1]}`);
        setSearchValue("");
    };

    const autoCompleteOptions = isFetchingSearch ? [
        {
            key: "search_results",
            label: "Search Results",
            options: [{value: "Loading...", disabled: true}]
        },
    ] : [
        // Most of the time, by barcode and search results categories are going to be mutually exclusive
        ...((searchResults.barcodes ?? []).length ? [{
            key: "barcodes",
            label: "Barcodes",
            options: searchResults.barcodes.map(r => ({
                key: "_bc_" + r.pk.toString(),
                value: JSON.stringify([r.url_name, r.pk]),
                label: <span><span style={{fontWeight: "bold"}}>{r.name}</span> {r.pk}</span>,
            })),
        }] : []),

        ...((searchResults.full_text ?? []).length ? [{
            key: "search_results",
            label: "Search Results",
            options: searchResults.full_text.map(r => ({
                key: "_sr_" + r.pk.toString(),
                value: JSON.stringify([r.url_name, r.pk]),
                label: <span><span style={{fontWeight: "bold"}}>{r.name}</span> {r.pk}</span>,
                // TODO: Full text match underlining
            })),
        }] : []),
    ];

    return <Layout>
        <Layout.Header style={{padding: "0 24px", height: "100%"}}>
            <div style={{display: "flex"}}>
                <h1 style={{margin: "0 24px 0 0", padding: 0, color: "#DFDFDF"}}>
                    PyTrackDat{meta.site_name ? ":" : ""} {meta.site_name}
                </h1>
                <div style={{flex: 1}}>
                    <AutoComplete style={{marginTop: "12px", width: "100%", maxWidth: "800px", float: "right"}}
                                  value={searchValue}
                                  options={autoCompleteOptions}
                                  onChange={onSearchChange}
                                  onSelect={onSearchSelect}>
                        <Input size="large"
                               placeholder="Enter barcode or search term..."
                               prefix={<SearchOutlined />} />
                    </AutoComplete>
                </div>
            </div>
        </Layout.Header>
        <Layout.Content>
            {authError ? <Alert type="error" showIcon message="Authentication Error" description={authError} /> : null}
            {metaError ? <Alert type="error" showIcon message="Site Metadata Error" description={metaError} /> : null}
            {searchError ? <Alert type="error" showIcon message="Search Error" description={searchError} /> : null}
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

const searchResultItemShape = PropTypes.shape({
    name: PropTypes.string,
    url_name: PropTypes.string,
    pk: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    matching_fields: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.string,
    })),
});

App.propTypes = {
    authError: PropTypes.string,
    isAuthenticating: PropTypes.bool,
    tokens: PropTypes.shape({
        refresh: PropTypes.string,
        access: PropTypes.string,
    }),

    metaError: PropTypes.string,
    isFetchingMeta: PropTypes.bool,
    meta: PropTypes.shape({
        site_name: PropTypes.string,
    }),

    searchError: PropTypes.string,
    isFetchingSearch: PropTypes.bool,
    searchResults: PropTypes.shape({
        barcodes: PropTypes.arrayOf(searchResultItemShape),
        full_text: PropTypes.arrayOf(searchResultItemShape),
    }),

    setRefreshToken: PropTypes.func,
    refreshOrInvalidateAuth: PropTypes.func,
    fetchSiteMetaIfNeeded: PropTypes.func,
    performSearch: PropTypes.func,
};

const mapStateToProps = state => ({
    authError: state.auth.errorMessage,
    isAuthenticating: state.auth.isAuthenticating,
    tokens: state.auth.tokens,

    metaError: state.meta.errorMessage,
    isFetchingMeta: state.meta.isFetching,
    meta: state.meta.data,

    searchError: state.search.errorMessage,
    isFetchingSearch: state.search.isFetching,
    searchResults: state.search.results,
});

export default connect(mapStateToProps, {
    setRefreshToken,
    refreshOrInvalidateAuth,
    fetchSiteMetaIfNeeded,
    performSearch,
})(App);

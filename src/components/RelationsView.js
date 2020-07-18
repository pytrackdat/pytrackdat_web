import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {PageHeader, Tabs} from "antd";
import "antd/es/page-header/style/css";
import "antd/es/tabs/style/css";

import {fetchDataType} from "../actions";

import RelationTable from "./RelationTable";

const RelationsView = ({relations, dataByType, fetchDataType}) => {
    return <PageHeader title="Relations" subTitle="Data types in the PyTrackDat instance" style={{background: "white"}}>
        <Tabs>
            {(relations || []).map(r => {
                const data = dataByType[r.name_lower] || {};
                return <Tabs.TabPane tab={r.name_lower} key={r.name_lower}>
                    <RelationTable relation={r}
                                   dataSource={data.data || []}
                                   count={data.count || 0}
                                   offset={data.offset || 0}
                                   limit={data.limit || 100}
                                   loading={data.isFetching === undefined ? true : data.isFetching}
                                   loadPage={fetchDataType}
                    />
                </Tabs.TabPane>;
            })}
        </Tabs>
    </PageHeader>;
};

RelationsView.propTypes = {
    isFetchingMeta: PropTypes.bool,
    relations: PropTypes.arrayOf(PropTypes.shape({
        id_type: PropTypes.string,
        name: PropTypes.string,
        name_lower: PropTypes.string,
        fields: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    })),
};

const mapStateToProps = state => ({
    isFetchingMeta: state.meta.isFetching,
    relations: state.meta.data.relations,
    dataByType: state.data.dataByType,
});

export default connect(mapStateToProps, {fetchDataType})(RelationsView);

import React, {useState} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {PageHeader, Radio, Tabs} from "antd";

import {fetchDataType} from "../actions";

import RelationTable from "./RelationTable";
import RelationMap from "./RelationMap";
import {DATA_TYPES_SPEC} from "../constants";

const VIEW_TABLE = "table";
const VIEW_MAP = "map";

const VIEW_COMPONENTS = {
    [VIEW_TABLE]: RelationTable,
    [VIEW_MAP]: RelationMap,
};

const RelationsView = ({relations, dataByType, fetchDataType}) => {
    // TODO: Routed
    const [currentRelation, setCurrentRelation] = useState(((relations || [])[0] || {}).name_lower);
    const [currentView, setCurrentView] = useState(VIEW_TABLE);

    const isGis = !!(relations || []).filter(r =>
        (r.fields || []).filter(f => DATA_TYPES_SPEC[f.data_type].gis).length).length;

    const ViewComponent = VIEW_COMPONENTS[currentView];

    return <PageHeader title="Relations"
                       subTitle="Data types in the PyTrackDat instance"
                       extra={[
                           <Radio.Group key="viewMode" optionType="button" options={[
                               {label: "Table", value: VIEW_TABLE},
                               {label: "Map", value: VIEW_MAP, disabled: !isGis},
                           ]} onChange={e => {
                               setCurrentView(e.target.value);
                           }} value={currentView} />
                       ]}
                       style={{background: "white"}}>
        <Tabs activeKey={currentRelation} onChange={setCurrentRelation}>
            {(relations || []).map(r => {
                const data = dataByType[r.name_lower] || {};
                const viewProps = {
                    relation: r,
                    data: data.data || [],
                    count: data.count || 0,
                    offset: data.offset || 0,
                    limit: data.limit || 100,
                    loading: data.isFetching === undefined ? true : data.isFetching,
                    filters: data.filters || {},
                    sorter: data.sorter || null,
                    loadPage: fetchDataType,
                };

                return <Tabs.TabPane tab={r.name_lower} key={r.name_lower}>
                    {/* TODO: Don't have one map/table per relation */}
                    <RelationTable {...viewProps} visible={currentView===VIEW_TABLE} />
                    <RelationMap {...viewProps} visible={currentView===VIEW_MAP} />
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

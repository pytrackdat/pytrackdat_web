import React from "react";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";
import {useHistory, useParams} from "react-router-dom";

import {Descriptions, PageHeader} from "antd";

import {DATA_TYPES_SPEC} from "../constants";
import {getPK} from "../utils";

const stringify = v => {
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (typeof v === "string") return v;
    if (["number", "boolean"].includes(v)) return v.toString();
    return JSON.stringify(v, null, 2);
};

const renderField = (f, v) => {
    console.log(f, v);
    if (f.data_type === "text" && f.additional_fields.length === 0) return stringify(v);
    if (f.data_type === "point") return <pre>{stringify(v)}</pre>
    return <span style={{whiteSpace: "nowrap"}}>{stringify(v)}</span>;
};

const ItemView = () => {
    // const {path} = useRouteMatch();
    const history = useHistory();
    const {relationName, itemPK} = useParams();
    const relations = useSelector(state => state.meta.data.relations) || [];
    const dataByType = useSelector(state => state.data.dataByType);

    // TODO: Different logic for deciding to render a map
    const isGis = !!relations.filter(r =>
        (r.fields || []).filter(f => DATA_TYPES_SPEC[f.data_type].gis).length).length;

    const relation = relations.find(f => f.name_lower === relationName);
    const pk = getPK(relation);

    if (!pk) {
        // TODO: Nice Loading screen
        return <div>Loading...</div>;
    }

    const fields = Object.fromEntries(((relation.fields || {}) || []).map(f => [f.name, f]));

    // TODO: This relies on the item being loaded in the current page; load it via the API instead.
    const data = dataByType[relationName] || {};
    const item = (data.data || []).find(i => i[pk.name].toString() === itemPK) || {};
    console.log(relation, item);

    // TODO: 404

    return <PageHeader title={`${relation.name_lower}: ${itemPK}`}
                       subTitle={`Record for the ${itemPK} record in the ${relation.name_lower} record`}
                       onBack={() => history.push({pathname: `/relations/${relation.name_lower}`})}
                       style={{background: "white"}}>
        <Descriptions bordered>
            {Object.entries(item).map(([k, v]) => <Descriptions.Item key={k} label={k}>
                {renderField(fields[k], v)}
            </Descriptions.Item>)}
        </Descriptions>
    </PageHeader>;
};

ItemView.propTypes = {
    isFetchingMeta: PropTypes.bool,
    relations: PropTypes.arrayOf(PropTypes.shape({
        id_type: PropTypes.string,
        name: PropTypes.string,
        name_lower: PropTypes.string,
        fields: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    })),
};

export default ItemView;

import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

import {Col, Pagination, Row, Spin, Tree, Typography} from "antd";

import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import icon2X from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import {MAPBOX_ACCESS_TOKEN} from "../config";
import {PAGE_SIZE_OPTIONS} from "../constants";
import {isKey} from "../utils";

// https://github.com/Leaflet/Leaflet/issues/4968
// Fix default marker icon (thanks crob611)
leaflet.Marker.prototype.options.icon = leaflet.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2X,
    iconSize: {x: 25, y: 41},
    iconAnchor: {x: 12, y: 41},
    // shadowSize: {x: 25, y: 41},
    shadowUrl: iconShadow,
});

const LAYER_MAPBOX_BASE_MAP = "mapbox";

const onPointFeature = (feature, layer) => {
    // TODO: Tabular data
    layer.bindPopup(`<strong>${feature.properties.title}</strong>
<table>
<thead><tr><th>Field</th><th>Value</th></tr></thead>
<tbody>
${feature.properties.table.map(([k, v]) => "<tr><td>" + k + "</td><td>" 
        + JSON.stringify(v) + "</td></tr>").join("")}
</tbody>
</table>`, {
        offset: {x: 0, y: -34}
    });
};

const TILE_LAYER_URL_TEMPLATE = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";

const RelationMap = ({relation, data, count, offset, limit, loading, filters, sorter, loadPage, visible}) => {
    const mapEl = useRef(null);
    const [sMap, setSMap] = useState(null);
    const [visibleLayers, setVisibleLayers] = useState([LAYER_MAPBOX_BASE_MAP]);

    const loadNewData = (current, pageSize) => {
        loadPage(relation.name_lower, pageSize * (current - 1), pageSize, filters, sorter);
    };

    const fields = (relation || {}).fields || [];
    const tableFields = fields.filter(f => f.show_in_table || isKey(f));
    const tableFieldNames = tableFields.map(f => f.name);
    const pointFields = fields.filter(f => f.data_type === "point");

    useEffect(() => {
        if (!mapEl.current) return;

        let initial = false;
        let lMap = null;

        if (sMap) {
            sMap.eachLayer(l => l instanceof leaflet.TileLayer || l.remove());
            lMap = sMap;
        } else {
            // TODO: Don't focus always on Canada
            lMap = leaflet.map(mapEl.current).setView([68,-92], 3.5);
            leaflet.tileLayer(TILE_LAYER_URL_TEMPLATE, {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © ' +
                    '<a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: MAPBOX_ACCESS_TOKEN,
            }).addTo(lMap);
            initial = true;
        }

        // Primary key
        const pk = (relation || {}).fields.filter(isKey)[0] || {};

        // Point layers
        const pointSets = pointFields.map(f => data.map(e => ({
            type: "Feature",
            properties: {
                title: e[pk.name],
                table: Object.entries(e).filter(([k, _v]) => tableFieldNames.includes(k)),
            },  // TODO: Tabular data with all fields
            geometry: e[f.name]
        })).filter(e => e.geometry[0] !== 0));  // Filter out ""null"" (0, 0) points

        pointSets.forEach(ps => {
            leaflet.geoJSON(ps, {onEachFeature: onPointFeature}).addTo(lMap);
        });

        // TODO: All coordinates (different colours depending on column), record info, etc.
        // TODO: Shapes, etc.

        setSMap(lMap);

        if (initial) {
            setVisibleLayers([LAYER_MAPBOX_BASE_MAP, ...pointFields.map(f => f.name)]);
        }
    }, [data, loading])

    // TODO: Layer views (colours, shapes, points / column, record info
    // TODO: Layer list on side - hide/show

    const layerTreeData = [
        ...pointFields.map(f => ({
            title: f.name,
            key: f.name,
        })),

        // TODO: FK-related fields...

        {
            title: "Base Maps",
            key: "base_maps",
            checkable: false,
            children: [
                {
                    title: "Mapbox",
                    key: "mapbox",
                    disableCheckbox: true,
                }
            ],
        }
    ];

    return <div style={visible ? {height: "auto"} : {height: 0, overflow: "hidden"}} aria-hidden={!visible}>
        <Spin spinning={loading}>
            <Row>
                <Col span={6} style={{padding: "0 16px"}}>
                    <Typography.Title level={4}>Layers</Typography.Title>
                    <Tree checkable
                          autoExpandParent
                          expandedKeys={["base_maps"]}
                          checkedKeys={visibleLayers}
                          treeData={layerTreeData} />
                </Col>
                <Col span={18}>
                    <Typography.Title level={4}>Map</Typography.Title>
                    <div ref={mapEl} style={{height: 500}} />
                </Col>
            </Row>
        </Spin>
        {loading ? null : (
            <Pagination size="small"
                        showSizeChanger
                        onShowSizeChange={loadNewData}
                        current={1 + Math.floor(offset / limit)}
                        pageSize={limit}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        total={count}
                        onChange={loadNewData}
                        style={{float: "right", clear: "both", margin: "16px 0"}}
            />
        )}
    </div>;
};

RelationMap.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
}

export default RelationMap;

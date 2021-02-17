import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

import {Pagination, Spin} from "antd";

import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
// import icon2X from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import {MAPBOX_ACCESS_TOKEN} from "../config";
import {isKey} from "../utils";
import {PAGE_SIZE_OPTIONS} from "../constants";

// https://github.com/Leaflet/Leaflet/issues/4968
// Fix default marker icon (thanks crob611)
leaflet.Marker.prototype.options.icon = leaflet.icon({
    iconUrl: icon,
    // iconRetinaUrl: icon2X,
    shadowUrl: iconShadow,
})

const onPointFeature = (feature, layer) => {
    // TODO: Tabular data
    layer.bindPopup(`<strong>${feature.properties.title}</strong>`);
};

const TILE_LAYER_URL_TEMPLATE = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";

const RelationMap = ({relation, data, count, offset, limit, loading, filters, sorter, loadPage, visible}) => {
    const mapEl = useRef(null);
    const [sMap, setSMap] = useState(null);

    const loadNewData = (current, pageSize) => {
        loadPage(relation.name_lower, pageSize * (current - 1), pageSize, filters, sorter);
    };

    useEffect(() => {
        if (!mapEl.current) return;

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
        }

        // Primary key
        const pk = (relation || {}).fields.filter(isKey)[0] || {};

        // Point layers
        const pointFields = (relation || {}).fields.filter(f => f.data_type === "point");
        const pointSets = pointFields.map(f => data.map(e => ({
            type: "Feature",
            properties: {title: e[pk.name]},  // TODO: Tabular data with all fields
            geometry: e[f.name]
        })).filter(e => e.geometry[0] !== 0));  // Filter out ""null"" (0, 0) points

        pointSets.forEach(ps => {
            leaflet.geoJSON(ps, {onEachFeature: onPointFeature}).addTo(lMap);
        });

        // TODO: All coordinates (different colours depending on column), record info, etc.
        // TODO: Shapes, etc.

        setSMap(lMap);
    }, [data, loading])

    // TODO: Layer views (colours, shapes, points / column, record info
    // TODO: Layer list on side - hide/show

    return <div style={{display: visible ? "block" : "none"}}>
        <Spin spinning={loading}>
            <div ref={mapEl} style={{height: 500}} />
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

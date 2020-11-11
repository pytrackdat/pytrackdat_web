import React, {useEffect, useRef} from "react";
import PropTypes from "prop-types";

import leaflet from "leaflet";

import {MAPBOX_ACCESS_TOKEN} from "../config";
import {isKey} from "../utils";

const TILE_LAYER_URL_TEMPLATE = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";

const onPointFeature = (feature, layer) => {
    // TODO: Tabular data
    layer.bindPopup(`<strong>${feature.properties.title}</strong>`);
};

const RelationMap = ({relation, data, loading}) => {
    const mapEl = useRef(null);

    useEffect(() => {
        if (!mapEl.current) return;
        // TODO: Clear map of old stuff
        // TODO: Don't focus always on Canada
        const lMap = leaflet.map(mapEl).setView([68,-92], 3.5);
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

        // Primary key
        const pk = (relation || {}).fields.filter(isKey)[0] || {};

        // Point layers
        const pointFields = (relation || {}).fields.filter(f => f.data_type === "point");
        const pointSets = pointFields.map(f => data.map(e => ({
            type: "Feature",
            properties: {title: e[pk.name]},  // TODO: Tabular data with all fields
            geometry: e[f]
        })));

        pointSets.forEach(ps => {
            leaflet.geoJSON(ps, {onEachFeature: onPointFeature});
        });

        // TODO: All coordinates (different colours depending on column), record info, etc.
        // TODO: Shapes, etc.
    }, [data, loading])

    return <div ref={mapEl} style={{height: 600}} />;
};

RelationMap.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
}

export default RelationMap;

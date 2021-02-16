import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import icon2X from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import {MAPBOX_ACCESS_TOKEN} from "../config";
import {isKey} from "../utils";

// https://github.com/Leaflet/Leaflet/issues/4968
// Fix default marker icon (thanks crob611)
leaflet.Marker.prototype.options.icon = leaflet.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2X,
    shadowUrl: iconShadow,
})

const onPointFeature = (feature, layer) => {
    // TODO: Tabular data
    layer.bindPopup(`<strong>${feature.properties.title}</strong>`);
};

const TILE_LAYER_URL_TEMPLATE = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";

const RelationMap = ({relation, data, loading, visible}) => {
    const mapEl = useRef(null);
    const [sMap, setSMap] = useState(null);

    useEffect(() => {
        if (!mapEl.current) return;

        let lMap = null;

        if (sMap) {
            sMap.eachLayer(l => {
                l.remove();
            });
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

    return <div ref={mapEl} style={{height: 500, display: visible ? "block" : "none"}} />;
};

RelationMap.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
}

export default RelationMap;

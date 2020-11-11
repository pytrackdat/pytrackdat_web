export const DATA_TYPES_SPEC = {
    "auto key": {key: true, sortable: true},
    "manual key": {key: true, sortable: true},
    "integer": {sortable: true},
    "float": {sortable: true},
    "decimal": {sortable: true},
    "boolean": {sortable: false},
    "text": {sortable: true},
    "date": {sortable: true},
    "time": {sortable: true},
    "foreign key": {sortable: true},

    "point": {sortable: false, gis: true},
    "line string": {sortable: false, gis: true},
    "polygon": {sortable: false, gis: true},
    "multi point": {sortable: false, gis: true},
    "multi line string": {sortable: false, gis: true},
    "multi polygon": {sortable: false, gis: true},
};

export const DATA_TYPES = Object.keys(DATA_TYPES_SPEC);
export const KEY_TYPES = Object.entries(DATA_TYPES_SPEC).filter(e => e[1].key).map(e => e[0]);
export const SORTABLE_TYPES = Object.entries(DATA_TYPES_SPEC).filter(e => e[1].sortable).map(e => e[0]);

import React, {useEffect} from "react";
import PropTypes from "prop-types";

import {Table} from "antd";
import "antd/es/table/style/css";

const RelationTable = ({relation, dataSource, count, offset, limit, loading, loadPage}) => {
    useEffect(() => {
        loadPage(relation.name_lower, offset || 0, limit);
    }, [relation]);

    // noinspection JSUnusedGlobalSymbols
    const colSpec = ((relation || {}).fields || [])
        .filter(f => f.show_in_table || ["auto key", "manual key"].includes(f.data_type))
        .map(f => ({
            title: f.name,
            dataIndex: f.name,
            ...(f.choices ? {
                filters: f.choices.map(c => ({
                    text: c,
                    value: c,
                })),
                onFilter: (value, record) => record[f.name] === value,
            } : {}),
            ...(f.data_type === "point" ? {
                render: d => (JSON.stringify(d.coordinates) === "[0,0]" ? "" : JSON.stringify(d.coordinates))
            } : {}),
        }));

    // noinspection JSUnusedGlobalSymbols
    return <Table size="middle"
                  bordered={true}
                  columns={colSpec}
                  dataSource={dataSource}
                  loading={loading}
                  pagination={{
                      current: 1 + Math.floor(offset / limit),
                      pageSize: limit,
                      pageSizeOptions: [50, 100, 250],
                      total: count,
                      onChange: (page, pageSize) => {
                          loadPage(relation.name_lower, (page - 1) * pageSize, pageSize);  // TODO: Sort
                      },
                  }} />;
};

RelationTable.propTypes = {
    relation: PropTypes.shape({
        fields: PropTypes.arrayOf(PropTypes.shape({
            additional_fields: PropTypes.arrayOf(PropTypes.string),
            choices: PropTypes.arrayOf(PropTypes.string),
            csv_names: PropTypes.arrayOf(PropTypes.string),
            data_type: PropTypes.oneOf([
                "auto key",
                "manual key",
                "integer",
                "float",
                "decimal",
                "boolean",
                "text",
                "date",
                "time",
                "foreign key",

                "point",
                "line string",
                "polygon",
                "multi point",
                "multi line string",
                "multi polygon",
            ]),
            // TODO: Default
            description: PropTypes.string,
            name: PropTypes.string,
            null_values: PropTypes.arrayOf(PropTypes.string),
            nullable: PropTypes.bool,
            show_in_table: PropTypes.bool,
        })),
    }),
};

export default RelationTable;

/*
meta: PropTypes.shape({
        relations: PropTypes.arrayOf(PropTypes.shape({
            fields:
        }))
    })
 */

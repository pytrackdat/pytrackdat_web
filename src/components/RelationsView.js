import React from "react";
import {useSelector} from "react-redux";
import {Redirect, Route, Switch, useRouteMatch} from "react-router-dom";

import InnerRelationsView from "./InnerRelationsView";
import ItemView from "./ItemView";

const RelationsView = () => {
    const {path} = useRouteMatch();
    const availableRelations = useSelector(state => state.meta.data.relations) || [];

    return <Switch>
        <Route exact path={`${path}/:relationName`}>
            <InnerRelationsView />
        </Route>
        <Route exact path={`${path}/:relationName/items/:itemPK`}>
            <ItemView />
        </Route>
        {availableRelations.length
            ? <Redirect from={path} to={{pathname: `${path}/${availableRelations[0].name_lower}`}} />
            : null}
        <Route exact path={path}>
            <div>Loading...</div>
        </Route>
    </Switch>;
};

export default RelationsView;

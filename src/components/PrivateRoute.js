import React from "react";
import {useSelector} from "react-redux";
import {Redirect, Route} from "react-router-dom";

const PrivateRoute = ({children, ...rest}) => {
    const auth = useSelector(state => state.auth);
    // TODO: Redirect to previous page
    return <Route {...rest} render={({location}) =>
        auth.tokens.refresh ? children : <Redirect to={{pathname: "/sign-in", state: {from: location}}} />} />;
};

export default PrivateRoute;

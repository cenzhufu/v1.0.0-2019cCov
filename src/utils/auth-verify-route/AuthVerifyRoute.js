import * as React from "react";
import { Route, Redirect } from "react-router-dom";
// import LoginStateManager from 'stutils/login-state';
import Cookies from "js-cookie";
// import { RouteProps } from 'react-router';
const user = Cookies.get("userInfo");
let isLogin = false;
if (user) {
  isLogin = true;
}
// Cookies.get
const AuthVerifyRoute = props => {
  let { component: Component, ...rest } = props;

  return (
    <Route
      {...rest}
      render={props =>
        isLogin ? (
          // @ts-ignore
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default AuthVerifyRoute;

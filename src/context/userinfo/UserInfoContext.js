import * as React from "react";

let defaultUserInfo = {};

const UserInfoContext = React.createContext({
  userInfo: defaultUserInfo,
  loginIn: loginInfo => {},
  logOut: () => {},
  updateUserInfo: info => {}
});

function withUserInfo(Component) {
  return function UserInfoComponent(props) {
    return (
      <UserInfoContext.Consumer>
        {({ userInfo, loginIn, logOut, updateUserInfo }) => {
          return (
            <Component
              loginIn={loginIn}
              logOut={logOut}
              userInfo={userInfo}
              updateUserInfo={updateUserInfo}
              {...props}
            />
          );
        }}
      </UserInfoContext.Consumer>
    );
  };
}

export default UserInfoContext;
export { withUserInfo };

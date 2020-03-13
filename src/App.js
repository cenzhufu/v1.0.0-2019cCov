import * as React from "react";
import {
  Route,
  Redirect,
  Switch,
  withRouter,
  BrowserRouter,
} from "react-router-dom";
import { UserInfoContext } from "./context";
import { message } from "antd";
import request from "./utils/request";
import api from "./utils/api";
import moment from "moment";
import * as intl from "react-intl-universal";
import "moment/locale/zh-cn";
import Cookies from "js-cookie";
import Login from "./pages/Login";
import Home from "./pages/home";
import "./App.css";
import "animate.css";

const lang = window.config.defaultLanguage.toLowerCase();
moment.locale(lang);
const MAX_COUNT = 1;
const COOKIES_EXPIRES = window.config.keepLoginTime; //cookies半小时有效
class App extends React.Component {
  state = {
    userInfo: Cookies.get("userInfo")
      ? JSON.parse(Cookies.get("userInfo"))
      : {},
  };

  componentDidMount() {
    // NOTE: 全局的配置
    message.config({
      duration: 2,
      maxCount: MAX_COUNT,
    });
  }

  /**
   * 登录
   * @memberof App
   */
  login = (loginInfo, token) => {
    console.log("czf_登录成功用户信息", loginInfo);
    Cookies.set("userInfo", loginInfo, { expires: COOKIES_EXPIRES });
    Cookies.set("token", token, { expires: COOKIES_EXPIRES });
    this.setState({
      userInfo: loginInfo,
    });
    this.props.history.replace("/home");
    window.location.reload();
  };

  /**
   * 退出登录
   */
  logOut = callback => {
    request
      .post(api.logOut)
      .then(res => {
        console.log("dddd");

        const data = res.data;
        if (data.code === 0) {
          Cookies.remove("userInfo");
          Cookies.remove("token");
          this.setState({
            userInfo: {},
          });
          this.props.history.replace("/login");
        } else {
          message.error(intl.get("d").d("退出登录失败，请稍后再试"));
        }
      })
      .catch(error => {
        message.error(intl.get("d").d("退出登录失败，请稍后再试"));
        console.error(error);
        callback(false);
      });
  };

  /**
   *更新账号信息
   * @param {*} info
   */
  updateUserInfo = info => {
    this.setState(prevState => {
      if (prevState.userInfo) {
        return {
          userInfo: { ...prevState.userInfo, ...info },
        };
      } else {
        return {};
      }
    });
  };

  render() {
    const { userInfo } = this.state;
    const provider = {
      userInfo: userInfo,
      loginIn: this.login,
      logOut: this.logOut,
      updateUserInfo: this.updateUserInfo,
    };

    let login = true; 
    // const arr = Object.keys(userInfo);
    // if (arr.length === 0) {
    //   login = false;
    // }
 
    return (
      <UserInfoContext.Provider value={provider}>
        <div style={{ height: "100%" }}>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route
                path="/home"
                render={props =>
                  login ? (
                    <Home />
                  ) : (
                    <Redirect
                      to={{
                        pathname: "/login",
                      }}
                    />
                  )
                }
              />
            </Switch>
          </BrowserRouter>
        </div>
      </UserInfoContext.Provider>
    );
  }
}

export default withRouter(App);

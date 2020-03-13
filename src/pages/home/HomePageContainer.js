import * as React from "react";
import { withUserInfo } from "../../context";
import { Layout } from "antd";
// import * as intl from "react-intl-universal";

// import HomePage from "./HomePage";
import TemperatureMonitor from "../temperatureMonitor";
// import SeetingContainer from "../seeting";
import { NavigationBar } from "./views";

// import { guid } from "utils/guid";

// import "./assets/styles/imdex.scss";

const { Content, Header } = Layout;

class HomePageContainer extends React.Component {
  state = {
    showModal: "moniterModel",
    haveAlarm: false //是否有告警
  };

  /**
   * 查看体温监测 or 人员登记
   * @memberof HomePageContainer
   */
  handleClickNavBar = viewModel => {
    // let showModal = "home";
    // if (navItem === "showRecord") {
    //   showModal = "record";
    // }

    // if (navItem === "returnHome") {
    //   showModal = "home";
    // }
    this.setState({
      showModal: viewModel
    });
  };

  handleNotificationAlert = haveAlarm => {
    this.setState({
      haveAlarm
    });
  };

  render() {
    // const { userInfo } = this.props
    const { showModal, haveAlarm } = this.state;
    return (
      <Layout
        style={{
          height: "100%",
          minWidth: "1080px",
          position: "relative"
          // minHeight: "800px"
        }}
        className="home-pages-container"
      >
        <Header className="header">
          <NavigationBar
            onClick={this.handleClickNavBar}
            haveAlarm={haveAlarm}
          />
        </Header>
        <Content
          style={{
            height: "100%"
            // background: "#fff"
          }}
        >
          {showModal === "moniterModel" && (
            <TemperatureMonitor
              handleNotificationAlert={this.handleNotificationAlert}
            />
          )}
          {/* {showModal === "moniterModel" && <HomePage />} */}
        </Content>
      </Layout>
    );
  }
}

export default withUserInfo(HomePageContainer);

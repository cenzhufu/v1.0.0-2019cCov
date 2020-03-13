import * as React from "react";
import { Layout, Menu, Icon } from "antd";
import * as intl from "react-intl-universal";
import RecordPanel from "./views/RecordPanel";
import "./assets/styles/index.scss";

const { Sider, Content } = Layout;

class SeetingContainer extends React.Component {
  render() {
    return (
      <Layout style={{ height: "100%" }} className="seeting-container">
        <Sider width={260} className="seeting-sider">
          <Menu mode="inline" theme="dark" defaultSelectedKeys={["record"]}>
            <Menu.Item key="record">
              <Icon type="user" />
              <span className="nav-text">{intl.get("dd").d("操作记录")}</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content
          style={{
            height: "100%",
            padding: "20px 30px",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            overflowY: "hidden",
          }}
        >
          <RecordPanel />
        </Content>
      </Layout>
    );
  }
}
export default SeetingContainer;

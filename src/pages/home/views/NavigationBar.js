import * as React from "react";
import * as intl from "react-intl-universal";
import { withRouter } from "react-router-dom";
import { withUserInfo } from "../../..//context";
import { Avatar, Badge, Modal, Input, message, Icon } from "antd";
import logo from "./assets/images/LOGO.png";
import * as PropTypes from "prop-types";
// import api from "utils/api";
import request from "../../../utils/request";
import api from "../../../utils/api";

import "./assets/styles/navigationBar.scss";
import AddAccount from "./AddAccount";

const SYSTEM_NAME = window.config.systemName;

class NavigationBar extends React.Component {
  state = {
    visible: false,
    passwordError: false,
    newPassword: "",
    showReturnBtn: false,
    viewModel: "moniterModel"
  };

  static defaultProps = {
    userInfo: {},
    haveAlarm: false,
    onClick: navItem => {}
  };
  // //如果传递该属性，该属性值必须为字符串
  static propTypes = {
    userInfo: PropTypes.object.isRequired,
    onClick: PropTypes.func
    // userAvatar: PropTypes.string
  };
  AddAccountForm = React.createRef();
  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  /**
   * 查看操作记录
   * @memberof NavigationBar
   */
  handleShowRecord = () => {
    const { onClick } = this.props;
    if (onClick) {
      onClick("showRecord");
    }
    this.setState({
      showReturnBtn: true
    });
  };

  handleReturnHome = () => {
    const { onClick } = this.props;
    if (onClick) {
      onClick("returnHome");
    }
    this.setState({
      showReturnBtn: false
    });
  };

  /**
   * 退出登录
   */
  handleLogOut = () => {
    const { logOut } = this.props;
    logOut(successed => {
      if (successed) {
        this.props.history.replace("/login");
      }
    });
  };
  /**
   * 点击修改密码
   */
  handleClickPassword = () => {
    // const { onClick } = this.props;
    this.setState({
      visible: true
    });
    // if (onClick) {
    //   onClick("changePassword");
    // }
  };

  /**
   * 输入密码
   * @memberof NavigationBar
   */
  onChangeNewPassword = e => {
    this.setState({
      newPassword: e.target.value,
      passwordError: false
    });
  };

  /**
   * 点击确认修改密码
   * @param {*} e
   */
  handleOk = () => {
    const { userInfo } = this.props;
    const { newPassword } = this.state;
    console.log("userInfo", userInfo);

    if (!newPassword.trim()) {
      this.setState({
        passwordError: true
      });
      return;
    }

    const data = {
      password: newPassword.trim()
    };

    request
      .put(`/admin/user/password/update/${userInfo.id}`, data)
      .then(res => {
        const resData = res.data;
        // const { data } = resData;
        if (resData.code === 0) {
          message.success(intl.get("d").d("密码修改成功"));
          this.setState({
            visible: false,
            newPassword: ""
          });
        } else if (resData.code === 1001) {
          message.warning(intl.get("s").d(resData.message));
        } else {
          message.warning(intl.get("s").d("密码修改失败，请稍后再试"));
        }
      })
      .catch(error => {
        message.error("密码修改失败，请稍后再试");
      });
  };

  /**
   * 关闭对话框
   * @memberof NavigationBar
   */
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
      passwordError: false
    });
  };
  /**
   * 添加账号，管理员可见
   */
  handleAddAccount = () => {
    //重置表单
    if (this.AddAccountForm.props) this.AddAccountForm.props.form.resetFields();
    this.setState({
      addAccountVisible: true
    });
  };
  /**
   * 添加账号提交
   */
  AddAccountSubmit = () => {
    this.AddAccountForm.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          contractName: values.contractName,
          partnerName: values.contractName,
          loginName: values.loginName,
          password: values.password,
          roleId: values.roleId,
          departmentId: 0
        };

        return request
          .post(api.addaccount, data)
          .then(res => {
            const data = res.data;
            message.destroy();
            if (data.code === 0 && data.data) {
              message.success(intl.get("d").d("添加成功"));
              this.setState({
                addAccountVisible: false
              });
            } else if (data.code === 1000) {
              message.error(intl.get("d").d(data.message));
            } else {
              message.error(intl.get("d").d(data.message));
            }
          })
          .catch(err => {
            message.error("系统繁忙，请稍后再试");
            console.error(err);
          });
      }
    });
  };

  /**
   * 修改查看模块
   * @param {*} viewModel
   */
  handleChangeViewMode = viewModel => {
    if (viewModel === "moniterModel") {
      this.setState({
        viewModel
      });
      const { onClick } = this.props;
      if (onClick) {
        onClick(viewModel);
      }
    }
  };

  render() {
    const { userInfo } = this.props;

    const {
      visible,
      passwordError,
      newPassword,
      showReturnBtn,
      addAccountVisible,
      viewModel
    } = this.state;
    const { userAvatar, userName, loginName } = userInfo;

    const content =
      userInfo && userInfo.roleId == 1 ? (
        <div className="nav-heade-item-container">
          <div className="nav-heade-item" onClick={this.handleShowRecord}>
            {intl.get("d").d("操作记录")}
          </div>
          <div className="nav-heade-item" onClick={this.handleAddAccount}>
            {intl.get("d").d("添加账号")}
          </div>
          <div className="nav-heade-item" onClick={this.handleClickPassword}>
            {intl.get("d").d("修改密码")}
          </div>
          <div className="nav-heade-item" onClick={this.handleLogOut}>
            {intl.get("d").d("退出登录")}
          </div>
        </div>
      ) : (
        <div className="nav-heade-item-container">
          <div className="nav-heade-item" onClick={this.handleShowRecord}>
            {intl.get("d").d("操作记录")}
          </div>
          <div className="nav-heade-item" onClick={this.handleClickPassword}>
            {intl.get("d").d("修改密码")}
          </div>
          <div className="nav-heade-item" onClick={this.handleLogOut}>
            {intl.get("d").d("退出登录")}
          </div>
        </div>
      );

    console.log("userInfo", userInfo);

    return (
      <div className="nav-header-container">
        <div className="logo-wrap">
          <img src={logo} alt="" />
          <span style={{ marginLeft: "10px", fontSize: "20px", color: "gray" }}>
            |
          </span>
          <span className="logo-title">{intl.get("ss").d(SYSTEM_NAME)}</span>
        </div>

        {/*
        <div className="nav-user-center">
          <div className="nav-tabs">
            {/* <div
              className={
                viewModel === "moniterModel"
                  ? "nav-tab-item nav-tab-active"
                  : "nav-tab-item"
              }
              onClick={this.handleChangeViewMode.bind(this, "moniterModel")}
            >
              {intl.get("d").d("体温监测")}
            </div>
            <div
              title="开发中,敬请期待"
              style={{
                color: "gray",
                opacity: "0.8"
              }}
              className={
                viewModel === "registerModel"
                  ? "nav-tab-item nav-tab-active"
                  : "nav-tab-item"
              }
              onClick={this.handleChangeViewMode.bind(this, "registerModel")}
            >
              {intl.get("d").d("人员登记")}
            </div>

            <i
              style={{ position: "relative", top: "4px", marginRight: "50px" }}
            >
              {this.props.haveAlarm ? (
                <Badge dot>
                  <Icon type="bell" style={{ fontSize: "24px" }} />
                </Badge>
              ) : (
                <Icon type="bell" style={{ fontSize: "24px" }} />
              )}
            </i>
          </div>

          {/* <Popover trigger="hover" content={content}>
          <div className="user-wrap">
            <Avatar size={40} icon="user" src={userAvatar ? userAvatar : ""} />
            <span className="user-name">
              {userName
                ? userName
                : loginName
                ? loginName
                : intl.get("c").d("请登录")}
            </span>
          </div>
          {/* </Popover>
        </div>
        <Modal
          title={intl.get("ff").d("添加账号")}
          visible={addAccountVisible}
          centered={true}
          maskClosable={false}
          onOk={this.AddAccountSubmit}
          okText={intl.get("ff").d("确认")}
          cancelText={intl.get("ff").d("取消")}
          onCancel={() => {
            this.setState({
              addAccountVisible: false
            });
          }}
        >
          <AddAccount
            wrappedComponentRef={ref => (this.AddAccountForm = ref)}
          />
        </Modal>
        <Modal
          title={intl.get("ff").d("修改密码")}
          visible={visible}
          centered={true}
          maskClosable={false}
          onOk={this.handleOk}
          okText={intl.get("ff").d("确认")}
          cancelText={intl.get("ff").d("取消")}
          onCancel={this.handleCancel}
        >
          <div className="change-password-item">
            <span className="change-password-item-title">
              {intl.get("dd").d("用户名")} :
            </span>
            <Input
              disabled={true}
              value={userName ? userName : loginName ? loginName : ""}
            />
          </div>
          <div className="change-password-item">
            <span className="change-password-item-title">
              {intl.get("dd").d("新密码")} :
            </span>
            <Input
              type="password"
              value={newPassword}
              onChange={this.onChangeNewPassword}
              placeholder={intl.get("dd").d("请输入新密码")}
            />
          </div>

          <div className="password-error">
            {passwordError && (
              <span>{intl.get("ss").d("请输入6位数的数字或者字母")}</span>
            )}
          </div>
        </Modal>
        */}
      </div>
    );
  }
}

export default withRouter(withUserInfo(NavigationBar));

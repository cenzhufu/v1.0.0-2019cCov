import * as React from "react";
import { withUserInfo } from "../../context";
import { Form, Icon, Input, Button, Checkbox, message } from "antd";
import * as intl from "react-intl-universal";
import request from "../../utils/request";
import api from "../../utils/api";

import Logo from "./assets/images/logo1.png";
import "./assets/style/login.css";

const SYSTEM_NAME = window.config.systemName;
const COPY_RIGHT = window.config.copyRight;
class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isWrong: false,
      isRemember: true,
      accountErr: false,
      passwordErr: false,
    };
  }

  /**
   * 登点击录操作
   * @param {*} e
   */
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          username: values.userName,
          password: values.password,
        };

        request
          .post(api.login, data)
          .then(res => {
            const data = res.data;
            if (data.code === 0 && data.data) {
              this.props.loginIn(
                {
                  userName: data.data.contractName,
                  //TODO:
                  userAvatar: "",
                  ...data.data,
                },
                data.data.token
              );
            } else if (data.code === 1000) {
              message.error(intl.get("d").d(data.message));
            } else {
              message.error("登录失败");
            }
          })
          .catch(err => {
            message.error("系统繁忙，请稍后再试");
            console.error(err);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className={"login-form-container"}>
        <div className={"login-logo"}>
          <img src={Logo} alt="" />
        </div>
        <div className={"login-form"}>
          <Form
            onSubmit={this.handleSubmit}
            style={{
              padding: "40px 40px 10px 40px",
              background: "#fff",
            }}
          >
            <Form.Item>
              <div className={"login-title"}>
                {intl.get("ss").d(SYSTEM_NAME)}
              </div>
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("userName", {
                rules: [
                  {
                    required: true,
                    message: intl.get("dd").d("请输入正确账号"),
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon
                      type="user"
                      style={{
                        color: "rgba(0,0,0,.25)",
                      }}
                    />
                  }
                  placeholder={intl.get("dd").d("请输入用户名")}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("password", {
                rules: [
                  {
                    required: true,
                    message: intl.get("dd").d("请输入正确密码"),
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon
                      type="lock"
                      style={{
                        color: "rgba(0,0,0,.25)",
                      }}
                    />
                  }
                  type="password"
                  placeholder={intl.get("dd").d("请输入密码")}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("remember", {
                valuePropName: "checked",
                initialValue: true,
              })(
                <Checkbox className={"login-form-checked"}>
                  {intl.get("ww").d("记住密码")}
                </Checkbox>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                {intl.get("ww").d("登录")}
              </Button>
              {/* Or <a href="">register now!</a> */}
            </Form.Item>
          </Form>
        </div>
        <footer className={"copy-right-container"}>
          <p> {COPY_RIGHT} </p>
        </footer>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({
  name: "normal_login",
})(LoginPage);

export default withUserInfo(WrappedNormalLoginForm);

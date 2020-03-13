import * as React from "react";
import { Form, Input, Select } from "antd";
import * as intl from "react-intl-universal";

class AddAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contractName: "",
            partnerName: "",
            loginName: "",
            password: "",
            roleId: "",
            departmentId: 0
        };
    }
    userRole = [
        {
            id: 1,
            name: intl.get("d").d("超级管理员"),
            value: 1
        },
        {
            id: 2,
            name: intl.get("d").d("普通用户"),
            value: 2
        }
    ];
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3, offset: 3 },
            wrapperCol: { span: 14 }
        };

        return (
            <Form
                style={{
                    padding: "40px 40px 10px 40px",
                    background: "#fff",
                    width: "100%"
                }}
            >
                <Form.Item {...formItemLayout} label={intl.get("d").d("姓名")}>
                    {getFieldDecorator("contractName", {
                        rules: [
                            {
                                required: true,
                                message: intl.get("d").d("姓名必填")
                            },
                            {
                                pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{1,16}$|[a-zA-Z]{1,16}$/,
                                message: intl.get("d").d("请输入正确姓名")
                            }
                        ]
                    })(<Input maxLength={15} placeholder={intl.get("d").d("请输入姓名")} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label={intl.get("d").d("账号")}>
                    {getFieldDecorator("loginName", {
                        rules: [
                            {
                                required: true,
                                message: intl.get("d").d("账号必填")
                            },
                            {
                                pattern: /^[0-9a-zA-Z.@-]+$/,
                                message: intl.get("d").d("账号必须为数字,字母或.@-")
                            }
                        ]
                    })(<Input maxLength={15} placeholder={intl.get("d").d("请输入账号")} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label={intl.get("d").d("密码")}>
                    {getFieldDecorator("password", {
                        rules: [
                            {
                                required: true,
                                message: intl.get("d").d("密码必填")
                            },
                            {
                                pattern: /^[0-9a-zA-Z]+$/,
                                message: intl.get("d").d("密码必须为数字和字母")
                            }
                        ]
                    })(<Input maxLength={15} type="password" placeholder={intl.get("d").d("请输入密码")} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label={intl.get("d").d("权限")}>
                    {getFieldDecorator("roleId", {
                        rules: [
                            {
                                required: true,
                                message: intl.get("d").d("权限类型必选")
                            }
                        ]
                    })(
                        <Select placeholder={intl.get("d").d("请选择权限类型")}>
                            {this.userRole.map(item => (
                                <Select.Option value={item.value} key={item.id}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
            </Form>
        );
    }
}

const WrappedNormalAddAccountForm = Form.create({
    name: "add_account"
})(AddAccountPage);

export default WrappedNormalAddAccountForm;

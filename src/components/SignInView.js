import React, {useEffect} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Form, Input, PageHeader} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/input/style/css";
import "antd/es/page-header/style/css";

import {performInitialAuth} from "../actions";

const FORM_LAYOUT = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

const SignInView = ({isAuthenticating, performInitialAuth}) => {
    const onFinish = values => {
        performInitialAuth(values.username, values.password);
    };

    return <PageHeader title="Sign In" style={{background: "white"}}>
        <div style={{maxWidth: "640px", margin: "0 auto"}}>
            <Form {...FORM_LAYOUT} name="sign-in" onFinish={onFinish}>
                <Form.Item label="Username" name="username" rules={[{required: true}]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{required: true}]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit" loading={isAuthenticating}>Sign In</Button>
                </Form.Item>
            </Form>
        </div>
    </PageHeader>;
};

const mapStateToProps = state => ({
    isAuthenticating: state.auth.isAuthenticating,
});

export default connect(mapStateToProps, {performInitialAuth})(SignInView);

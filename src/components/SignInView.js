import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";

import {Button, Form, Input, PageHeader} from "antd";

import {performInitialAuth} from "../actions";

const FORM_LAYOUT = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

const SignInView = () => {
    const history = useHistory();
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();

    if (auth.tokens.refresh) {
        history.push({pathname: "/relations"});
    }

    const onFinish = values => {
        dispatch(performInitialAuth(values.username, values.password));
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
                    <Button type="primary" htmlType="submit" loading={auth.isAuthenticating}>Sign In</Button>
                </Form.Item>
            </Form>
        </div>
    </PageHeader>;
};

export default SignInView;

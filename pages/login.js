import axios from "axios";
import styles from "../styles/login.module.scss";
import { useState } from "react";
import { Button, Form, Input, Spin } from "antd";
import { handleLogin, showNotification } from "../utils";

function Login({ redirect }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const url = `/api/login`;
      const payload = { ...values };
      const response = await axios.post(url, payload);

      setLoading(false);
      handleLogin(response.data, redirect);
    } catch (e) {
      console.log(e);
      showNotification(e.response?.data);
      setLoading(false);
    }
  };

  return (
    <div id={styles.login} className={styles.section}>
      <div className={styles.sectionCenter}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 col-md-offset-4">
              <Spin size="large" spinning={loading}>
                <div className={styles.loginForm}>
                  <img
                    src={"/static/logo.png"}
                    width="100%"
                    style={{ objectFit: "contain", height: "10vw" }}
                  ></img>
                  <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                      label="Email:"
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: "Please input email!",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Password:"
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please input password!",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <div className={styles.formBtn}>
                      <Form.Item>
                        <Button
                          style={{ width: "100%" }}
                          size="large"
                          type="primary"
                          htmlType="submit"
                        >
                          LOGIN
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </Spin>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Login.getInitialProps = async (ctx) => {
  return { redirect: ctx.query.redirect };
};

export default Login;

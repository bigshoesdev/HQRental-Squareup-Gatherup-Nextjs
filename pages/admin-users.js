import axios from "axios";
import styles from "../styles/admin-users.module.scss";
import { useState, useEffect } from "react";
import { Button, Form, Input, Spin, Table } from "antd";
import Column from "antd/lib/table/Column";
import Modal from "antd/lib/modal/Modal";
import { showNotification } from "../utils";
import cookie from "js-cookie";
import { UserDeleteOutlined } from "@ant-design/icons";
import baseUrl from "../utils/baseUrl";

export default function AdminUsers() {
  const [registerLoading, setRegisterLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const onFinish = async (values) => {
    setRegisterLoading(true);
    const url = `${baseUrl}/api/user`;
    const token = cookie.get("token");
    const headers = { headers: { Authorization: token } };
    const payload = { ...values };

    try {
      const { data } = await axios.post(url, payload, headers);
      setRegisterLoading(false);

      if (data.success) {
        setShowModal(false);
      }
    } catch (e) {
      setRegisterLoading(false);
      showNotification(e.response?.data);
    }
  };

  const getUsers = async () => {
    const token = cookie.get("token");

    if (!token) {
      setUsers([]);
      return;
    }

    try {
      setUsersLoading(true);

      const headers = { headers: { Authorization: token } };
      const url = `${baseUrl}/api/user`;
      const { data } = await axios.get(url, headers);

      setUsersLoading(false);

      data.map((item) => (item.key = item._id));
      setUsers(data);
    } catch (e) {
      console.log(e);
      setUsersLoading(false);
      showNotification(e.response?.data);
    }
  };

  return (
    <div className="col-md-6 col-md-offset-3">
      <Modal
        width={450}
        destroyOnClose={true}
        title="Create User"
        visible={showModal}
        onOk={() => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <Spin size="large" spinning={registerLoading}>
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
                  Create
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>
      <Button type="primary" onClick={() => setShowModal(true)}>
        Add User
      </Button>
      <Spin size="large" spinning={usersLoading}>
        <Table dataSource={users}>
          <Column
            title="No"
            dataIndex="_id"
            key="id"
            render={(id, row, index) => {
              return `${index + 1}`;
            }}
          />
          <Column title="Email" dataIndex="email" key="email" />
          <Column
            title="Action"
            dataIndex="_id"
            key="action"
            render={(id) => (
              <Button type="danger" onClick={() => {}}>
                <UserDeleteOutlined />
              </Button>
            )}
          />
        </Table>
      </Spin>
    </div>
  );
}

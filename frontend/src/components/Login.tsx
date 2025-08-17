import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Typography, Alert, Space, Tag } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Title, Paragraph } = Typography;
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]); // store backend users
  const { login } = useAuth();

  // ✅ Fetch users from backend automatically
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const token = localStorage.getItem("access_token");
  //       if (!token) throw new Error("No token found. Please login first.");

  //       const response = await fetch(`${API_BASE}/api/users/`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       setUsers(data); // ✅ store users in state
  //       console.log("Users:", data);
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError("");

    const success = await login(values.username, values.password);

    if (!success) {
      setError("Invalid credentials. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={3} style={{ color: "#1890ff", marginBottom: 8 }}>
            ConstructPM
          </Title>
          <Paragraph type="secondary">
            Construction Project Management System
          </Paragraph>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: 24 }}
            closable
          />
        )}

        {/* ✅ Login Form */}
        <Form
          name="login"
          initialValues={{ username: "", password: "" }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* ✅ Dynamically fetched credentials */}
        <div style={{ marginTop: 24 }}>
          <Title level={5} style={{ marginBottom: 16, textAlign: "center" }}>
            Available Users
          </Title>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            {users.map((user, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                <span>
                  {user.username} ({user.role})
                </span>
                <Tag color="blue">Password: (set by admin)</Tag>
              </div>
            ))}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;

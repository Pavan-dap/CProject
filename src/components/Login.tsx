import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert, Space, Tag } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");

    const success = await login(values.email, values.password);

    if (!success) {
      setError("Invalid credentials. Please try again.");
    }

    setLoading(false);
  };

  const demoCredentials = [
    { email: "admin@construct.com", role: "Admin", color: "red" },
    { email: "manager@construct.com", role: "Manager", color: "blue" },
    { email: "incharge@construct.com", role: "Incharge", color: "green" },
    { email: "executive@construct.com", role: "Executive", color: "orange" },
  ];

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

        <Form
          name="login"
          initialValues={{ email: "admin@construct.com", password: "password" }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" type="email" />
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

        <div style={{ marginTop: 24 }}>
          <Title level={5} style={{ marginBottom: 16, textAlign: "center" }}>
            Demo Credentials
          </Title>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            {demoCredentials.map((cred, index) => (
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
                <span>{cred.email}</span>
                <Tag color={cred.color}>{cred.role}</Tag>
              </div>
            ))}
          </Space>
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              color: "#666",
              fontSize: "12px",
            }}
          >
            Password: <strong>password</strong> (for all accounts)
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;

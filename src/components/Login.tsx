import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await login(values);
      message.success('Login successful!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Construction PM
          </Title>
          <Text type="secondary">
            Project Management System
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Demo Credentials:</Text>
          <Text style={{ display: 'block', fontSize: '12px' }}>Admin: admin / admin123</Text>
          <Text style={{ display: 'block', fontSize: '12px' }}>Manager: manager1 / manager123</Text>
          <Text style={{ display: 'block', fontSize: '12px' }}>Executive: executive1 / executive123</Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;

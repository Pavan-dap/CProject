// import React, { useState } from 'react';
// import { Card, Form, Input, Button, Typography, Alert, Space, Tag } from 'antd';
// import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
// import { useAuth } from '../contexts/AuthContext';

// const { Title, Paragraph } = Typography;

// const Login: React.FC = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { login } = useAuth();

//   const onFinish = async (values: { email: string; password: string }) => {
//     setLoading(true);
//     setError('');

//     const success = await login(values.email, values.password);

//     if (!success) {
//       setError('Invalid credentials. Please try again.');
//     }

//     setLoading(false);
//   };

//   const demoCredentials = [
//     { email: 'admin@construct.com', role: 'admin123', color: 'red' },
//     { email: 'manager@construct.com', role: 'manager123', color: 'blue' },
//     { email: 'incharge@construct.com', role: 'incharge123', color: 'green' },
//     { email: 'executive@construct.com', role: 'executive123', color: 'orange' }
//   ];

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px'
//     }}>
//       <Card
//         style={{
//           width: '100%',
//           maxWidth: 400,
//           boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//           borderRadius: '12px'
//         }}
//       >
//         <div style={{ textAlign: 'center', marginBottom: 32 }}>
//           <Title level={3} style={{ color: '#1890ff', marginBottom: 8 }}>
//             ConstructPM
//           </Title>
//           <Paragraph type="secondary">
//             Construction Project Management System
//           </Paragraph>
//         </div>

//         {error && (
//           <Alert
//             message={error}
//             type="error"
//             style={{ marginBottom: 24 }}
//             closable
//           />
//         )}

//         <Form
//           name="login"
//           initialValues={{ email: 'admin@construct.com', password: 'password' }}
//           onFinish={onFinish}
//           size="large"
//         >
//           <Form.Item
//             name="email"
//             rules={[
//               { required: true, message: 'Please input your email!' },
//               { type: 'email', message: 'Please enter a valid email!' }
//             ]}
//           >
//             <Input
//               prefix={<UserOutlined />}
//               placeholder="Email"
//               type="email"
//             />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             rules={[{ required: true, message: 'Please input your password!' }]}
//           >
//             <Input.Password
//               prefix={<LockOutlined />}
//               placeholder="Password"
//             />
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               icon={<LoginOutlined />}
//               block
//             >
//               Sign In
//             </Button>
//           </Form.Item>
//         </Form>

//         <div style={{ marginTop: 24 }}>
//           <Title level={5} style={{ marginBottom: 16, textAlign: 'center' }}>
//             Demo Credentials
//           </Title>
//           <Space direction="vertical" style={{ width: '100%' }} size="small">
//             {demoCredentials.map((cred, index) => (
//               <div
//                 key={index}
//                 style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   padding: '8px 12px',
//                   background: '#f8f9fa',
//                   borderRadius: '6px',
//                   fontSize: '12px'
//                 }}
//               >
//                 <span>{cred.email}</span>
//                 <Tag color={cred.color}>{cred.role}</Tag>
//               </div>
//             ))}
//           </Space>
//           <div style={{
//             textAlign: 'center',
//             marginTop: 12,
//             color: '#666',
//             fontSize: '12px'
//           }}>
//             Password: <strong>password</strong> (for all accounts)
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default Login;

// import React, { useState } from 'react';
// import { Card, Form, Input, Button, Typography, Alert, Space, Tag } from 'antd';
// import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
// import { useAuth } from '../contexts/AuthContext';

// const { Title, Paragraph } = Typography;

// const Login: React.FC = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { login } = useAuth();

//   // Now using username instead of email
//   const onFinish = async (values: { username: string; password: string }) => {
//     setLoading(true);
//     setError('');

//     const success = await login(values.username, values.password);

//     if (!success) {
//       setError('Invalid credentials. Please try again.');
//     }

//     setLoading(false);
//   };

//   // Demo credentials (username + password)
//   const demoCredentials = [
//     { username: 'admin', password: 'admin123', color: 'red' },
//     { username: 'manager', password: 'manager123', color: 'blue' },
//     { username: 'incharge', password: 'incharge123', color: 'green' },
//     { username: 'executive', password: 'executive123', color: 'orange' }
//   ];

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '20px'
//     }}>
//       <Card
//         style={{
//           width: '100%',
//           maxWidth: 400,
//           boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//           borderRadius: '12px'
//         }}
//       >
//         <div style={{ textAlign: 'center', marginBottom: 32 }}>
//           <Title level={3} style={{ color: '#1890ff', marginBottom: 8 }}>
//             ConstructPM
//           </Title>
//           <Paragraph type="secondary">
//             Construction Project Management System
//           </Paragraph>
//         </div>

//         {error && (
//           <Alert
//             message={error}
//             type="error"
//             style={{ marginBottom: 24 }}
//             closable
//           />
//         )}

//         <Form
//           name="login"
//           initialValues={{ username: 'admin', password: 'admin123' }}
//           onFinish={onFinish}
//           size="large"
//         >
//           <Form.Item
//             name="username"
//             rules={[{ required: true, message: 'Please input your username!' }]}
//           >
//             <Input
//               prefix={<UserOutlined />}
//               placeholder="Username"
//               type="text"
//             />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             rules={[{ required: true, message: 'Please input your password!' }]}
//           >
//             <Input.Password
//               prefix={<LockOutlined />}
//               placeholder="Password"
//             />
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               icon={<LoginOutlined />}
//               block
//             >
//               Sign In
//             </Button>
//           </Form.Item>
//         </Form>

//         <div style={{ marginTop: 24 }}>
//           <Title level={5} style={{ marginBottom: 16, textAlign: 'center' }}>
//             Demo Credentials
//           </Title>
//           <Space direction="vertical" style={{ width: '100%' }} size="small">
//             {demoCredentials.map((cred, index) => (
//               <div
//                 key={index}
//                 style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   padding: '8px 12px',
//                   background: '#f8f9fa',
//                   borderRadius: '6px',
//                   fontSize: '12px'
//                 }}
//               >
//                 <span>{cred.username}</span>
//                 <Tag color={cred.color}>{cred.password}</Tag>
//               </div>
//             ))}
//           </Space>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Typography, Alert, Space, Tag } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]); // store backend users
  const { login } = useAuth();

  // ✅ Fetch users from backend automatically
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No token found. Please login first.");

        const response = await fetch("http://127.0.0.1:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data); // ✅ store users in state
        console.log("Users:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

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

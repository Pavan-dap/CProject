import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Typography,
  Avatar,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'incharge' | 'executive';
  phone?: string;
  status: 'active' | 'inactive';
  projects: string[];
  joinDate: string;
}

const Users: React.FC = () => {
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Mock users data
  const [users] = useState<User[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'admin@construct.com',
      role: 'admin',
      phone: '+1 234-567-8901',
      status: 'active',
      projects: ['All Projects'],
      joinDate: '2024-01-01'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'manager@construct.com',
      role: 'manager',
      phone: '+1 234-567-8902',
      status: 'active',
      projects: ['ABC Township Phase-2', 'Green Valley Complex'],
      joinDate: '2024-01-15'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'incharge@construct.com',
      role: 'incharge',
      phone: '+1 234-567-8903',
      status: 'active',
      projects: ['ABC Township Phase-2'],
      joinDate: '2024-02-01'
    },
    {
      id: 4,
      name: 'Lisa Davis',
      email: 'executive@construct.com',
      role: 'executive',
      phone: '+1 234-567-8904',
      status: 'active',
      projects: ['ABC Township Phase-2', 'Green Valley Complex'],
      joinDate: '2024-02-15'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'executive2@construct.com',
      role: 'executive',
      phone: '+1 234-567-8905',
      status: 'inactive',
      projects: ['Green Valley Complex'],
      joinDate: '2024-03-01'
    }
  ]);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: '#f5222d',
      manager: '#1890ff',
      incharge: '#52c41a',
      executive: '#fa8c16'
    };
    return colors[role as keyof typeof colors] || '#666';
  };

  const getRoleIcon = (role: string) => {
    return <UserOutlined />;
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('User data:', values);
      // In real app, would make API call
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            size={40}
            style={{ 
              backgroundColor: getRoleColor(record.role),
              color: '#fff'
            }}
          >
            {record.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined /> {record.email}
            </div>
            {record.phone && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <PhoneOutlined /> {record.phone}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag 
          color={getRoleColor(role)}
          icon={getRoleIcon(role)}
        >
          {role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Projects',
      dataIndex: 'projects',
      key: 'projects',
      render: (projects: string[]) => (
        <div>
          {projects.slice(0, 2).map(project => (
            <Tag key={project} style={{ marginBottom: 4 }}>
              {project.length > 20 ? project.substring(0, 20) + '...' : project}
            </Tag>
          ))}
          {projects.length > 2 && (
            <Tag>+{projects.length - 2} more</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          {user?.role === 'admin' && record.id !== user.id && (
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            />
          )}
        </Space>
      )
    }
  ];

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const usersByRole = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    incharge: users.filter(u => u.role === 'incharge').length,
    executive: users.filter(u => u.role === 'executive').length
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={2} style={{ margin: 0 }}>
          User Management
        </Title>
        {user?.role === 'admin' && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add User
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Executives"
              value={usersByRole.executive}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Managers"
              value={usersByRole.manager + usersByRole.incharge}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            {Object.entries(usersByRole).map(([role, count]) => (
              <Tag 
                key={role}
                color={getRoleColor(role)}
                style={{ margin: '2px' }}
              >
                {role}: {count}
              </Tag>
            ))}
          </Space>
        </div>
        
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingUser ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            role: 'executive'
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  <Option value="admin">Admin</Option>
                  <Option value="manager">Manager</Option>
                  <Option value="incharge">Incharge</Option>
                  <Option value="executive">Executive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="projects"
            label="Assigned Projects"
          >
            <Select
              mode="multiple"
              placeholder="Select projects to assign"
              allowClear
            >
              <Option value="ABC Township Phase-2">ABC Township Phase-2</Option>
              <Option value="Green Valley Complex">Green Valley Complex</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

import React, { useState } from "react";
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
  Statistic,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useData, User } from "../contexts/DataContext";
import {
  useRealTimeSync,
  useUserManagement,
  useComponentRefresh,
} from "../hooks/useRealTimeSync";

const { Title, Text } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const { user } = useAuth();
  const { projects } = useData();
  const { users, activeUsers, usersByRole, updateUser, addUser, deleteUser } =
    useUserManagement();
  const { forceSync } = useRealTimeSync();
  const { refreshKey } = useComponentRefresh();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "#f5222d",
      manager: "#1890ff",
      incharge: "#52c41a",
      executive: "#fa8c16",
    };
    return colors[role as keyof typeof colors] || "#666";
  };

  const getRoleIcon = (role: string) => {
    return <UserOutlined />;
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (editUser: User) => {
    setEditingUser(editUser);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...editUser,
      projects: editUser.projects || [],
    });
  };

  const handleDelete = (userId: number) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteUser(userId);
        forceSync();
        message.success("User deleted successfully");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const userData = {
        ...values,
        joinDate:
          editingUser?.joinDate || new Date().toISOString().split("T")[0],
        projects: values.projects || [],
      };

      if (editingUser) {
        updateUser(editingUser.id, userData);
        message.success("User updated successfully");
      } else {
        addUser(userData);
        message.success("User created successfully");
      }

      // Force immediate sync across all components
      forceSync();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please check the form and try again");
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (record: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            style={{
              backgroundColor: getRoleColor(record.role),
              color: "#fff",
            }}
          >
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              <MailOutlined /> {record.email}
            </div>
            {record.phone && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                <PhoneOutlined /> {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Projects",
      dataIndex: "projects",
      key: "projects",
      render: (userProjects: string[]) => (
        <div>
          {(userProjects || []).slice(0, 2).map((project) => (
            <Tag key={project} style={{ marginBottom: 4 }}>
              {project.length > 20 ? project.substring(0, 20) + "..." : project}
            </Tag>
          ))}
          {(userProjects || []).length > 2 && (
            <Tag>+{(userProjects || []).length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: User) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          {user?.role === "admin" && record.id !== user.id && (
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  // Real-time statistics
  const totalUsers = users.length;
  const totalActiveUsers = activeUsers.length;

  return (
    <div key={refreshKey}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          User Management
        </Title>
        {user?.role === "admin" && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add User
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={totalActiveUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Executives"
              value={usersByRole.executive.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Managers"
              value={usersByRole.manager.length + usersByRole.incharge.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            {Object.entries(usersByRole).map(([role, roleUsers]) => (
              <Tag
                key={role}
                color={getRoleColor(role)}
                style={{ margin: "2px" }}
              >
                {role}: {roleUsers.length}
              </Tag>
            ))}
          </Space>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            size: "small",
            position: ["topRight"],
          }}
          size="small"
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingUser ? "Update" : "Create"}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "active",
            role: "executive",
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
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
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item name="projects" label="Assigned Projects">
            <Select
              mode="multiple"
              placeholder="Select projects to assign"
              allowClear
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.name}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

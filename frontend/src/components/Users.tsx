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
import { useData, User as BaseUser } from "../contexts/DataContext";
import {
  useRealTimeSync,
  useUserManagement,
  useComponentRefresh,
} from "../hooks/useRealTimeSync";

const { Title } = Typography;
const { Option } = Select;

export interface User extends BaseUser {
  first_name: string;
  last_name: string;
  phone?: string;
  role: "admin" | "manager" | "incharge" | "executive";
  status: "active" | "inactive";
  joinDate?: string;
  projects?: { id: number; name: string }[];
  id: number;
  username: string;
  email: string;
}

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

  const getRoleColor = (role?: string) => {
    const colors: Record<string, string> = {
      admin: "#f5222d",
      manager: "#1890ff",
      incharge: "#52c41a",
      executive: "#fa8c16",
    };
    return role ? colors[role] || "#666" : "#666";
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
      projects: editUser.projects?.map((p) => p.name) || [],
    });
  };

  const handleDelete = (userId: number) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteUser(userId);
          forceSync();
          message.success("User deleted successfully");
        } catch {
          message.error("Failed to delete user");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const first_name = (values.first_name || "").trim() || "NoFirstName";
      const last_name = (values.last_name || "").trim() || "NoLastName";
      const username = editingUser
        ? editingUser.username
        : `${first_name}.${last_name}`.toLowerCase();

      // Validate password for new users
      if (!editingUser && !values.password) {
        message.error("Password is required for new users");
        return;
      }
      if (values.password && values.password !== values.confirm_password) {
        message.error("Passwords do not match");
        return;
      }

      // Construct payload
      const userData: any = {
        first_name,
        last_name,
        username,
        password,
        email: values.email,
        phone: values.phone || "",
        role: values.role,
        status: values.status,
        join_date:
          editingUser?.joinDate || new Date().toISOString().split("T")[0],
        projects:
          values.projects?.map((name: string) => {
            const project = projects.find((p) => p.name === name);
            return project
              ? { id: project.id, name: project.name }
              : { id: 0, name };
          }) || [],
      };

      // Only set password for new users
      if (!editingUser) {
        userData.password = values.password;
      }

      // Send request
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        message.success("User updated successfully");
      } else {
        await addUser(userData);
        message.success("User created successfully");
      }

      forceSync();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error("Form submission error:", error);
      if (error.response?.data) {
        message.error(JSON.stringify(error.response.data));
      } else {
        message.error("Please check the form and try again");
      }
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: any, record: User) => {
        const fullName = record?.name;
        const initials =
          fullName !== "N/A"
            ? fullName
                ?.split(" ")
                ?.map((n) => n[0])
                ?.join("")
            : "?";

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={40}
              style={{
                backgroundColor: getRoleColor(record.role),
                color: "#fff",
              }}
            >
              {initials}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{fullName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                <MailOutlined /> {record.email ?? "N/A"}
              </div>
              {record.phone && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                  <PhoneOutlined /> {record.phone}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role?: string) => (
        <Tag color={getRoleColor(role)}>{role?.toUpperCase() ?? "N/A"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status?: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status?.toUpperCase() ?? "N/A"}
        </Tag>
      ),
    },
    {
      title: "Projects",
      dataIndex: "projects",
      key: "projects",
      render: (userProjects?: { id: number; name: string }[]) => (
        <div>
          {(userProjects || []).slice(0, 2).map((project) => (
            <Tag
              key={`${project.id}-${project.name}`}
              style={{ marginBottom: 4 }}
            >
              {project.name.length > 20
                ? project.name.substring(0, 20) + "..."
                : project.name}
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
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
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
              value={users.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers.length}
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
          initialValues={{ status: "active", role: "executive" }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
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
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: !editingUser, message: "Please enter password" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="confirm_password"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  {
                    required: !editingUser,
                    message: "Please confirm password",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
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
            </Col>
          </Row>

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

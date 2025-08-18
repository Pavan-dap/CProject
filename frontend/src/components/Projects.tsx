import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Progress,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useData, Project } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useRealTimeSync, useComponentRefresh } from "../hooks/useRealTimeSync";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { projects, updateProject, addProject, tasks, users } = useData();
  const { forceSync } = useRealTimeSync();
  const { refreshKey } = useComponentRefresh();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // Filter projects based on user role
  const userProjects =
    user?.role === "admin"
      ? projects
      : user?.role === "manager"
        ? projects.filter((p) => p.managerId === user.id)
        : projects.filter((p) => user?.projectIds?.includes(p.id));

  const handleAdd = () => {
    setEditingProject(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...project,
      startDate: dayjs(project.startDate),
      endDate: dayjs(project.endDate),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      };

      if (editingProject) {
        updateProject(editingProject.id, projectData);
      } else {
        addProject(projectData);
      }

      // Force immediate sync across all components
      forceSync();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const getProjectStats = (projectId: number) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const completed = projectTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const total = projectTasks.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const columns = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Project) => (
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {text}
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.location}
          </Text>
        </div>
      ),
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Timeline",
      key: "timeline",
      render: (record: Project) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <CalendarOutlined /> {dayjs(record.startDate).format("MMM DD")} -{" "}
            {dayjs(record.endDate).format("MMM DD, YYYY")}
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: 2 }}>
            Duration:{" "}
            {dayjs(record.endDate).diff(dayjs(record.startDate), "days")} days
          </div>
        </div>
      ),
    },
    {
      title: "Scale",
      key: "scale",
      render: (record: Project) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <HomeOutlined /> {record.buildings} Buildings
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            {record.floors} Floors • {record.units.toLocaleString()} Units
          </div>
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: Project) => {
        const stats = getProjectStats(record.id);
        return (
          <div>
            <Progress
              percent={stats.percentage}
              size="small"
              status={stats.percentage === 100 ? "success" : "active"}
            />
            <Text style={{ fontSize: "11px" }}>
              {stats.completed}/{stats.total} tasks completed
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap = {
          planning: "orange",
          "in-progress": "blue",
          completed: "green",
          "on-hold": "red",
        };
        return (
          <Tag color={colorMap[status as keyof typeof colorMap]}>
            {status.replace("-", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Project) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Project">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {user?.role === "admin" && (
            <Tooltip title="Delete Project">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Project statistics
  const totalUnits = userProjects.reduce((sum, p) => sum + p.units, 0);
  const avgProgress =
    userProjects.length > 0
      ? Math.round(
        userProjects.reduce((sum, p) => sum + p.progress, 0) /
        userProjects.length
      )
      : 0;
  const activeProjects = userProjects.filter(
    (p) => p.status === "in-progress"
  ).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Projects Management
        </Title>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Project
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Total Projects"
              value={userProjects.length}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Total Units"
              value={totalUnits}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Active Projects"
              value={activeProjects}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={userProjects}
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
        title={editingProject ? "Edit Project" : "Add New Project"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={editingProject ? "Update" : "Create"}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "planning",
            progress: 0,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[
                  { required: true, message: "Please enter project name" },
                ]}
              >
                <Input placeholder="Enter project name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="client"
                label="Client"
                rules={[
                  { required: true, message: "Please enter client name" },
                ]}
              >
                <Input placeholder="Enter client name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="Enter project location" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Project description..." />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: "Please select end date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="buildings"
                label="Buildings"
                rules={[
                  {
                    required: true,
                    message: "Please enter number of buildings",
                  },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="floors"
                label="Floors per Building"
                rules={[
                  { required: true, message: "Please enter number of floors" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="units"
                label="Total Units"
                rules={[
                  { required: true, message: "Please enter total units" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="planning">Planning</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="on-hold">On Hold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="progress"
                label="Progress (%)"
                rules={[{ required: true, message: "Please enter progress" }]}
              >
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="managerId"
                label="Project Manager"
                rules={[{ required: true, message: "Please select a manager" }]}
              >
                <Select placeholder="Select manager">
                  {users
                    .filter((u) => u.role === "manager")
                    .map((u) => (
                      <Option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;

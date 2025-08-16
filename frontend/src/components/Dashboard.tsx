import React from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Avatar,
  Typography,
  Space,
  List,
} from "antd";
import {
  ProjectOutlined,
  CheckSquareOutlined,
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useRealTimeSync, useRealTimeStats } from "../hooks/useRealTimeSync";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, tasks, users } = useData();
  const { syncTrigger } = useRealTimeSync();
  const realtimeStats = useRealTimeStats();

  // Filter data based on user role
  const userProjects =
    user?.role === "admin"
      ? projects
      : projects.filter((p) => user?.projectIds?.includes(p.id));

  const userTasks =
    user?.role === "executive"
      ? tasks.filter((t) => t.assignedTo === user.id)
      : user?.role === "admin"
      ? tasks
      : tasks.filter((t) => userProjects.some((p) => p.id === t.projectId));

  // Statistics
  const totalProjects = userProjects.length;
  const completedProjects = userProjects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const inProgressTasks = userTasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const overdueTasks = userTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed"
  ).length;

  // Chart data
  const projectStatusData = [
    {
      name: "Planning",
      value: userProjects.filter((p) => p.status === "planning").length,
    },
    {
      name: "In Progress",
      value: userProjects.filter((p) => p.status === "in-progress").length,
    },
    {
      name: "Completed",
      value: userProjects.filter((p) => p.status === "completed").length,
    },
    {
      name: "On Hold",
      value: userProjects.filter((p) => p.status === "on-hold").length,
    },
  ];

  const taskProgressData = userProjects.map((project) => ({
    name:
      project.name.length > 15
        ? project.name.substring(0, 15) + "..."
        : project.name,
    progress: project.progress,
    tasks: tasks.filter((t) => t.projectId === project.id).length,
  }));

  const COLORS = ["#faad14", "#1890ff", "#52c41a", "#f5222d"];

  const recentActivities = [
    {
      action: "Window installation completed",
      project: "ABC Township",
      time: "2 hours ago",
      type: "success",
    },
    {
      action: "New task assigned",
      project: "Green Valley",
      time: "4 hours ago",
      type: "info",
    },
    {
      action: "Quality check failed",
      project: "ABC Township",
      time: "6 hours ago",
      type: "error",
    },
    {
      action: "Material delivery received",
      project: "Green Valley",
      time: "1 day ago",
      type: "success",
    },
  ];

  const upcomingTasks =
    userTasks
      .filter((t) => t.status !== "completed")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      ?.slice(0, 5) || [];

  const columns = [
    {
      title: "Project",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? "success" : "active"}
        />
      ),
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
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (units: number) => units.toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Welcome back, {user?.name}!
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={totalProjects}
              prefix={<ProjectOutlined style={{ color: "#1890ff" }} />}
              suffix={
                completedProjects > 0 ? `(${completedProjects} completed)` : ""
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={totalTasks}
              prefix={<CheckSquareOutlined style={{ color: "#52c41a" }} />}
              suffix={`(${completedTasks} done)`}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={inProgressTasks}
              prefix={<UserOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Overdue Tasks"
              value={overdueTasks}
              prefix={<CalendarOutlined style={{ color: "#f5222d" }} />}
              valueStyle={{ color: overdueTasks > 0 ? "#f5222d" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={24} lg={16} xl={16}>
          <Card
            title="Project Progress Overview"
            style={{ height: "auto", minHeight: 400 }}
          >
            <ResponsiveContainer width="100%" height={300} minHeight={250}>
              <BarChart data={taskProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={24} lg={8} xl={8}>
          <Card
            title="Project Status Distribution"
            style={{ height: "auto", minHeight: 400 }}
          >
            <ResponsiveContainer width="100%" height={300} minHeight={200}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              {projectStatusData.map((entry, index) => (
                <Tag
                  key={entry.name}
                  color={COLORS[index % COLORS.length]}
                  style={{ margin: "2px" }}
                >
                  {entry.name}: {entry.value}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Active Projects">
            <Table
              dataSource={userProjects}
              columns={columns}
              pagination={{
                pageSize: 5,
                position: ["topRight"],
                size: "small",
              }}
              size="small"
              rowKey="id"
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            {user?.role === "admin" && (
              <Col xs={24}>
                <Card
                  title="User Statistics"
                  size="small"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={[8, 8]}>
                    <Col xs={12}>
                      <Statistic
                        title="Total Users"
                        value={realtimeStats.totalUsers}
                        prefix={<UserOutlined />}
                        style={{ textAlign: "center" }}
                      />
                    </Col>
                    <Col xs={12}>
                      <Statistic
                        title="Active"
                        value={realtimeStats.activeUsers}
                        valueStyle={{ color: "#52c41a" }}
                        style={{ textAlign: "center" }}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <Space wrap>
                      <Tag color="#f5222d">
                        Admin: {realtimeStats.usersByRole.admin}
                      </Tag>
                      <Tag color="#1890ff">
                        Manager: {realtimeStats.usersByRole.manager}
                      </Tag>
                      <Tag color="#52c41a">
                        Incharge: {realtimeStats.usersByRole.incharge}
                      </Tag>
                      <Tag color="#fa8c16">
                        Executive: {realtimeStats.usersByRole.executive}
                      </Tag>
                    </Space>
                  </div>
                </Card>
              </Col>
            )}
            <Col xs={24}>
              <Card title="Recent Activities" size="small">
                <List
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <div>
                        <div style={{ fontSize: "13px" }}>
                          <Text
                            type={
                              item.type === "error" ? "danger" : "secondary"
                            }
                          >
                            {item.action}
                          </Text>
                        </div>
                        <div style={{ fontSize: "11px", color: "#999" }}>
                          {item.project} • {item.time}
                        </div>
                      </div>
                    </List.Item>
                  )}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24}>
              <Card title="Upcoming Tasks" size="small">
                <List
                  dataSource={upcomingTasks}
                  renderItem={(task) => (
                    <List.Item>
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontSize: "13px" }} ellipsis>
                            {task.title}
                          </Text>
                          <Tag
                            color={
                              task.priority === "high"
                                ? "red"
                                : task.priority === "medium"
                                ? "orange"
                                : "blue"
                            }
                            size="small"
                          >
                            {task.priority}
                          </Tag>
                        </div>
                        <div style={{ fontSize: "11px", color: "#999" }}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </List.Item>
                  )}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

import React, { useState, useRef } from "react";
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  message,
  Grid,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  LineChart,
  Line,
} from "recharts";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { projects, tasks } = useData();
  const [selectedProject, setSelectedProject] = useState<number | "all">("all");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [reportType, setReportType] = useState<
    "summary" | "detailed" | "progress"
  >("summary");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  // PDF Export Function
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const projectName =
        selectedProject === "all"
          ? "All_Projects"
          : projects
              .find((p) => p.id === selectedProject)
              ?.name?.replace(/\s+/g, "_") || "Unknown_Project";
      const fileName = `${projectName}_Report_${dayjs().format(
        "YYYY-MM-DD"
      )}.pdf`;

      pdf.save(fileName);
      message.success("Report exported to PDF successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Print Function
  const handlePrint = () => {
    if (!reportRef.current) return;

    const printContent = reportRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Construction Project Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .ant-card { border: 1px solid #d9d9d9; border-radius: 6px; margin-bottom: 16px; }
              .ant-card-head { padding: 16px; border-bottom: 1px solid #f0f0f0; font-weight: bold; }
              .ant-card-body { padding: 16px; }
              .ant-table { border: 1px solid #f0f0f0; }
              .ant-table th, .ant-table td { border: 1px solid #f0f0f0; padding: 8px; }
              .ant-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
              .no-print { display: none !important; }
              @media print {
                .no-print { display: none !important; }
                .ant-card { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <h1>Construction Project Report</h1>
            <p>Generated on: ${dayjs().format("MMMM DD, YYYY")}</p>
            <hr/>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  // Filter data based on user role and filters
  const userProjects =
    user?.role === "admin"
      ? projects
      : projects.filter((p) => user?.projectIds?.includes(p.id));

  const filteredProjects =
    selectedProject === "all"
      ? userProjects
      : userProjects.filter((p) => p.id === selectedProject);

  const filteredTasks = tasks.filter((task) => {
    const matchesProject =
      selectedProject === "all" || task.projectId === selectedProject;
    const matchesDateRange =
      !dateRange ||
      (new Date(task.createdDate) >= dateRange[0].toDate() &&
        new Date(task.createdDate) <= dateRange[1].toDate());
    const isUserTask =
      user?.role === "admin" ||
      userProjects.some((p) => p.id === task.projectId);

    return matchesProject && matchesDateRange && isUserTask;
  });

  // Calculate statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const overdueTasks = filteredTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed"
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart data
  const taskStatusData = [
    {
      name: "Not Started",
      value: filteredTasks.filter((t) => t.status === "not-started").length,
      color: "#d9d9d9",
    },
    { name: "In Progress", value: inProgressTasks, color: "#1890ff" },
    { name: "Completed", value: completedTasks, color: "#52c41a" },
    {
      name: "On Hold",
      value: filteredTasks.filter((t) => t.status === "on-hold").length,
      color: "#faad14",
    },
  ];

  const priorityData = [
    {
      name: "High",
      value: filteredTasks.filter((t) => t.priority === "high").length,
      color: "#f5222d",
    },
    {
      name: "Medium",
      value: filteredTasks.filter((t) => t.priority === "medium").length,
      color: "#faad14",
    },
    {
      name: "Low",
      value: filteredTasks.filter((t) => t.priority === "low").length,
      color: "#52c41a",
    },
  ];

  const projectProgressData = filteredProjects.map((project) => ({
    name:
      project.name.length > 15
        ? project.name.substring(0, 15) + "..."
        : project.name,
    progress: project.progress,
    totalTasks: tasks.filter((t) => t.projectId === project.id).length,
    completedTasks: tasks.filter(
      (t) => t.projectId === project.id && t.status === "completed"
    ).length,
  }));

  // Progress timeline data (last 7 days)
  const getProgressTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(i, "day");
      const tasksCompletedOnDay = filteredTasks.filter(
        (task) =>
          task.status === "completed" &&
          dayjs(task.createdDate).isSame(date, "day")
      ).length;

      return {
        date: date.format("MMM DD"),
        completed: tasksCompletedOnDay,
        cumulative: filteredTasks.filter(
          (task) =>
            task.status === "completed" &&
            dayjs(task.createdDate).isBefore(date.endOf("day"))
        ).length,
      };
    }).reverse();

    return last7Days;
  };

  const timelineData = getProgressTimelineData();

  // Table columns for detailed report
  const taskColumns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {projects.find((p) => p.id === record.projectId)?.name}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap = {
          "not-started": "default",
          "in-progress": "processing",
          completed: "success",
          "on-hold": "warning",
        };
        return (
          <Tag color={colorMap[status as keyof typeof colorMap]}>
            {status.replace("-", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => {
        const colors = { high: "red", medium: "orange", low: "blue" };
        return (
          <Tag color={colors[priority as keyof typeof colors]}>
            {priority.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => {
        const isOverdue = new Date(date) < new Date();
        return (
          <Text style={{ color: isOverdue ? "#f5222d" : "inherit" }}>
            {dayjs(date).format("MMM DD, YYYY")}
          </Text>
        );
      },
    },
  ];

  const handleExport = (format: "excel" | "pdf") => {
    // Simulate export functionality
    const data = {
      reportType,
      dateRange: dateRange
        ? `${dateRange[0].format("YYYY-MM-DD")} to ${dateRange[1].format(
            "YYYY-MM-DD"
          )}`
        : "All time",
      project:
        selectedProject === "all"
          ? "All projects"
          : projects.find((p) => p.id === selectedProject)?.name,
      stats: {
        totalTasks,
        completedTasks,
        completionRate,
        overdueTasks,
      },
      tasks: filteredTasks,
    };

    console.log(`Exporting ${format.toUpperCase()} report:`, data);

    // Create blob and download (simulation)
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `construction-report-${dayjs().format("YYYY-MM-DD")}.${
      format === "excel" ? "json" : "json"
    }`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderSummaryReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={totalTasks}
              prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedTasks}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={completionRate}
              suffix="%"
              prefix={<CheckSquareOutlined />}
              valueStyle={{
                color:
                  completionRate > 70
                    ? "#52c41a"
                    : completionRate > 40
                    ? "#faad14"
                    : "#f5222d",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={overdueTasks}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: overdueTasks > 0 ? "#f5222d" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              {taskStatusData.map((entry) => (
                <Tag
                  key={entry.name}
                  color={entry.color}
                  style={{ margin: "2px" }}
                >
                  {entry.name}: {entry.value}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Priority Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Project Progress Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderProgressReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Progress Timeline (Last 7 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#52c41a"
                  name="Daily Completed"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#1890ff"
                  name="Cumulative"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const projectCompleted = projectTasks.filter(
            (t) => t.status === "completed"
          ).length;
          const projectProgress =
            projectTasks.length > 0
              ? Math.round((projectCompleted / projectTasks.length) * 100)
              : 0;

          return (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card size="small">
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>{project.name}</Title>
                  <Text type="secondary">{project.location}</Text>
                </div>
                <Progress
                  percent={projectProgress}
                  status={projectProgress === 100 ? "success" : "active"}
                  strokeWidth={8}
                />
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  {projectCompleted}/{projectTasks.length} tasks completed
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  const renderDetailedReport = () => (
    <Card title="Detailed Task Report">
      <Table
        dataSource={filteredTasks}
        columns={taskColumns}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tasks`,
          position: ["topRight"],
          size: "small",
        }}
      />
    </Card>
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap", // ensures on small screens it still wraps if needed
          gap: 8,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Reports & Analytics
        </Title>
        <Space>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => handleExport("excel")}
          >
            {!isMobile && "Export Excel"}
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={exportToPDF}
            loading={isExporting}
          >
            {!isMobile && "Export PDF"}
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            {!isMobile && "Print"}
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={12} sm={6}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: "100%" }}
              placeholder="Report Type"
            >
              <Option value="summary">Summary Report</Option>
              <Option value="progress">Progress Report</Option>
              <Option value="detailed">Detailed Report</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6}>
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: "100%" }}
              placeholder="Select Project"
            >
              <Option value="all">All Projects</Option>
              {userProjects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              type="primary"
              block
              onClick={() => {
                // Refresh data (in real app, would trigger API call)
                console.log("Refreshing report data...");
              }}
            >
              Generate Report
            </Button>
          </Col>
        </Row>
      </Card>

      {totalTasks === 0 && (
        <Alert
          message="No Data Available"
          description="No tasks found for the selected filters. Please adjust your search criteria."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {totalTasks > 0 && (
        <div ref={reportRef}>
          {reportType === "summary" && renderSummaryReport()}
          {reportType === "progress" && renderProgressReport()}
          {reportType === "detailed" && renderDetailedReport()}
        </div>
      )}
    </div>
  );
};

export default Reports;

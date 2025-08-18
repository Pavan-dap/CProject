import React, { useState, useRef } from "react";
import {
  Card,
  Typography,
  Progress,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Collapse,
  Image,
  Divider,
  Select,
  DatePicker,
  message,
  Grid,
} from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CameraOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useData, ProjectHierarchy } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { useBreakpoint } = Grid;

interface ProjectStatusReportProps {
  projectId?: number;
  isPublic?: boolean;
}

const ProjectStatusReport: React.FC<ProjectStatusReportProps> = ({
  projectId,
  isPublic = false,
}) => {
  const { user } = useAuth();
  const { projects, tasks, getProjectHierarchy } = useData();
  const [selectedProject, setSelectedProject] = useState<number>(
    projectId || projects[0]?.id
  );
  const [reportDate] = useState(dayjs());
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
        projects
          .find((p) => p.id === selectedProject)
          ?.name?.replace(/\s+/g, "_") || "Unknown_Project";
      const fileName = `${projectName}_Status_Report_${dayjs().format(
        "YYYY-MM-DD"
      )}.pdf`;

      pdf.save(fileName);
      message.success("Status report exported to PDF successfully!");
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

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Project Status Report - ${project?.name}</title>
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
            <h1>Project Status Report</h1>
            <h2>${project?.name}</h2>
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

  const project = projects.find((p) => p.id === selectedProject);
  const hierarchy = getProjectHierarchy(selectedProject);
  const projectTasks = tasks.filter((t) => t.projectId === selectedProject);

  // if (!project) return <div>Project not found</div>;

  // Calculate overall statistics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const pendingTasks = projectTasks.filter(
    (t) => t.status === "not-started"
  ).length;
  const onHoldTasks = projectTasks.filter((t) => t.status === "on-hold").length;
  const overdueTasks = projectTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed"
  ).length;

  // Calculate unit type statistics
  const unitTypeStats = projectTasks.reduce((acc, task) => {
    if (task.unitType) {
      if (!acc[task.unitType]) {
        acc[task.unitType] = { total: 0, completed: 0 };
      }
      acc[task.unitType].total++;
      if (task.status === "completed") {
        acc[task.unitType].completed++;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const ProjectStatusReport: React.FC = () => {
    return (
      <div>
        <h1>Project Status Report</h1>
      </div>
    );
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/project-status/${selectedProject}`;
    navigator.clipboard.writeText(shareUrl);
    message.success("Share URL copied to clipboard!");
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      "in-progress": <ClockCircleOutlined style={{ color: "#1890ff" }} />,
      "not-started": <ExclamationCircleOutlined style={{ color: "#d9d9d9" }} />,
      "on-hold": <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
    };
    return icons[status as keyof typeof icons] || icons["not-started"];
  };

  const blockColumns = [
    {
      title: "Block",
      dataIndex: "blockName",
      key: "blockName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Floors",
      key: "floors",
      render: (record: any) => record.floors.length,
    },
    {
      title: "Total Units",
      key: "totalUnits",
      render: (record: any) => {
        const totalUnits = record.floors.reduce(
          (sum: number, floor: any) => sum + floor.units.length,
          0
        );
        return totalUnits;
      },
    },
    {
      title: "Completion",
      key: "completion",
      render: (record: any) => (
        <Progress
          percent={Math.round(record.completionPercentage)}
          size="small"
          status={record.completionPercentage === 100 ? "success" : "active"}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: isPublic ? 0 : 6 }}>
      {!isPublic && (
        <Row
          // align="center"
          justify="space-between"
          gutter={[16, 16]} // spacing between columns
          style={{ marginBottom: 24 }}
        >
          <Col xs={24} sm={10}>
            <Title level={3} style={{ margin: 12 }}>
              Project Status Report
            </Title>
          </Col>

          <Col xs={24} sm={14} className="flex justify-end">
            <Space wrap={false}>
              <Select
                value={selectedProject}
                onChange={setSelectedProject}
                style={{ width: "100%" }}
                placeholder="Select a project"
              >
                {projects.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p?.name}
                  </Option>
                ))}
              </Select>

              <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                {!isMobile && "Share"}
              </Button>

              <Button
                icon={<FilePdfOutlined />}
                onClick={exportToPDF}
                loading={isExporting}
              >
                {!isMobile && "Download PDF"}
              </Button>

              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                {!isMobile && "Print"}
              </Button>
            </Space>
          </Col>
        </Row>
      )}

      {/* if (!project) return <div>Project not found</div>; */}
      {project ? (<>

        <div className="print-content" ref={reportRef}>
          {/* Header */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={16}>
                <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                  {project?.name}
                </Title>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <HomeOutlined /> {project?.location}
                  </Text>
                  <Divider type="vertical" />
                  <Text type="secondary">Client: {project?.client}</Text>
                  <Divider type="vertical" />
                  <Text type="secondary">
                    {dayjs(project?.startDate).format("MMM DD, YYYY")} -{" "}
                    {dayjs(project?.endDate).format("MMM DD, YYYY")}
                  </Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">{project?.buildings} Blocks</Tag>
                  <Tag color="green">{project?.floors} Floors per Block</Tag>
                  <Tag color="orange">
                    {project?.units.toLocaleString()} Total Units
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={Math.round(hierarchy.overallCompletion)}
                    size={120}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Overall Progress</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Statistics Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Total Tasks"
                  value={totalTasks}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={completedTasks}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="In Progress"
                  value={inProgressTasks}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Pending"
                  value={pendingTasks}
                  valueStyle={{ color: "#faad14" }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Unit Type Progress */}
          {Object.keys(unitTypeStats).length > 0 && (
            <Card title="Progress by Unit Type" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                {Object.entries(unitTypeStats).map(([unitType, stats]) => (
                  <Col xs={24} sm={12} md={8} key={unitType}>
                    <Card size="small">
                      <div style={{ textAlign: "center" }}>
                        <Title level={4}>{unitType}</Title>
                        <Progress
                          percent={Math.round(
                            (stats.completed / stats.total) * 100
                          )}
                          size="small"
                        />
                        <Text type="secondary">
                          {stats.completed} / {stats.total} completed
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Block-wise Progress */}
          <Card title="Block-wise Progress" style={{ marginBottom: 24 }}>
            <Table
              dataSource={hierarchy.blocks}
              columns={blockColumns}
              pagination={false}
              size="small"
              rowKey="blockName"
              scroll={{ x: "max-content" }}
            />
          </Card>

          {/* Detailed Block Information */}
          <Card title="Detailed Block Status" style={{ marginBottom: 24 }}>
            <Collapse
              items={hierarchy.blocks.map((block) => ({
                key: block.blockName,
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong>{block.blockName}</Text>
                    <Progress
                      percent={Math.round(block.completionPercentage)}
                      size="small"
                      style={{ width: 200 }}
                    />
                  </div>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {block.floors.map((floor) => (
                      <Col xs={24} sm={12} md={8} key={floor.floorNumber}>
                        <Card size="small" title={`Floor ${floor.floorNumber}`}>
                          <div style={{ marginBottom: 8 }}>
                            <Progress
                              percent={Math.round(floor.completionPercentage)}
                              size="small"
                            />
                          </div>
                          <Text type="secondary">
                            {floor.units.length} units •{" "}
                            {
                              floor.units.filter(
                                (u) => u.completionPercentage === 100
                              ).length
                            }{" "}
                            completed
                          </Text>

                          <div style={{ marginTop: 12 }}>
                            <Text strong style={{ fontSize: "12px" }}>
                              Units:
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                                marginTop: 4,
                              }}
                            >
                              {floor.units.map((unit) => (
                                <div
                                  key={unit.unitNumber}
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 4,
                                    backgroundColor:
                                      unit.completionPercentage === 100
                                        ? "#52c41a"
                                        : unit.completionPercentage > 0
                                          ? "#1890ff"
                                          : "#d9d9d9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    color: "#fff",
                                    fontWeight: "bold",
                                  }}
                                  title={`Unit ${unit.unitNumber} (${unit.unitType
                                    }) - ${Math.round(unit.completionPercentage)}%`}
                                >
                                  {unit.unitNumber?.slice(-1) || "?"}
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
              }))}
            />
          </Card>

          {/* Recent Task Updates with Photos */}
          <Card title="Recent Task Updates" style={{ marginBottom: 24 }}>
            {(projectTasks || [])
              .filter((task) => task.photos && task.photos.length > 0)
              ?.slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "12px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "6px",
                    marginBottom: "12px",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>{task.title}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">{task.building}</Tag>
                          <Tag color="green">{task.floor}</Tag>
                          {task.unitType && (
                            <Tag color="orange">{task.unitType}</Tag>
                          )}
                          {getStatusIcon(task.status)}
                          <Text style={{ marginLeft: 8 }}>
                            {task.status.replace("-", " ").toUpperCase()}
                          </Text>
                        </div>
                      </div>
                      <Progress percent={task.progress} size="small" />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Due: {dayjs(task.dueDate).format("MMM DD, YYYY")}
                      </Text>
                    </Col>
                    <Col xs={24} md={8}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {(task.photos || []).slice(0, 3).map((photo, index) => (
                          <div
                            key={index}
                            style={{
                              width: 60,
                              height: 60,
                              background: "#f5f5f5",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            <CameraOutlined
                              style={{ fontSize: 16, color: "#999" }}
                            />
                          </div>
                        ))}
                        {task.photos && task.photos.length > 3 && (
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              background: "#f0f0f0",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #d9d9d9",
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            +{task.photos.length - 3}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
          </Card>

          {/* Report Footer */}
          <Card>
            <div style={{ textAlign: "center", color: "#666" }}>
              <Text type="secondary">
                Report generated on {reportDate.format("MMMM DD, YYYY at HH:mm")}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Construction Project Management System
              </Text>
            </div>
          </Card>
        </div>
      </>
      ) : <div>Project not found</div>}

      <style jsx="true">{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-content {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectStatusReport;

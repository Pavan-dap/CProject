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
  Typography,
  Row,
  Col,
  Avatar,
  Tooltip,
  Tabs,
  Upload,
  message,
  InputNumber,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  // DeleteOutlined,
  // UserOutlined,
  CalendarOutlined,
  // FileImageOutlined,
  UploadOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useData, Task } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  useRealTimeSync,
  useComponentRefresh,
  useUserManagement,
} from "../hooks/useRealTimeSync";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const {
    projects,
    tasks,
    updateTask,
    addTask,
    getTaskDependencies,
    canStartTask,
    getTaskComments,
    addTaskComment,
    getUserById,
  } = useData();
  const { assignableUsers } = useUserManagement();
  const { forceSync } = useRealTimeSync();
  const { refreshKey } = useComponentRefresh();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewType, setViewType] = useState<"table" | "kanban">("table");
  const [newComment, setNewComment] = useState("");
  const [form] = Form.useForm();

  // Filter tasks based on user role
  const userProjects =
    user?.role === "admin"
      ? projects
      : projects.filter((p) => user?.projectIds?.includes(p.id));

  const userTasks =
    user?.role === "executive"
      ? tasks.filter((t) => t.assignedTo === user.id)
      : tasks.filter((t) => userProjects.some((p) => p.id === t.projectId));

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...task,
      dueDate: dayjs(task.dueDate),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        createdDate:
          editingTask?.createdDate || new Date().toISOString().split("T")[0],
        assignedBy: user?.id || 1,
      };

      if (editingTask) {
        updateTask(editingTask.id, taskData);
      } else {
        addTask(taskData);
      }

      // Force immediate sync across all components
      forceSync();
      setIsModalVisible(false);
      form.resetFields();
      message.success(
        editingTask ? "Task updated successfully" : "Task created successfully"
      );
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    const progressMap = {
      "not-started": 0,
      "in-progress": 50,
      completed: 100,
      "on-hold": 25,
    };
    updateTask(taskId, {
      status: newStatus as any,
      progress: progressMap[newStatus as keyof typeof progressMap],
    });
    // Force immediate sync across all components
    forceSync();
    message.success("Task status updated");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !viewingTask) return;

    addTaskComment(viewingTask.id, {
      text: newComment.trim(),
      userId: user?.id || 1,
      userName: user?.name || "Unknown",
      date: new Date().toISOString(),
      type: "comment",
    });

    setNewComment("");
    // Force immediate sync across all components
    forceSync();
    message.success("Comment added");
  };

  const getUser = (id: number) => {
    return getUserById(id);
  };

  const handleView = (viewTask: Task) => {
    setViewingTask(viewTask);
    setIsViewModalVisible(true);
  };

  const getProjectById = (id: number) => {
    return projects.find((p) => p.id === id);
  };

  const getPriorityColor = (priority: string) => {
    const colors = { high: "red", medium: "orange", low: "blue" };
    return colors[priority as keyof typeof colors] || "blue";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "not-started": "default",
      "in-progress": "processing",
      completed: "success",
      "on-hold": "warning",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  // Table columns
  const columns = [
    {
      title: "Task",
      key: "task",
      render: (record: Task) => {
        const project = getProjectById(record.projectId);
        const { dependencies, dependents } = getTaskDependencies(record.id);
        const canStart = canStartTask(record.id);

        return (
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {record.title}
              {dependencies.length > 0 && (
                <LinkOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
              )}
              {!canStart && record.status === "not-started" && (
                <ExclamationCircleOutlined
                  style={{ marginLeft: 8, color: "#faad14" }}
                />
              )}
            </Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {project?.name}
            </Text>
            {record.building && (
              <div style={{ fontSize: "11px", color: "#999" }}>
                {record.building} {record.floor && `• ${record.floor}`}{" "}
                {record.unit && `• ${record.unit}`}{" "}
                {record.unitType && `• ${record.unitType}`}
              </div>
            )}
            {dependencies.length > 0 && (
              <div style={{ fontSize: "10px", color: "#666", marginTop: 2 }}>
                Depends on:{" "}
                {dependencies
                  .map((d) => d.title)
                  .join(", ")
                  .substring(0, 50)}
                ...
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Assigned To",
      key: "assignedTo",
      render: (record: Task) => {
        const assignee = getUser(record.assignedTo);
        return (
          <div className="task-avatar">
            <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
              {assignee?.name?.charAt(0) || "?"}
            </Avatar>
            <div>
              <div style={{ fontSize: "13px" }}>
                {assignee?.name || "Unassigned"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  textTransform: "capitalize",
                }}
              >
                {assignee?.role || "Unknown"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace("-", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
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
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => {
        const isOverdue = new Date(date) < new Date();
        return (
          <div style={{ color: isOverdue ? "#f5222d" : "inherit" }}>
            <CalendarOutlined /> {dayjs(date).format("MMM DD, YYYY")}
            {isOverdue && (
              <div style={{ fontSize: "11px", color: "#f5222d" }}>Overdue</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Task) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Badge
              count={record.comments && record.comments.length}
              size="small"
            >
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(record)}
              />
            </Badge>
          </Tooltip>
          <Tooltip title="Edit Task">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status !== "completed" && user?.role !== "executive" && (
            <Tooltip title="Mark Complete">
              <Button
                type="text"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleStatusChange(record.id, "completed")}
                style={{ color: "#52c41a" }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Kanban View
  const statusColumns = {
    "not-started": {
      title: "Not Started",
      color: "#d9d9d9",
      icon: <ExclamationCircleOutlined />,
    },
    "in-progress": {
      title: "In Progress",
      color: "#1890ff",
      icon: <ClockCircleOutlined />,
    },
    completed: {
      title: "Completed",
      color: "#52c41a",
      icon: <CheckOutlined />,
    },
    "on-hold": {
      title: "On Hold",
      color: "#faad14",
      icon: <ExclamationCircleOutlined />,
    },
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      handleStatusChange(parseInt(draggableId), destination.droppableId);
    }
  };

  const renderKanbanView = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Row
        gutter={[16, 16]}
        style={{ height: "calc(100vh - 300px)", overflowX: "auto" }}
      >
        {Object.entries(statusColumns).map(([status, config]) => {
          const statusTasks = userTasks.filter(
            (task) => task.status === status
          );

          return (
            <Col key={status} xs={24} sm={12} lg={6}>
              <Card
                size="small"
                className="kanban-column"
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {config.icon}
                    {config.title}
                    <Tag color={config.color}>{statusTasks.length}</Tag>
                  </div>
                }
              >
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 400,
                        background: snapshot.isDraggingOver
                          ? "#f0f9ff"
                          : "transparent",
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      {statusTasks.map((task, index) => {
                        const project = getProjectById(task.projectId);
                        const assignee = getUser(task.assignedTo);

                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                size="small"
                                className={`kanban-card ${task.status}`}
                                style={{
                                  marginBottom: 12,
                                  cursor: "pointer",
                                  transform: snapshot.isDragging
                                    ? "rotate(5deg)"
                                    : "none",
                                  ...provided.draggableProps.style,
                                }}
                                hoverable
                                onClick={() => handleEdit(task)}
                              >
                                <div style={{ marginBottom: 8 }}>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "13px",
                                      display: "block",
                                    }}
                                  >
                                    {task.title.length > 50
                                      ? task.title.substring(0, 50) + "..."
                                      : task.title}
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "11px" }}
                                  >
                                    {project?.name}
                                  </Text>
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                  <Progress
                                    percent={task.progress}
                                    size="small"
                                    showInfo={false}
                                  />
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "11px",
                                  }}
                                >
                                  <div className="task-avatar">
                                    <Avatar
                                      size={16}
                                      style={{ backgroundColor: "#1890ff" }}
                                    >
                                      {assignee?.name?.charAt(0) || "?"}
                                    </Avatar>
                                    <span style={{ marginLeft: 4 }}>
                                      {assignee?.name || "Unassigned"}
                                    </span>
                                  </div>

                                  <Tag
                                    color={getPriorityColor(task.priority)}
                                    size="small"
                                  >
                                    {task.priority}
                                  </Tag>
                                </div>

                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "#999",
                                    marginTop: 4,
                                    textAlign: "right",
                                  }}
                                >
                                  Due: {dayjs(task.dueDate).format("MMM DD")}
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>
          );
        })}
      </Row>
    </DragDropContext>
  );

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]} // gap between rows/columns
        style={{ marginBottom: 12 }}
      >
        <Col xs={24} sm={12} md={8}>
          <Title level={3} style={{ margin: 0 }}>
            Task Management
          </Title>
        </Col>

        <Col
          xs={24}
          sm={12}
          style={{
            display: "flex",
            alignItems: "self-end",
            gap: 8,
            justifyContent: "space-between",
          }}
        >
          <Tabs
            activeKey={viewType}
            onChange={(key) => setViewType(key as "table" | "kanban")}
            size="small"
            tabBarStyle={{ marginBottom: 0 }}
            items={[
              { key: "table", label: "Table View" },
              { key: "kanban", label: "Kanban Board" },
            ]}
          />
          {user?.role !== "executive" && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Task
            </Button>
          )}
        </Col>
      </Row>

      {viewType === "table" ? (
        <Card>
          <Table
            dataSource={userTasks}
            columns={columns}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
              size: "small",
              position: ["topRight"],
            }}
            size="small"
          />
        </Card>
      ) : (
        renderKanbanView()
      )}

      <Modal
        title={editingTask ? "Edit Task" : "Add New Task"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={editingTask ? "Update" : "Create"}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "not-started",
            priority: "medium",
            progress: 0,
          }}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter task description" },
            ]}
          >
            <TextArea rows={3} placeholder="Task description..." />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="projectId"
                label="Project"
                rules={[{ required: true, message: "Please select project" }]}
              >
                <Select placeholder="Select project">
                  {userProjects.map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="assignedTo"
                label="Assign To"
                rules={[{ required: true, message: "Please select assignee" }]}
              >
                <Select placeholder="Select assignee">
                  {(assignableUsers || []).map((assignUser) => (
                    <Option key={assignUser.id} value={assignUser.id}>
                      {assignUser.name} ({assignUser.role})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item name="building" label="Building">
                <Input placeholder="Building A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="floor" label="Floor">
                <Input placeholder="Floor 1" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="unit" label="Unit">
                <Input placeholder="Unit 101" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Please select priority" }]}
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="not-started">Not Started</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="on-hold">On Hold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="progress" label="Progress (%)">
            <Progress
              percent={Form.useWatch("progress", form) || 0}
              style={{ marginBottom: 8 }}
            />
            <input
              type="range"
              min="0"
              max="100"
              style={{ width: "100%" }}
              onChange={(e) =>
                form.setFieldsValue({ progress: parseInt(e.target.value) })
              }
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="dependencies" label="Task Dependencies">
                <Select
                  mode="multiple"
                  placeholder="Select dependent tasks"
                  allowClear
                >
                  {userTasks
                    .filter((t) => t.id !== editingTask?.id)
                    .map((task) => (
                      <Option key={task.id} value={task.id}>
                        {task.title}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="canStartWithoutDependency"
                label="Can Start Without Dependencies"
                valuePropName="checked"
              >
                <input type="checkbox" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="estimatedHours" label="Estimated Hours">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="unitType" label="Unit Type">
                <Select placeholder="Select unit type" allowClear>
                  <Option value="1BHK">1BHK</Option>
                  <Option value="2BHK">2BHK</Option>
                  <Option value="3BHK">3BHK</Option>
                  <Option value="4BHK">4BHK</Option>
                  <Option value="5BHK">5BHK</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Attach Files">
            <Upload multiple beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Details Modal */}
      <Modal
        title={`Task Details: ${viewingTask?.title}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={900}
        footer={[
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsViewModalVisible(false);
              if (viewingTask) handleEdit(viewingTask);
            }}
          >
            Edit Task
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {viewingTask && (
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Task Information">
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Project: </Text>
                    <Text>{getProjectById(viewingTask.projectId)?.name}</Text>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Location: </Text>
                    <Text>
                      {viewingTask.building} • {viewingTask.floor} •{" "}
                      {viewingTask.unit}
                    </Text>
                  </div>
                  {viewingTask.unitType && (
                    <div style={{ marginBottom: 12 }}>
                      <Text strong>Unit Type: </Text>
                      <Tag color="blue">{viewingTask.unitType}</Tag>
                    </div>
                  )}
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Assigned To: </Text>
                    <Text>
                      {getUser(viewingTask.assignedTo)?.name || "Unassigned"}
                    </Text>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Priority: </Text>
                    <Tag color={getPriorityColor(viewingTask.priority)}>
                      {viewingTask.priority.toUpperCase()}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Status: </Text>
                    <Tag color={getStatusColor(viewingTask.status)}>
                      {viewingTask.status.replace("-", " ").toUpperCase()}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Progress: </Text>
                    <Progress percent={viewingTask.progress} size="small" />
                  </div>
                  {viewingTask.estimatedHours && (
                    <div style={{ marginBottom: 12 }}>
                      <Text strong>Time: </Text>
                      <Text>
                        {viewingTask.actualHours || 0}h /{" "}
                        {viewingTask.estimatedHours}h
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Dependencies & Status">
                  {(() => {
                    const { dependencies, dependents } = getTaskDependencies(
                      viewingTask.id
                    );
                    const canStart = canStartTask(viewingTask.id);

                    return (
                      <div>
                        {dependencies.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <Text strong>Depends On:</Text>
                            <div style={{ marginTop: 8 }}>
                              {dependencies.map((dep) => (
                                <div
                                  key={dep.id}
                                  style={{
                                    padding: "4px 8px",
                                    background: "#f5f5f5",
                                    borderRadius: "4px",
                                    marginBottom: "4px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text style={{ fontSize: "12px" }}>
                                    {dep.title}
                                  </Text>
                                  <Tag
                                    color={
                                      dep.status === "completed"
                                        ? "green"
                                        : "orange"
                                    }
                                    size="small"
                                  >
                                    {dep.status}
                                  </Tag>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dependents.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <Text strong>Blocks These Tasks:</Text>
                            <div style={{ marginTop: 8 }}>
                              {dependents.map((dep) => (
                                <div
                                  key={dep.id}
                                  style={{
                                    padding: "4px 8px",
                                    background: "#f0f9ff",
                                    borderRadius: "4px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <Text style={{ fontSize: "12px" }}>
                                    {dep.title}
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          style={{
                            padding: "8px",
                            background: canStart ? "#f6ffed" : "#fff7e6",
                            border: `1px solid ${
                              canStart ? "#b7eb8f" : "#ffd591"
                            }`,
                            borderRadius: "4px",
                          }}
                        >
                          <Text
                            strong
                            style={{ color: canStart ? "#52c41a" : "#faad14" }}
                          >
                            {canStart
                              ? "✅ Ready to Start"
                              : "⚠️ Waiting for Dependencies"}
                          </Text>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <Card size="small" title="Description">
                  <Paragraph>{viewingTask.description}</Paragraph>
                </Card>
              </Col>
            </Row>

            {viewingTask.photos && viewingTask.photos.length > 0 && (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                  <Card size="small" title="Photos">
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {viewingTask.photos.map((photo, index) => (
                        <div
                          key={index}
                          style={{
                            width: 100,
                            height: 100,
                            background: "#f5f5f5",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #d9d9d9",
                          }}
                        >
                          <CameraOutlined
                            style={{ fontSize: 24, color: "#999" }}
                          />
                          <div style={{ fontSize: "10px", marginTop: 4 }}>
                            {photo}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <Card size="small" title="Comments & Updates">
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: "auto",
                      marginBottom: 16,
                    }}
                  >
                    {getTaskComments(viewingTask.id).map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          padding: "8px 12px",
                          background: "#f9f9f9",
                          borderRadius: "6px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <Text strong style={{ fontSize: "12px" }}>
                            {comment.userName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            {dayjs(comment.date).format("MMM DD, HH:mm")}
                          </Text>
                        </div>
                        <Text style={{ fontSize: "13px" }}>{comment.text}</Text>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Input.TextArea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                    />
                    <Button
                      type="primary"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;

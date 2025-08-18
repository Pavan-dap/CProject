// import React, { useRef, useState } from "react";
// import {
//   Card,
//   Typography,
//   Space,
//   Button,
//   Select,
//   DatePicker,
//   Row,
//   Col,
// } from "antd";
// import {
//   CalendarOutlined,
//   ProjectOutlined,
//   FullscreenOutlined,
//   ZoomInOutlined,
//   ZoomOutOutlined,
//   LinkOutlined,
//   ExclamationCircleOutlined,
// } from "@ant-design/icons";
// import { useData } from "../contexts/DataContext";
// import { useAuth } from "../contexts/AuthContext";
// import dayjs from "dayjs";
// import minMax from "dayjs/plugin/minMax";
// import quarterOfYear from "dayjs/plugin/quarterOfYear";
// import weekOfYear from "dayjs/plugin/weekOfYear";

// dayjs.extend(minMax);
// dayjs.extend(quarterOfYear);
// dayjs.extend(weekOfYear);

// const { Title } = Typography;
// const { Option } = Select;

// // Simple Gantt Chart implementation using CSS and HTML
// const GanttChart: React.FC = () => {
//   const { user } = useAuth();
//   const { projects, tasks } = useData();
//   const ganttRef = useRef<HTMLDivElement>(null);
//   const getQuarter = (date: dayjs.Dayjs) => Math.floor(date.month() / 3) + 1;

//   // Filter states
//   const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
//     null
//   );
//   const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
//   const [dateRange, setDateRange] = useState<
//     [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
//   >(null);
//   const [timelineView, setTimelineView] = useState<
//     "week" | "month" | "quarter"
//   >("month");

//   // Filter data based on user role
//   let userProjects =
//     user?.role === "admin"
//       ? projects
//       : projects.filter(
//           (p) =>
//             user?.role === "admin" || user?.projects?.includes(String(p.id))
//         );

//   let userTasks =
//     user?.role === "executive"
//       ? tasks.filter((t) => t.assignedTo === user.id)
//       : tasks.filter((t) => userProjects.some((p) => p.id === t.projectId));

//   // Apply timeline filters
//   // 1. Project filter - when selected, show only that project
//   if (selectedProjectId) {
//     userProjects = userProjects.filter((p) => p.id === selectedProjectId);
//     userTasks = userTasks.filter((t) => t.projectId === selectedProjectId);
//   }

//   // 2. Status filter - apply to both projects and tasks
//   if (selectedStatus) {
//     userProjects = userProjects.filter((p) => p.status === selectedStatus);
//     userTasks = userTasks.filter((t) => t.status === selectedStatus);
//   }

//   // 3. Date range filter - show items that overlap with selected date range
//   if (dateRange && dateRange[0] && dateRange[1]) {
//     const startDate = dateRange[0];
//     const endDate = dateRange[1];

//     userProjects = userProjects.filter((p) => {
//       const projectStart = dayjs(p.startDate);
//       const projectEnd = dayjs(p.endDate);
//       // Check if project dates overlap with filter range
//       return (
//         projectStart.isBefore(endDate.add(1, "day")) &&
//         projectEnd.isAfter(startDate.subtract(1, "day"))
//       );
//     });

//     userTasks = userTasks.filter((t) => {
//       const taskStart = dayjs(t.createdDate);
//       const taskEnd = dayjs(t.dueDate);
//       // Check if task dates overlap with filter range
//       return (
//         taskStart.isBefore(endDate.add(1, "day")) &&
//         taskEnd.isAfter(startDate.subtract(1, "day"))
//       );
//     });
//   }

//   // Get task dependencies for visual connections
//   const { getTaskDependencies, canStartTask } = useData();

//   // Generate timeline data
//   const generateTimelineData = () => {
//     const allItems = [
//       ...userProjects.map((project) => ({
//         id: `project-${project.id}`,
//         name: project.name,
//         type: "project",
//         start: dayjs(project.startDate),
//         end: dayjs(project.endDate),
//         progress: project.progress,
//         status: project.status,
//         parent: null,
//         level: 0,
//       })),
//       ...userTasks.map((task) => ({
//         id: `task-${task.id}`,
//         name: task.title,
//         type: "task",
//         start: dayjs(task.createdDate),
//         end: dayjs(task.dueDate),
//         progress: task.progress,
//         status: task.status,
//         parent: `project-${task.projectId}`,
//         level: 1,
//         priority: task.priority,
//       })),
//     ];

//     return allItems.sort((a, b) => {
//       if (a.level !== b.level) return a.level - b.level;
//       return a.start.valueOf() - b.start.valueOf();
//     });
//   };

//   const timelineData = generateTimelineData();

//   // Calculate timeline bounds
//   const getTimelineBounds = () => {
//     if (timelineData.length === 0)
//       return { start: dayjs(), end: dayjs().add(1, "month") };

//     const starts = timelineData.map((item) => item.start);
//     const ends = timelineData.map((item) => item.end);

//     const minStart = dayjs.min(starts)?.subtract(1, "week") || dayjs();
//     const maxEnd = dayjs.max(ends)?.add(1, "week") || dayjs().add(1, "month");

//     return { start: minStart, end: maxEnd };
//   };

//   const { start: timelineStart, end: timelineEnd } = getTimelineBounds();
//   const totalDays = timelineEnd.diff(timelineStart, "days");

//   // Generate timeline headers based on view type
//   const generateTimelineHeaders = () => {
//     switch (timelineView) {
//       case "week":
//         return generateWeekHeaders();
//       case "quarter":
//         return generateQuarterHeaders();
//       default:
//         return generateMonthHeaders();
//     }
//   };

//   // Generate week headers
//   const generateWeekHeaders = () => {
//     const weeks = [];
//     let current = timelineStart.startOf("week");

//     while (current.isBefore(timelineEnd)) {
//       const weekEnd = current.endOf("week");
//       const daysInWeek = Math.min(7, timelineEnd.diff(current, "days") + 1);

//       weeks.push({
//         label: `Week ${current.week()} (${current.format(
//           "MMM DD"
//         )} - ${weekEnd.format("MMM DD")})`,
//         days: daysInWeek,
//         width: (daysInWeek / totalDays) * 100,
//       });

//       current = current.add(1, "week");
//     }

//     return weeks;
//   };

//   // Generate month headers
//   const generateMonthHeaders = () => {
//     const months = [];
//     let current = timelineStart.startOf("month");

//     while (current.isBefore(timelineEnd)) {
//       const daysInMonth = Math.min(
//         current.daysInMonth(),
//         timelineEnd.diff(current, "days") + 1
//       );

//       months.push({
//         label: current.format("MMM YYYY"),
//         days: daysInMonth,
//         width: (daysInMonth / totalDays) * 100,
//       });

//       current = current.add(1, "month");
//     }

//     return months;
//   };

//   // Generate quarter headers
//   const generateQuarterHeaders = () => {
//     const quarters = [];
//     let current = timelineStart.startOf("quarter");

//     while (current.isBefore(timelineEnd)) {
//       const quarterEnd = current.endOf("quarter");
//       const daysInQuarter = Math.min(
//         quarterEnd.diff(current, "days") + 1,
//         timelineEnd.diff(current, "days") + 1
//       );

//       quarters.push({
//         label: `Q${getQuarter(current)} ${current.format(
//           "YYYY"
//         )} (${current.format("MMM")} - ${quarterEnd.format("MMM")})`,
//         days: daysInQuarter,
//         width: (daysInQuarter / totalDays) * 100,
//       });

//       current = current.add(1, "quarter");
//     }

//     return quarters;
//   };

//   const timelineHeaders = generateTimelineHeaders();

//   // Calculate bar position and width
//   const calculateBarStyle = (item: any) => {
//     const startOffset = item.start.diff(timelineStart, "days");
//     const duration = item.end.diff(item.start, "days") + 1;

//     const left = (startOffset / totalDays) * 100;
//     const width = (duration / totalDays) * 100;

//     return { left: `${left}%`, width: `${width}%` };
//   };

//   // Get status color
//   const getStatusColor = (status: string, type: string) => {
//     if (type === "project") {
//       const colors = {
//         planning: "#faad14",
//         "in-progress": "#1890ff",
//         completed: "#52c41a",
//         "on-hold": "#f5222d",
//       };
//       return colors[status as keyof typeof colors] || "#d9d9d9";
//     } else {
//       const colors = {
//         "not-started": "#d9d9d9",
//         "in-progress": "#1890ff",
//         completed: "#52c41a",
//         "on-hold": "#faad14",
//       };
//       return colors[status as keyof typeof colors] || "#d9d9d9";
//     }
//   };

//   const getPriorityColor = (priority?: string) => {
//     const colors = { high: "#f5222d", medium: "#faad14", low: "#52c41a" };
//     return colors[priority as keyof typeof colors] || "#1890ff";
//   };

//   return (
//     <div>
//       <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
//         <Col>
//           <Title level={3} style={{ margin: 0 }}>
//             <CalendarOutlined /> Project Timeline (Gantt Chart)
//           </Title>
//         </Col>
//         <Col>
//           <Space>
//             <Select
//               value={timelineView}
//               onChange={(value) => setTimelineView(value)}
//               style={{ width: 120 }}
//             >
//               <Option value="week">Week View</Option>
//               <Option value="month">Month View</Option>
//               <Option value="quarter">Quarter View</Option>
//             </Select>
//             <Button icon={<ZoomInOutlined />} />
//             <Button icon={<ZoomOutOutlined />} />
//             <Button icon={<FullscreenOutlined />} />
//           </Space>
//         </Col>
//       </Row>

//       <Card>
//         <div style={{ marginBottom: 16 }}>
//           {/* Filter Status */}
//           <div
//             style={{
//               marginBottom: 12,
//               padding: "8px 12px",
//               backgroundColor:
//                 selectedProjectId || selectedStatus || dateRange
//                   ? "#f6ffed"
//                   : "#f5f5f5",
//               border:
//                 selectedProjectId || selectedStatus || dateRange
//                   ? "1px solid #b7eb8f"
//                   : "1px solid #d9d9d9",
//               borderRadius: "4px",
//               fontSize: "12px",
//             }}
//           >
//             <Space>
//               {selectedProjectId || selectedStatus || dateRange ? (
//                 <>
//                   <span>Active Filters:</span>
//                   {selectedProjectId && (
//                     <span
//                       style={{
//                         background: "#52c41a",
//                         color: "#fff",
//                         padding: "2px 6px",
//                         borderRadius: "2px",
//                       }}
//                     >
//                       Project:{" "}
//                       {projects.find((p) => p.id === selectedProjectId)?.name}
//                     </span>
//                   )}
//                   {selectedStatus && (
//                     <span
//                       style={{
//                         background: "#1890ff",
//                         color: "#fff",
//                         padding: "2px 6px",
//                         borderRadius: "2px",
//                       }}
//                     >
//                       Status: {selectedStatus}
//                     </span>
//                   )}
//                   {dateRange && dateRange[0] && dateRange[1] && (
//                     <span
//                       style={{
//                         background: "#722ed1",
//                         color: "#fff",
//                         padding: "2px 6px",
//                         borderRadius: "2px",
//                       }}
//                     >
//                       Date: {dateRange[0].format("MMM DD")} -{" "}
//                       {dateRange[1].format("MMM DD")}
//                     </span>
//                   )}
//                 </>
//               ) : (
//                 <span>No filters applied - showing all data</span>
//               )}
//               <span style={{ color: "#666" }}>
//                 | Showing: {userProjects.length} projects, {userTasks.length}{" "}
//                 tasks
//               </span>
//             </Space>
//           </div>

//           <Row gutter={[16, 16]} align="middle">
//             <Col xs={24} sm={6}>
//               <Select
//                 placeholder="Filter by Project (All by default)"
//                 style={{ width: "100%" }}
//                 allowClear
//                 value={selectedProjectId}
//                 onChange={(value) => setSelectedProjectId(value)}
//               >
//                 {projects
//                   .filter(
//                     (p) =>
//                       user?.role === "admin" ||
//                       user?.projects?.includes(String(p.id))
//                   )
//                   .map((project) => (
//                     <Option key={project.id} value={project.id}>
//                       {project.name}
//                     </Option>
//                   ))}
//               </Select>
//             </Col>
//             <Col xs={24} sm={6}>
//               <Select
//                 placeholder="Filter by Status (All by default)"
//                 style={{ width: "100%" }}
//                 allowClear
//                 value={selectedStatus}
//                 onChange={(value) => setSelectedStatus(value)}
//               >
//                 <Option value="planning">Planning</Option>
//                 <Option value="in-progress">In Progress</Option>
//                 <Option value="completed">Completed</Option>
//                 <Option value="on-hold">On Hold</Option>
//                 <Option value="not-started">Not Started</Option>
//               </Select>
//             </Col>
//             <Col xs={24} sm={6}>
//               <DatePicker.RangePicker
//                 style={{ width: "100%" }}
//                 placeholder={["Start Date", "End Date"]}
//                 value={dateRange}
//                 onChange={(dates) => setDateRange(dates)}
//               />
//             </Col>
//             <Col xs={24} sm={6}>
//               <Button
//                 onClick={() => {
//                   setSelectedProjectId(null);
//                   setSelectedStatus(null);
//                   setDateRange(null);
//                 }}
//                 style={{ width: "100%" }}
//               >
//                 Clear Filters
//               </Button>
//             </Col>
//           </Row>
//         </div>

//         <div
//           ref={ganttRef}
//           style={{
//             border: "1px solid #f0f0f0",
//             borderRadius: "6px",
//             overflow: "auto",
//             minHeight: "500px",
//             backgroundColor: "#fafafa",
//           }}
//         >
//           {/* Header */}
//           <div
//             style={{
//               display: "flex",
//               borderBottom: "2px solid #e8e8e8",
//               backgroundColor: "#fff",
//               position: "sticky",
//               top: 0,
//               zIndex: 10,
//             }}
//           >
//             {/* Task Names Column */}
//             <div
//               style={{
//                 width: "300px",
//                 minWidth: "300px",
//                 borderRight: "2px solid #e8e8e8",
//                 backgroundColor: "#fafafa",
//               }}
//             >
//               <div
//                 style={{
//                   padding: "12px 16px",
//                   fontWeight: "bold",
//                   borderBottom: "1px solid #e8e8e8",
//                   backgroundColor: "#f5f5f5",
//                 }}
//               >
//                 Task / Project Name
//               </div>
//             </div>

//             {/* Timeline Header */}
//             <div style={{ flex: 1, minWidth: "800px" }}>
//               {/* Timeline Headers */}
//               <div
//                 style={{
//                   display: "flex",
//                   borderBottom: "1px solid #e8e8e8",
//                   backgroundColor: "#f5f5f5",
//                 }}
//               >
//                 {timelineHeaders.map((header, index) => (
//                   <div
//                     key={index}
//                     style={{
//                       width: `${header.width}%`,
//                       padding: "8px 4px",
//                       textAlign: "center",
//                       fontSize: timelineView === "week" ? "10px" : "12px",
//                       fontWeight: "bold",
//                       borderRight:
//                         index < timelineHeaders.length - 1
//                           ? "1px solid #e8e8e8"
//                           : "none",
//                       minHeight: "32px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     {header.label}
//                   </div>
//                 ))}
//               </div>

//               {/* Sub-grid based on view type */}
//               {timelineView === "month" && (
//                 <div
//                   style={{
//                     display: "flex",
//                     height: "30px",
//                     backgroundColor: "#f9f9f9",
//                   }}
//                 >
//                   {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => (
//                     <div
//                       key={i}
//                       style={{
//                         width: `${(7 / totalDays) * 100}%`,
//                         borderRight: "1px solid #e8e8e8",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: "10px",
//                         color: "#666",
//                       }}
//                     >
//                       W{i + 1}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {timelineView === "quarter" && (
//                 <div
//                   style={{
//                     display: "flex",
//                     height: "30px",
//                     backgroundColor: "#f9f9f9",
//                   }}
//                 >
//                   {Array.from({ length: Math.ceil(totalDays / 30) }, (_, i) => {
//                     const monthStart = timelineStart.add(i * 30, "day");
//                     return (
//                       <div
//                         key={i}
//                         style={{
//                           width: `${(30 / totalDays) * 100}%`,
//                           borderRight: "1px solid #e8e8e8",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontSize: "10px",
//                           color: "#666",
//                         }}
//                       >
//                         {monthStart.format("MMM")}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Gantt Rows */}
//           <div>
//             {timelineData.map((item, index) => (
//               <div
//                 key={item.id}
//                 style={{
//                   display: "flex",
//                   borderBottom: "1px solid #f0f0f0",
//                   minHeight: "50px",
//                   backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
//                 }}
//               >
//                 {/* Task Name */}
//                 <div
//                   style={{
//                     width: "300px",
//                     minWidth: "300px",
//                     borderRight: "1px solid #f0f0f0",
//                     padding: "12px 16px",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <div
//                     style={{
//                       marginLeft: item.level * 20,
//                       width: "100%",
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontWeight: item.type === "project" ? "bold" : "normal",
//                         fontSize: item.type === "project" ? "14px" : "13px",
//                         color: item.type === "project" ? "#1890ff" : "#333",
//                         marginBottom: "2px",
//                       }}
//                     >
//                       {item.type === "project" && (
//                         <ProjectOutlined style={{ marginRight: 8 }} />
//                       )}
//                       {item.name.length > 35
//                         ? item.name.substring(0, 35) + "..."
//                         : item.name}
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#666",
//                       }}
//                     >
//                       {item.start.format("MMM DD")} -{" "}
//                       {item.end.format("MMM DD, YYYY")}
//                       {item.type === "task" &&
//                         "priority" in item &&
//                         item.priority && (
//                           <span
//                             style={{
//                               marginLeft: 8,
//                               color: getPriorityColor(item.priority),
//                               fontWeight: "bold",
//                             }}
//                           >
//                             {item.priority.toUpperCase()}
//                           </span>
//                         )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Timeline Bar */}
//                 <div
//                   style={{
//                     flex: 1,
//                     minWidth: "800px",
//                     position: "relative",
//                     padding: "15px 0",
//                   }}
//                 >
//                   {/* Background Grid */}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: 0,
//                       left: 0,
//                       right: 0,
//                       bottom: 0,
//                       display: "flex",
//                     }}
//                   >
//                     {timelineView === "week"
//                       ? Array.from({ length: totalDays }, (_, i) => (
//                           <div
//                             key={i}
//                             style={{
//                               width: `${(1 / totalDays) * 100}%`,
//                               borderRight: "1px solid #f0f0f0",
//                             }}
//                           />
//                         ))
//                       : timelineView === "quarter"
//                       ? Array.from(
//                           { length: Math.ceil(totalDays / 30) },
//                           (_, i) => (
//                             <div
//                               key={i}
//                               style={{
//                                 width: `${(30 / totalDays) * 100}%`,
//                                 borderRight: "1px solid #f0f0f0",
//                               }}
//                             />
//                           )
//                         )
//                       : Array.from(
//                           { length: Math.ceil(totalDays / 7) },
//                           (_, i) => (
//                             <div
//                               key={i}
//                               style={{
//                                 width: `${(7 / totalDays) * 100}%`,
//                                 borderRight: "1px solid #f0f0f0",
//                               }}
//                             />
//                           )
//                         )}
//                   </div>

//                   {/* Progress Bar */}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: "50%",
//                       transform: "translateY(-50%)",
//                       height: item.type === "project" ? "24px" : "18px",
//                       backgroundColor: getStatusColor(item.status, item.type),
//                       borderRadius: "4px",
//                       display: "flex",
//                       alignItems: "center",
//                       boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                       ...calculateBarStyle(item),
//                     }}
//                   >
//                     {/* Progress Fill */}
//                     <div
//                       style={{
//                         height: "100%",
//                         width: `${item.progress}%`,
//                         backgroundColor:
//                           item.status === "completed" ? "#52c41a" : "#1890ff",
//                         borderRadius: "4px",
//                         opacity: 0.8,
//                       }}
//                     />

//                     {/* Progress Text */}
//                     <div
//                       style={{
//                         position: "absolute",
//                         left: "50%",
//                         transform: "translateX(-50%)",
//                         fontSize: "10px",
//                         color: "#fff",
//                         fontWeight: "bold",
//                         textShadow: "0 1px 2px rgba(0,0,0,0.5)",
//                       }}
//                     >
//                       {item.progress}%
//                     </div>
//                   </div>
//                   {item.type === "task" &&
//                     (() => {
//                       const taskId = parseInt(item.id.replace("task-", ""));
//                       const { dependencies } = getTaskDependencies(taskId);
//                       const canStart = canStartTask(taskId);
//                       return (
//                         <>
//                           {dependencies.length > 0 && (
//                             <LinkOutlined
//                               style={{
//                                 marginRight: 4,
//                                 color: "#1890ff",
//                                 fontSize: "12px",
//                               }}
//                             />
//                           )}
//                           {!canStart && (
//                             <ExclamationCircleOutlined
//                               style={{
//                                 marginRight: 4,
//                                 color: "#faad14",
//                                 fontSize: "12px",
//                               }}
//                             />
//                           )}
//                         </>
//                       );
//                     })()}

//                   {/* Today Line */}
//                   {(() => {
//                     const today = dayjs();
//                     if (
//                       today.isAfter(timelineStart) &&
//                       today.isBefore(timelineEnd)
//                     ) {
//                       const todayOffset = today.diff(timelineStart, "days");
//                       const todayPosition = (todayOffset / totalDays) * 100;

//                       return (
//                         <div
//                           style={{
//                             position: "absolute",
//                             left: `${todayPosition}%`,
//                             top: 0,
//                             bottom: 0,
//                             width: "2px",
//                             backgroundColor: "#f5222d",
//                             zIndex: 5,
//                           }}
//                         />
//                       );
//                     }
//                     return null;
//                   })()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Legend */}
//         <div
//           style={{
//             marginTop: 16,
//             padding: "12px",
//             backgroundColor: "#f9f9f9",
//             borderRadius: "6px",
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "16px",
//             fontSize: "12px",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <div
//               style={{
//                 width: "12px",
//                 height: "12px",
//                 backgroundColor: "#1890ff",
//                 borderRadius: "2px",
//               }}
//             />
//             <span>In Progress</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <div
//               style={{
//                 width: "12px",
//                 height: "12px",
//                 backgroundColor: "#52c41a",
//                 borderRadius: "2px",
//               }}
//             />
//             <span>Completed</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <div
//               style={{
//                 width: "12px",
//                 height: "12px",
//                 backgroundColor: "#faad14",
//                 borderRadius: "2px",
//               }}
//             />
//             <span>Planning/On Hold</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <div
//               style={{
//                 width: "2px",
//                 height: "12px",
//                 backgroundColor: "#f5222d",
//               }}
//             />
//             <span>Today</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <ProjectOutlined style={{ color: "#1890ff" }} />
//             <span>Project</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <LinkOutlined style={{ color: "#1890ff" }} />
//             <span>Has Dependencies</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <ExclamationCircleOutlined style={{ color: "#faad14" }} />
//             <span>Waiting for Dependencies</span>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default GanttChart;




import React, { useRef, useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  ProjectOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(minMax);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);

const { Title } = Typography;
const { Option } = Select;

interface TimelineItem {
  id: string;
  name: string;
  type: "project" | "task";
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  progress: number;
  status: string;
  parent: string | null;
  level: number;
  priority?: string;
  projectId?: number;
  taskId?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
}

// Enhanced Gantt Chart implementation with hierarchical structure
const GanttChart: React.FC = () => {
  const { user } = useAuth();
  const { projects, tasks } = useData();
  console.log("projects", projects);
  console.log("tasks", tasks);
  
  const ganttRef = useRef<HTMLDivElement>(null);
  const getQuarter = (date: dayjs.Dayjs) => Math.floor(date.month() / 3) + 1;

  // Filter states
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [timelineView, setTimelineView] = useState<"week" | "month" | "quarter">("month");
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Filter data based on user role
  let userProjects =
    user?.role === "admin"
      ? projects
      : projects.filter(
          (p) =>
            user?.role === "admin" || user?.projects?.includes(String(p.id))
        );

  let userTasks =
    user?.role === "executive"
      ? tasks.filter((t) => t.assignedTo === user.id)
      : tasks.filter((t) => userProjects.some((p) => p.id === t.projectId));

  // Apply timeline filters
  if (selectedProjectId) {
    userProjects = userProjects.filter((p) => p.id === selectedProjectId);
    userTasks = userTasks.filter((t) => t.projectId === selectedProjectId);
  }

  if (selectedStatus) {
    userProjects = userProjects.filter((p) => p.status === selectedStatus);
    userTasks = userTasks.filter((t) => t.status === selectedStatus);
  }

  if (dateRange && dateRange[0] && dateRange[1]) {
    const startDate = dateRange[0];
    const endDate = dateRange[1];

    userProjects = userProjects.filter((p) => {
      const projectStart = dayjs(p.startDate);
      const projectEnd = dayjs(p.endDate);
      return (
        projectStart.isBefore(endDate.add(1, "day")) &&
        projectEnd.isAfter(startDate.subtract(1, "day"))
      );
    });

    userTasks = userTasks.filter((t) => {
      const taskStart = dayjs(t.createdDate);
      const taskEnd = dayjs(t.dueDate);
      return (
        taskStart.isBefore(endDate.add(1, "day")) &&
        taskEnd.isAfter(startDate.subtract(1, "day"))
      );
    });
  }

  // Get task dependencies for visual connections
  const { getTaskDependencies, canStartTask } = useData();

  // Generate hierarchical timeline data
  const generateTimelineData = (): TimelineItem[] => {
    const allItems: TimelineItem[] = [];

    // Add projects and their tasks in hierarchical order
    userProjects.forEach((project) => {
      // Add project
      const projectTasks = userTasks.filter((t) => t.projectId === project.id);
      const hasChildren = projectTasks.length > 0;
      
      allItems.push({
        id: `project-${project.id}`,
        name: project.name,
        type: "project",
        start: dayjs(project.startDate),
        end: dayjs(project.endDate),
        progress: project.progress,
        status: project.status,
        parent: null,
        level: 0,
        projectId: project.id,
        isExpanded: expandedProjects.has(project.id),
        hasChildren: hasChildren,
      });

      // Add tasks for this project (only if project is expanded)
      if (expandedProjects.has(project.id)) {
        projectTasks
          .sort((a, b) => dayjs(a.createdDate).valueOf() - dayjs(b.createdDate).valueOf())
          .forEach((task) => {
            allItems.push({
              id: `task-${task.id}`,
              name: task.title,
              type: "task",
              start: dayjs(task.createdDate),
              end: dayjs(task.dueDate),
              progress: task.progress,
              status: task.status,
              parent: `project-${task.projectId}`,
              level: 1,
              priority: task.priority,
              projectId: task.projectId,
              taskId: task.id,
            });
          });
      }
    });

    return allItems;
  };

  const timelineData = generateTimelineData();

  // Calculate timeline bounds
  const getTimelineBounds = () => {
    if (timelineData.length === 0)
      return { start: dayjs(), end: dayjs().add(1, "month") };

    const starts = timelineData.map((item) => item.start);
    const ends = timelineData.map((item) => item.end);

    const minStart = dayjs.min(starts)?.subtract(1, "week") || dayjs();
    const maxEnd = dayjs.max(ends)?.add(1, "week") || dayjs().add(1, "month");

    return { start: minStart, end: maxEnd };
  };

  const { start: timelineStart, end: timelineEnd } = getTimelineBounds();
  const totalDays = timelineEnd.diff(timelineStart, "days");

  // Generate timeline headers based on view type
  const generateTimelineHeaders = () => {
    switch (timelineView) {
      case "week":
        return generateWeekHeaders();
      case "quarter":
        return generateQuarterHeaders();
      default:
        return generateMonthHeaders();
    }
  };

  const generateWeekHeaders = () => {
    const weeks = [];
    let current = timelineStart.startOf("week");

    while (current.isBefore(timelineEnd)) {
      const weekEnd = current.endOf("week");
      const daysInWeek = Math.min(7, timelineEnd.diff(current, "days") + 1);

      weeks.push({
        label: `Week ${current.week()} (${current.format("MMM DD")} - ${weekEnd.format("MMM DD")})`,
        days: daysInWeek,
        width: (daysInWeek / totalDays) * 100,
      });

      current = current.add(1, "week");
    }

    return weeks;
  };

  const generateMonthHeaders = () => {
    const months = [];
    let current = timelineStart.startOf("month");

    while (current.isBefore(timelineEnd)) {
      const daysInMonth = Math.min(
        current.daysInMonth(),
        timelineEnd.diff(current, "days") + 1
      );

      months.push({
        label: current.format("MMM YYYY"),
        days: daysInMonth,
        width: (daysInMonth / totalDays) * 100,
      });

      current = current.add(1, "month");
    }

    return months;
  };

  const generateQuarterHeaders = () => {
    const quarters = [];
    let current = timelineStart.startOf("quarter");

    while (current.isBefore(timelineEnd)) {
      const quarterEnd = current.endOf("quarter");
      const daysInQuarter = Math.min(
        quarterEnd.diff(current, "days") + 1,
        timelineEnd.diff(current, "days") + 1
      );

      quarters.push({
        label: `Q${getQuarter(current)} ${current.format("YYYY")} (${current.format("MMM")} - ${quarterEnd.format("MMM")})`,
        days: daysInQuarter,
        width: (daysInQuarter / totalDays) * 100,
      });

      current = current.add(1, "quarter");
    }

    return quarters;
  };

  const timelineHeaders = generateTimelineHeaders();

  // Calculate bar position and width
  const calculateBarStyle = (item: TimelineItem) => {
    const startOffset = item.start.diff(timelineStart, "days");
    const duration = item.end.diff(item.start, "days") + 1;

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Get status color
  const getStatusColor = (status: string, type: string) => {
    if (type === "project") {
      const colors = {
        planning: "#faad14",
        "in-progress": "#1890ff",
        completed: "#52c41a",
        "on-hold": "#f5222d",
      };
      return colors[status as keyof typeof colors] || "#d9d9d9";
    } else {
      const colors = {
        "not-started": "#d9d9d9",
        "in-progress": "#1890ff",
        completed: "#52c41a",
        "on-hold": "#faad14",
      };
      return colors[status as keyof typeof colors] || "#d9d9d9";
    }
  };

  const getPriorityColor = (priority?: string) => {
    const colors = { high: "#f5222d", medium: "#faad14", low: "#52c41a" };
    return colors[priority as keyof typeof colors] || "#1890ff";
  };

  // Expand all projects by default for better UX
  React.useEffect(() => {
    if (userProjects.length > 0 && expandedProjects.size === 0) {
      setExpandedProjects(new Set(userProjects.map(p => p.id)));
    }
  }, [userProjects.length]);

  return (
    <div>
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined /> Project Timeline (Gantt Chart)
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={timelineView}
              onChange={(value) => setTimelineView(value)}
              style={{ width: 120 }}
            >
              <Option value="week">Week View</Option>
              <Option value="month">Month View</Option>
              <Option value="quarter">Quarter View</Option>
            </Select>
            <Button 
              onClick={() => setExpandedProjects(new Set(userProjects.map(p => p.id)))}
              size="small"
            >
              Expand All
            </Button>
            <Button 
              onClick={() => setExpandedProjects(new Set())}
              size="small"
            >
              Collapse All
            </Button>
            <Button icon={<ZoomInOutlined />} />
            <Button icon={<ZoomOutOutlined />} />
            <Button icon={<FullscreenOutlined />} />
          </Space>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          {/* Filter Status */}
          <div
            style={{
              marginBottom: 12,
              padding: "8px 12px",
              backgroundColor:
                selectedProjectId || selectedStatus || dateRange
                  ? "#f6ffed"
                  : "#f5f5f5",
              border:
                selectedProjectId || selectedStatus || dateRange
                  ? "1px solid #b7eb8f"
                  : "1px solid #d9d9d9",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <Space>
              {selectedProjectId || selectedStatus || dateRange ? (
                <>
                  <span>Active Filters:</span>
                  {selectedProjectId && (
                    <span
                      style={{
                        background: "#52c41a",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "2px",
                      }}
                    >
                      Project:{" "}
                      {projects.find((p) => p.id === selectedProjectId)?.name}
                    </span>
                  )}
                  {selectedStatus && (
                    <span
                      style={{
                        background: "#1890ff",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "2px",
                      }}
                    >
                      Status: {selectedStatus}
                    </span>
                  )}
                  {dateRange && dateRange[0] && dateRange[1] && (
                    <span
                      style={{
                        background: "#722ed1",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "2px",
                      }}
                    >
                      Date: {dateRange[0].format("MMM DD")} -{" "}
                      {dateRange[1].format("MMM DD")}
                    </span>
                  )}
                </>
              ) : (
                <span>No filters applied - showing all data</span>
              )}
              <span style={{ color: "#666" }}>
                | Showing: {userProjects.length} projects, {userTasks.length}{" "}
                tasks
              </span>
            </Space>
          </div>

          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by Project (All by default)"
                style={{ width: "100%" }}
                allowClear
                value={selectedProjectId}
                onChange={(value) => setSelectedProjectId(value)}
              >
                {projects
                  .filter(
                    (p) =>
                      user?.role === "admin" ||
                      user?.projects?.includes(String(p.id))
                  )
                  .map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by Status (All by default)"
                style={{ width: "100%" }}
                allowClear
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
              >
                <Option value="planning">Planning</Option>
                <Option value="in-progress">In Progress</Option>
                <Option value="completed">Completed</Option>
                <Option value="on-hold">On Hold</Option>
                <Option value="not-started">Not Started</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                placeholder={["Start Date", "End Date"]}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Button
                onClick={() => {
                  setSelectedProjectId(null);
                  setSelectedStatus(null);
                  setDateRange(null);
                }}
                style={{ width: "100%" }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </div>

        <div
          ref={ganttRef}
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "6px",
            overflow: "auto",
            minHeight: "500px",
            backgroundColor: "#fafafa",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid #e8e8e8",
              backgroundColor: "#fff",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {/* Task Names Column */}
            <div
              style={{
                width: "350px",
                minWidth: "350px",
                borderRight: "2px solid #e8e8e8",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  fontWeight: "bold",
                  borderBottom: "1px solid #e8e8e8",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Project / Task Name
              </div>
            </div>

            {/* Timeline Header */}
            <div style={{ flex: 1, minWidth: "800px" }}>
              {/* Timeline Headers */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #e8e8e8",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {timelineHeaders.map((header, index) => (
                  <div
                    key={index}
                    style={{
                      width: `${header.width}%`,
                      padding: "8px 4px",
                      textAlign: "center",
                      fontSize: timelineView === "week" ? "10px" : "12px",
                      fontWeight: "bold",
                      borderRight:
                        index < timelineHeaders.length - 1
                          ? "1px solid #e8e8e8"
                          : "none",
                      minHeight: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>

              {/* Sub-grid based on view type */}
              {timelineView === "month" && (
                <div
                  style={{
                    display: "flex",
                    height: "30px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        width: `${(7 / totalDays) * 100}%`,
                        borderRight: "1px solid #e8e8e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "#666",
                      }}
                    >
                      W{i + 1}
                    </div>
                  ))}
                </div>
              )}
              {timelineView === "quarter" && (
                <div
                  style={{
                    display: "flex",
                    height: "30px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {Array.from({ length: Math.ceil(totalDays / 30) }, (_, i) => {
                    const monthStart = timelineStart.add(i * 30, "day");
                    return (
                      <div
                        key={i}
                        style={{
                          width: `${(30 / totalDays) * 100}%`,
                          borderRight: "1px solid #e8e8e8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#666",
                        }}
                      >
                        {monthStart.format("MMM")}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Gantt Rows */}
          <div>
            {timelineData.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f0f0f0",
                  minHeight: "50px",
                  backgroundColor: 
                    item.type === "project" 
                      ? "#f0f9ff" 
                      : index % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                {/* Task Name */}
                <div
                  style={{
                    width: "350px",
                    minWidth: "350px",
                    borderRight: "1px solid #f0f0f0",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      marginLeft: item.level * 20,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* Expand/Collapse button for projects */}
                    {item.type === "project" && item.hasChildren && (
                      <Button
                        type="text"
                        size="small"
                        icon={
                          item.isExpanded ? (
                            <CaretDownOutlined />
                          ) : (
                            <CaretRightOutlined />
                          )
                        }
                        onClick={() => toggleProjectExpansion(item.projectId!)}
                        style={{ 
                          marginRight: 8,
                          padding: 0,
                          width: 16,
                          height: 16,
                          minWidth: 16,
                        }}
                      />
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: item.type === "project" ? "bold" : "normal",
                          fontSize: item.type === "project" ? "14px" : "13px",
                          color: item.type === "project" ? "#1890ff" : "#333",
                          marginBottom: "2px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {item.type === "project" && (
                          <ProjectOutlined style={{ marginRight: 8 }} />
                        )}
                        {item.name.length > 30
                          ? item.name.substring(0, 30) + "..."
                          : item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <span>
                          {item.start.format("MMM DD")} -{" "}
                          {item.end.format("MMM DD, YYYY")}
                        </span>
                        {item.type === "task" && item.priority && (
                          <span
                            style={{
                              color: getPriorityColor(item.priority),
                              fontWeight: "bold",
                              fontSize: "10px",
                              padding: "1px 4px",
                              backgroundColor: getPriorityColor(item.priority) + "20",
                              borderRadius: "2px",
                            }}
                          >
                            {item.priority.toUpperCase()}
                          </span>
                        )}
                        {item.type === "task" && (() => {
                          const taskId = item.taskId!;
                          const { dependencies } = getTaskDependencies(taskId);
                          const canStart = canStartTask(taskId);
                          return (
                            <>
                              {dependencies.length > 0 && (
                                <LinkOutlined
                                  style={{
                                    color: "#1890ff",
                                    fontSize: "10px",
                                  }}
                                  title={`Depends on ${dependencies.length} task(s)`}
                                />
                              )}
                              {!canStart && (
                                <ExclamationCircleOutlined
                                  style={{
                                    color: "#faad14",
                                    fontSize: "10px",
                                  }}
                                  title="Waiting for dependencies"
                                />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div
                  style={{
                    flex: 1,
                    minWidth: "800px",
                    position: "relative",
                    padding: "15px 0",
                  }}
                >
                  {/* Background Grid */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                    }}
                  >
                    {timelineView === "week"
                      ? Array.from({ length: totalDays }, (_, i) => (
                          <div
                            key={i}
                            style={{
                              width: `${(1 / totalDays) * 100}%`,
                              borderRight: "1px solid #f0f0f0",
                            }}
                          />
                        ))
                      : timelineView === "quarter"
                      ? Array.from(
                          { length: Math.ceil(totalDays / 30) },
                          (_, i) => (
                            <div
                              key={i}
                              style={{
                                width: `${(30 / totalDays) * 100}%`,
                                borderRight: "1px solid #f0f0f0",
                              }}
                            />
                          )
                        )
                      : Array.from(
                          { length: Math.ceil(totalDays / 7) },
                          (_, i) => (
                            <div
                              key={i}
                              style={{
                                width: `${(7 / totalDays) * 100}%`,
                                borderRight: "1px solid #f0f0f0",
                              }}
                            />
                          )
                        )}
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: item.type === "project" ? "28px" : "20px",
                      backgroundColor: getStatusColor(item.status, item.type),
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      boxShadow: item.type === "project" 
                        ? "0 3px 6px rgba(0,0,0,0.15)" 
                        : "0 2px 4px rgba(0,0,0,0.1)",
                      border: item.type === "project" ? "2px solid #1890ff" : "1px solid rgba(0,0,0,0.1)",
                      ...calculateBarStyle(item),
                    }}
                  >
                    {/* Progress Fill */}
                    <div
                      style={{
                        height: "100%",
                        width: `${item.progress}%`,
                        backgroundColor:
                          item.status === "completed" ? "#52c41a" : "#1890ff",
                        borderRadius: item.type === "project" ? "2px" : "3px",
                        opacity: 0.8,
                      }}
                    />

                    {/* Progress Text */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: item.type === "project" ? "11px" : "10px",
                        color: "#fff",
                        fontWeight: "bold",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {item.progress}%
                    </div>
                  </div>

                  {/* Today Line */}
                  {(() => {
                    const today = dayjs();
                    if (
                      today.isAfter(timelineStart) &&
                      today.isBefore(timelineEnd)
                    ) {
                      const todayOffset = today.diff(timelineStart, "days");
                      const todayPosition = (todayOffset / totalDays) * 100;

                      return (
                        <div
                          style={{
                            position: "absolute",
                            left: `${todayPosition}%`,
                            top: 0,
                            bottom: 0,
                            width: "2px",
                            backgroundColor: "#f5222d",
                            zIndex: 5,
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Legend */}
        <div
          style={{
            marginTop: 16,
            padding: "12px",
            backgroundColor: "#f9f9f9",
            borderRadius: "6px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "16px",
                height: "12px",
                backgroundColor: "#1890ff",
                borderRadius: "2px",
                border: "2px solid #1890ff",
              }}
            />
            <span>Project</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "8px",
                backgroundColor: "#1890ff",
                borderRadius: "2px",
              }}
            />
            <span>Task</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#1890ff",
                borderRadius: "2px",
              }}
            />
            <span>In Progress</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#52c41a",
                borderRadius: "2px",
              }}
            />
            <span>Completed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#faad14",
                borderRadius: "2px",
              }}
            />
            <span>Planning/On Hold</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#d9d9d9",
                borderRadius: "2px",
              }}
            />
            <span>Not Started</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "2px",
                height: "12px",
                backgroundColor: "#f5222d",
              }}
            />
            <span>Today</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ProjectOutlined style={{ color: "#1890ff" }} />
            <span>Project</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <LinkOutlined style={{ color: "#1890ff" }} />
            <span>Has Dependencies</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
            <span>Waiting for Dependencies</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#f5222d", fontWeight: "bold" }}>HIGH</span>
            <span style={{ color: "#faad14", fontWeight: "bold" }}>MED</span>
            <span style={{ color: "#52c41a", fontWeight: "bold" }}>LOW</span>
            <span style={{ marginLeft: "4px" }}>Priority</span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div
          style={{
            marginTop: 16,
            padding: "12px",
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#1890ff" }}>
              {userProjects.length}
            </div>
            <div style={{ color: "#666" }}>Projects</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#52c41a" }}>
              {userTasks.length}
            </div>
            <div style={{ color: "#666" }}>Tasks</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#f5222d" }}>
              {userTasks.filter(t => t.priority === "high").length}
            </div>
            <div style={{ color: "#666" }}>High Priority</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#faad14" }}>
              {userProjects.filter(p => p.status === "on-hold").length + 
               userTasks.filter(t => t.status === "on-hold").length}
            </div>
            <div style={{ color: "#666" }}>On Hold</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#52c41a" }}>
              {Math.round(
                (userProjects.reduce((sum, p) => sum + p.progress, 0) / 
                 (userProjects.length || 1))
              )}%
            </div>
            <div style={{ color: "#666" }}>Avg Progress</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GanttChart;
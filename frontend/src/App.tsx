import React, { useState, useEffect, useCallback } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  Typography,
  Badge,
  Tooltip,
} from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ProjectStatusReport from "./components/ProjectStatusReport";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import Tasks from "./components/Tasks";
import Reports from "./components/Reports";
import Users from "./components/Users";
import GanttChart from "./components/GanttChart";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { GlobalStateProvider } from "./contexts/GlobalStateContext";
import "./styles/App.css";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

type MenuItem = {
  key: string;
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
};

const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    roles: ["admin", "manager", "incharge", "executive"],
  },
  {
    key: "gantt",
    path: "/timeline",
    icon: <CalendarOutlined />,
    label: "Timeline",
    roles: ["admin", "manager", "incharge"],
  },
  {
    key: "projects",
    path: "/projects",
    icon: <ProjectOutlined />,
    label: "Projects",
    roles: ["admin", "manager", "incharge"],
  },
  {
    key: "tasks",
    path: "/tasks",
    icon: <CheckSquareOutlined />,
    label: "Tasks",
    roles: ["admin", "manager", "incharge", "executive"],
  },
  {
    key: "reports",
    path: "/reports",
    icon: <FileTextOutlined />,
    label: "Reports",
    roles: ["admin", "manager", "incharge"],
  },
  {
    key: "users",
    path: "/users",
    icon: <TeamOutlined />,
    label: "Users",
    roles: ["admin", "manager"],
  },
  {
    key: "status-report",
    path: "/status-report",
    icon: <FileTextOutlined />,
    label: "Status Report",
    roles: ["admin", "manager", "incharge"],
  },
];

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Get active menu based on current path
  const getActiveMenuKey = () => {
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname
    );
    return currentItem?.key || "dashboard";
  };

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    setIsMobile(mobile);
    setIsTablet(tablet);

    // Mobile: always collapsed (hidden)
    // Tablet/Desktop: user controls collapse state
    if (mobile) {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "#f5222d",
      manager: "#1890ff",
      incharge: "#52c41a",
      executive: "#fa8c16",
    };
    return colors[role as keyof typeof colors] || "#666";
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        marginLeft: isMobile ? 0 : collapsed ? 80 : 240,
      }}
    >
      {isMobile && !collapsed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 999,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
        trigger={!isMobile ? undefined : null}
        style={{
          overflow: "hidden !important",
          height: "100vh",
          position: isMobile ? "fixed" : "relative",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : "auto",
          boxShadow:
            isMobile && !collapsed ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
          transform:
            isMobile && collapsed ? "translateX(-100%)" : "translateX(0)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            padding: collapsed && !isMobile ? "16px 8px" : "16px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
            minHeight: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {collapsed ? "CPM" : "ConstructPM"}
          </Title>
        </div>
        <div
          style={{
            height: "calc(100vh - 64px)",
            overflow: "hidden !important",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[getActiveMenuKey()]}
            items={filteredMenuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              // label: item.label,
              label: collapsed ? null : item.label,
              title: collapsed ? item.label : "",
              onClick: () => {
                navigate(item.path);
                if (isMobile) {
                  setCollapsed(true);
                }
              },
            }))}
            style={{
              border: "none",
              height: "100%",
              overflow: "hidden !important",
              backgroundColor: "transparent",
            }}
          />
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: isMobile ? "0 16px" : "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            position: "fixed", // FIXED header
            top: 0,
            left: isMobile ? 0 : collapsed ? 80 : 240, // account for sidebar width
            right: 0,
            zIndex: 999,
            height: 64, // keep a consistent height
            width: `calc(100% - ${isMobile ? 0 : collapsed ? 80 : 240}px)`, // avoid overlap
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isMobile && (
              <Button
                type="text"
                icon={<ProjectOutlined rotate={270} />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "16px", marginRight: "8px" }}
                aria-label="Toggle Menu"
              />
            )}
            {!isMobile && (
              <Button
                type="text"
                icon={
                  collapsed ? (
                    <ProjectOutlined rotate={270} />
                  ) : (
                    <ProjectOutlined rotate={90} />
                  )
                }
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "16px", marginRight: "8px" }}
                aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              />
            )}
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: "#262626" }}
            >
              {isMobile ? "ConstructPM" : "Construction Project Management"}
            </Title>
          </div>
          <Space size="middle">
            <Badge count={0}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{
                    backgroundColor: getRoleColor(user.role),
                    color: "#fff",
                  }}
                >
                  {user.name?.charAt(0) ?? "U"}
                </Avatar>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            padding: isMobile ? "8px" : "24px",
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px)",
            marginLeft: 0,
            transition: "all 0.2s ease-in-out",
            marginTop: 64, // offset for fixed header
            overflowY: "auto",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<GanttChart />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="/status-report" element={<ProjectStatusReport />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

// Wrapper component to handle authentication routing
const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <AppContent />;
};

const App: React.FC = () => {
  return (
    <Router>
      <GlobalStateProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/*" element={<AuthenticatedApp />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </GlobalStateProvider>
    </Router>
  );
};

export default App;

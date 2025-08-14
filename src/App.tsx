import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Typography, Badge,InputNumber  } from 'antd';
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
  SettingOutlined
} from '@ant-design/icons';
import ProjectStatusReport from './components/ProjectStatusReport';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Reports from './components/Reports';
import Users from './components/Users';
import GanttChart from './components/GanttChart';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import './styles/App.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

type MenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
};

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    roles: ['admin', 'manager', 'incharge', 'executive']
  },
  {
    key: 'gantt',
    icon: <CalendarOutlined />,
    label: 'Timeline',
    roles: ['admin', 'manager', 'incharge']
  },
  {
    key: 'projects',
    icon: <ProjectOutlined />,
    label: 'Projects',
    roles: ['admin', 'manager', 'incharge']
  },
  {
    key: 'tasks',
    icon: <CheckSquareOutlined />,
    label: 'Tasks',
    roles: ['admin', 'manager', 'incharge', 'executive']
  },
  {
    key: 'reports',
    icon: <FileTextOutlined />,
    label: 'Reports',
    roles: ['admin', 'manager', 'incharge']
  },
  {
    key: 'users',
    icon: <TeamOutlined />,
    label: 'Users',
    roles: ['admin', 'manager']
  },
  {
    key: 'status-report',
    icon: <FileTextOutlined />,
    label: 'Status Report',
    roles: ['admin', 'manager', 'incharge']
  }
];

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Listen for data changes to ensure immediate UI updates
  useEffect(() => {
    const handleDataUpdate = () => {
      // Force re-render on data updates
      setActiveMenu(prev => prev);
    };

    window.addEventListener('localStorageChange', handleDataUpdate);
    return () => window.removeEventListener('localStorageChange', handleDataUpdate);
  }, []);

  if (!user) {
    return <Login />;
  }

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout
    }
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'gantt':
        return <GanttChart />;
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users />;
      case 'status-report':
        return <ProjectStatusReport />;
      default:
        return <Dashboard />;
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: '#f5222d',
      manager: '#1890ff',
      incharge: '#52c41a',
      executive: '#fa8c16'
    };
    return colors[role as keyof typeof colors] || '#666';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999
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
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        trigger={!isMobile ? undefined : null}
        style={{
          overflow: 'hidden',
          height: '100vh',
          position: isMobile ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : 'auto',
          boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        <div style={{
          padding: collapsed ? '16px 8px' : '16px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'CPM' : 'ConstructPM'}
          </Title>
        </div>
        <div style={{
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 64px)'
        }}>
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            items={filteredMenuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => setActiveMenu(item.key)
            }))}
            style={{
              border: 'none',
              flex: 1,
              overflow: 'hidden',
              maxHeight: '100%',
              height: '100%'
            }}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{
          padding: isMobile ? '0 16px' : '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          position: 'relative',
          zIndex: 999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <Button
                type="text"
                icon={<ProjectOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', marginRight: '8px' }}
                aria-label="Toggle Menu"
              />
            )}
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: '#262626' }}
            >
              {isMobile ? 'ConstructPM' : 'Construction Project Management'}
            </Title>
          </div>
          <Space size="middle">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  style={{ 
                    backgroundColor: getRoleColor(user.role),
                    color: '#fff'
                  }}
                >
                  {user.name?.charAt(0) ?? 'U'}
                </Avatar>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          padding: isMobile ? '16px' : '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          marginLeft: 0,
          transition: 'all 0.2s ease-in-out'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <GlobalStateProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </GlobalStateProvider>
  );
};

export default App;

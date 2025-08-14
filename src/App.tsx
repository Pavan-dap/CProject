import React, { useState, useEffect } from 'react';
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
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        width={240}
      >
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'CPM' : 'ConstructPM'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          items={filteredMenuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => setActiveMenu(item.key)
          }))}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Title level={3} style={{ margin: 0, color: '#262626' }}>
            Construction Project Management
          </Title>
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
          padding: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
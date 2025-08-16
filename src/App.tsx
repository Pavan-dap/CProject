import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Spin } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiDataProvider } from './contexts/ApiDataContext';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Users from './components/Users';
import Reports from './components/Reports';
import GanttChart from './components/GanttChart';
import Login from './components/Login';
import './styles/App.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AppContent: React.FC = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState('dashboard');

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: 'tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
    },
    user?.role === 'admin' && {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Users',
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: 'gantt',
      icon: <BarChartOutlined />,
      label: 'Gantt Chart',
    },
  ].filter(Boolean);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'users':
        return user?.role === 'admin' ? <Users /> : <Navigate to="/dashboard" />;
      case 'reports':
        return <Reports />;
      case 'gantt':
        return <GanttChart />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ApiDataProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          theme="dark"
        >
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            borderBottom: '1px solid #434343' 
          }}>
            <Text style={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: collapsed ? '12px' : '16px'
            }}>
              {collapsed ? 'CPM' : 'Construction PM'}
            </Text>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
          />
        </Sider>
        
        <Layout>
          <Header style={{ 
            background: '#fff', 
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div>
              <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {menuItems.find(item => item?.key === selectedKey)?.label || 'Dashboard'}
              </Text>
            </div>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Button type="text" style={{ height: 'auto', padding: '8px 12px' }}>
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ marginRight: 8 }}
                />
                <span>{user?.first_name} {user?.last_name}</span>
              </Button>
            </Dropdown>
          </Header>
          
          <Content style={{ 
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)'
          }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ApiDataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

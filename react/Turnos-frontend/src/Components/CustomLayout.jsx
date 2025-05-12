import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import FotoPerfin from '../assets/avatar.jpg';
import { useAuthContext } from '../context/AuthContext';
import '../css/Layout.css';

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const { Logout } = useAuthContext();
  const userData = JSON.parse(localStorage.getItem('AppUserData'));
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: 'turnos', icon: <HomeOutlined />, label: 'Turnos', onClick: () => navigate('/private/home') },
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/private/dashboard') },
    { key: 'creditos', icon: <DollarCircleOutlined />, label: 'Créditos', onClick: () => navigate('/private/creditos') },
    { key: 'clientes', icon: <UserOutlined />, label: 'Clientes', onClick: () => navigate('/private/clientes') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="user-info">
          <div className="user-details">
            <h3>Administrador: {userData?.username}</h3>
            <p>Caja: {userData?.caja}</p>
          </div>
          <div className="avatar-container">
            <img src={FotoPerfin} alt="avatar" className="avatar" />
          </div>
          <Button
            icon={<LogoutOutlined />}
            className="logout-button"
            onClick={Logout}
          >
            Salir
          </Button>
        </div>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
          theme="dark"
          width={200}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[window.location.pathname.split('/').pop()]}
            items={menuItems}
            className="sider-menu"
          />
        </Sider>

        <Content style={{ margin: '16px' }}>
          <div className="content-card">
            <Outlet />
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

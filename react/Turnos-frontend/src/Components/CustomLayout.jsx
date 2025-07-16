import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import FotoPerfil from '../assets/GonzalitoFunko.png';
import LogoUrkupina from '../assets/LOGONUEVO.png';
import { useAuthContext } from '../context/AuthContext';
import '../css/Layout.css';

const { Header, Content } = Layout;

const AppLayout = ({ children }) => {
  const { Logout } = useAuthContext();
  const userData = JSON.parse(localStorage.getItem('AppUserData'));
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    { key: 'turnos', icon: <HomeOutlined />, label: 'Turnos', onClick: () => {navigate('/private/home'); setDrawerVisible(false);} },
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => {navigate('/private/dashboard'); setDrawerVisible(false);} },
    { key: 'creditos', icon: <DollarCircleOutlined />, label: 'Créditos', onClick: () => {navigate('/private/creditos'); setDrawerVisible(false);} },
    { key: 'clientes', icon: <UserOutlined />, label: 'Clientes', onClick: () => {navigate('/private/clientes'); setDrawerVisible(false);} },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f6fa' }}>
      {/* Drawer lateral */}
      <Drawer
        placement="right"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={230}
        bodyStyle={{ padding: 0, background: "#fff" }}
      >
        <div className="sider-user">
          <img src={FotoPerfil} alt="Avatar" className="avatar" />
          <div className="sider-user-details">
            <span className="sider-user-name">{userData?.username || 'Usuario'}</span>
            <span className="sider-user-role">Admin</span>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[window.location.pathname.split('/').pop()]}
          items={menuItems}
          className="sider-menu"
        />
        <Button
          icon={<LogoutOutlined />}
          className="logout-button"
          onClick={Logout}
          block
        >
          Salir
        </Button>
      </Drawer>

      <Layout>
        <Header className="main-header">
          <span className="header-title">
            <img src={LogoUrkupina} alt="Urkupiña" style={{ height: 68, verticalAlign: 'middle', width:130,marginLeft:25 }} />
          </span>
          <div style={{ flex: 1 }} />
          <Button
            icon={<MenuOutlined />}
            className="drawer-menu-btn"
            onClick={() => setDrawerVisible(true)}
            style={{ marginLeft: 12, fontSize: 24, background: "none", border: "none", color: "#fff" }}
            type="text"
          />
        </Header>
        <Content className="main-content">
          {/* 
            Ahora el contenido ocupa TODO el espacio.
            Si querés "cards", hacelo en cada página particular.
          */}
          <Outlet />
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';
import FotoPerfin from '../assets/avatar.jpg';
import { useAuthContext } from '../context/AuthContext'; // Importa el contexto
import '../css/Layout.css';

const { Sider, Content, Header } = Layout;

const AppLayout = ({ children }) => {
  const { Logout } = useAuthContext(); // Obtén la función Logout del contexto
  const userData = JSON.parse(localStorage.getItem('AppUserData'));
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 0,
      icon: <HomeOutlined />,
      label: 'Turnos',
      onClick: () => navigate('/private/home'),
    },
    {
      key: '1',
      icon: <DashboardOutlined style={{ size: '60px' }} />,
      label: 'Dashboard',
      onClick: () => navigate('/private/dashboard'),
    },
    {
      key: '2',
      icon: <DollarCircleOutlined />,
      label: 'Créditos',
      onClick: () => navigate('/private/creditos'),
    },
    {
      key: '3',
      icon: <UserOutlined />,
      label: 'Clientes',
      onClick: () => navigate('/private/clientes'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }} className='home'>
      <Header className="header">
        <div className="user-info">
          <div className="avatar-container">
            <img src={FotoPerfin} alt="User Avatar" className="avatar" />
          </div>
          <div className="user-details">
            <h3>Administrador: {userData.username}</h3>
            <p>Caja: {userData.caja}</p>
          </div>
          <Button type="primary" onClick={Logout} style={{ marginLeft: 'auto' }}>
            Logout
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            className='sider-menu'
          />
        </Sider>
        <Layout>
          <Content style={{ margin: '16px' }}>
            <div style={{ padding: 24, minHeight: '100%' }}>
              <Outlet />
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

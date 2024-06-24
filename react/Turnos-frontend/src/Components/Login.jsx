import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Form, Input, Button, Select, Row, Col } from 'antd';


import '../css/Login.css'; // Asegúrate de crear y usar este archivo CSS para los estilos personalizados

import UrkupinaLogo from '../assets/logo_64.png'
const { Option } = Select;

const Login = () => {
  const [form] = Form.useForm();
  const { Login } = useAuthContext();

  const handleSubmit = (values) => {
    Login(values);
  };

  return (
    <div className="login-container">

      <h1 className='Titulo'>Sistema de Gestion de Turnos</h1>
      <div className="login-form-container">
        <img src= {UrkupinaLogo} alt="Logo" className="login-logo" /> {/* Reemplaza con la ruta de tu logo */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Por favor, ingrese su usuario' }]}
          >
            <Input placeholder="Usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, ingrese su contraseña' }]}
          >
            <Input.Password placeholder="Contraseña" />
          </Form.Item>
          <Form.Item
            name="caja"
            rules={[{ required: true, message: 'Por favor, seleccione su caja' }]}
          >
            <Select placeholder="Número de caja">
              {Array.from({ length: 12 }, (_, i) => (
                <Option key={i + 1} value={i + 1}>{i + 1}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;

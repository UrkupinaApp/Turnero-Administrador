import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Form, Input, Button, Select } from 'antd';

import '../css/Login.css';

import UrkupinaLogo from '../assets/logo_64.png';
const { Option } = Select;

const Login = () => {
  const [form] = Form.useForm();
  const { Login } = useAuthContext();

  const handleSubmit = (values) => {
    Login(values);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <img src={UrkupinaLogo} alt="Logo" className="login-logo" />
        <h2 className="login-title">Bienvenido a Urkupiña</h2>
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
            <Input prefix={<i className="fa fa-user" />} placeholder="Usuario" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, ingrese su contraseña' }]}
          >
            <Input.Password prefix={<i className="fa fa-lock" />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Form.Item
            name="caja"
            rules={[{ required: true, message: 'Por favor, seleccione su caja' }]}
          >
            <Select
              placeholder="Tipo de Caja"
              size="large"
              suffixIcon={<i className="fa fa-cash-register" />}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <Option key={i + 1} value={i + 1}>Caja {i + 1}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" className="login-btn">
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
        <div className="login-register">
          ¿No tienes una cuenta? <span className="login-register-bold">Regístrate</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

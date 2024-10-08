import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, message } from 'antd';
import axios from 'axios';

const RegisterUserForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Añadimos el valor de créditos manualmente
      const data = { ...values, creditos: 20 };

      const response = await axios.post('https://xn--urkupia-9za.online/api/users/register', data);
      message.success(response.data.message);
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="register_user"
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ remember: true }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'Por favor ingrese su nombre' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
          >
            <Input.Password />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Celular"
            name="celular"
            rules={[{ required: true, message: 'Por favor ingrese su celular' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="DNI"
            name="dni"
            rules={[{ required: true, message: 'Por favor ingrese su DNI' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Fila"
            name="fila"
            rules={[{ required: true, message: 'Por favor ingrese la fila' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Pasillo"
            name="pasillo"
            rules={[{ required: true, message: 'Por favor ingrese el pasillo' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Puesto"
            name="puesto"
            rules={[{ required: true, message: 'Por favor ingrese el puesto' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Redes Sociales"
        name="redes_sociales"
        rules={[{ required: true, message: 'Por favor ingrese las redes sociales' }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Registrar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterUserForm;

import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Select, message, Card } from 'antd';
import axios from 'axios';

const { Option } = Select;

const RegisterUserForm = () => {
  const [loading, setLoading] = useState(false);
  const [uso, setUso] = useState("USO PROPIO");
  const [inquilinos, setInquilinos] = useState([]);

  const handleAddInquilino = () => {
    if (inquilinos.length < 2) setInquilinos([...inquilinos, {}]);
  };

  const handleRemoveInquilino = (idx) => {
    setInquilinos(inquilinos.filter((_, i) => i !== idx));
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        uso,
        tamano_puesto: Number(values.tamano_puesto), // aseguramos número
        inquilinos: uso === 'ALQUILA' ? values.inquilinos || [] : [],
        creditos: 20
      };

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
      initialValues={{ uso: "USO PROPIO", tipo_propietario: "PROPIETARIO" }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Ingrese nombre' }]}><Input /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Ingrese apellido' }]}><Input /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Contraseña" name="password" rules={[{ required: true, message: 'Ingrese contraseña' }]}><Input.Password /></Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Celular" name="celular" rules={[{ required: true, message: 'Ingrese celular' }]}><Input /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="DNI" name="dni" rules={[{ required: true, message: 'Ingrese DNI' }]}><Input /></Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Ingrese un email válido' }]}
          ><Input /></Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Tipo"
            name="tipo_propietario"
            rules={[{ required: true, message: 'Seleccione tipo' }]}
          >
            <Select>
              <Option value="PROPIETARIO">PROPIETARIO</Option>
              <Option value="SOCIO">SOCIO</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Uso"
            name="uso"
            rules={[{ required: true, message: 'Seleccione uso' }]}
          >
            <Select onChange={v => setUso(v)}>
              <Option value="USO PROPIO">USO PROPIO</Option>
              <Option value="ALQUILA">ALQUILA</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Fila" name="fila" rules={[{ required: true, message: 'Ingrese la fila' }]}><Input /></Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Pasillo" name="pasillo" rules={[{ required: true, message: 'Ingrese pasillo' }]}><Input /></Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Puesto" name="puesto" rules={[{ required: true, message: 'Ingrese puesto' }]}><Input /></Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Tamaño del Puesto (mts)"
            name="tamano_puesto"
            rules={[{ required: true, message: 'Seleccione el tamaño del puesto' }]}
          >
            <Select placeholder="Seleccione tamaño">
              <Option value={2}>2 metros</Option>
              <Option value={4}>4 metros</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* INQUILINOS */}
      {uso === "ALQUILA" && (
        <Card title="Inquilinos (hasta 2)">
          {inquilinos.map((_, idx) => (
            <Row gutter={8} key={idx} style={{ marginBottom: 8 }}>
              <Col span={4}>
                <Form.Item name={["inquilinos", idx, "name"]} rules={[{ required: true, message: 'Nombre' }]}><Input placeholder="Nombre" /></Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={["inquilinos", idx, "apellido"]} rules={[{ required: true, message: 'Apellido' }]}><Input placeholder="Apellido" /></Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={["inquilinos", idx, "dni"]} rules={[{ required: true, message: 'DNI' }]}><Input placeholder="DNI" /></Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={["inquilinos", idx, "celular"]} rules={[{ required: true, message: 'Celular' }]}><Input placeholder="Celular" /></Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={["inquilinos", idx, "email"]} rules={[{ type: 'email', message: 'Email inválido' }]}><Input placeholder="Email (opcional)" /></Form.Item>
              </Col>
              <Col span={2}>
                <Button onClick={() => handleRemoveInquilino(idx)}>-</Button>
              </Col>
            </Row>
          ))}
          <Button type="dashed" onClick={handleAddInquilino} disabled={inquilinos.length >= 2}>+ Agregar inquilino</Button>
        </Card>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>Registrar</Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterUserForm;

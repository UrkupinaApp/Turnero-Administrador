import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Row, Col, message } from 'antd';
import axios from 'axios';

const UsersTableEdit = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Obtener la lista de usuarios desde la API
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://xn--urkupia-9za.online/api/users');
        setUsers(response.data);
      } catch (error) {
        message.error('Error al obtener los usuarios');
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleSave = async (values) => {
    try {
      const response = await axios.put(`https://xn--urkupia-9za.online/api/users/update/${editingUser.id}`, values);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === editingUser.id ? { ...user, ...values } : user))
      );
      message.success('Usuario actualizado correctamente');
      setIsModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      message.error('Error al actualizar el usuario');
    }
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Celular', dataIndex: 'celular', key: 'celular' },
    { title: 'DNI', dataIndex: 'dni', key: 'dni' },
    { title: 'Fila', dataIndex: 'fila', key: 'fila' },
    { title: 'Pasillo', dataIndex: 'pasillo', key: 'pasillo' },
    { title: 'Puesto', dataIndex: 'puesto', key: 'puesto' },
    { title: 'Créditos', dataIndex: 'creditos', key: 'creditos' },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={() => handleEdit(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table dataSource={users} columns={columns} rowKey="id" />

      <Modal
        title="Editar Usuario"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="name"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Celular"
                name="celular"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="DNI"
                name="dni"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fila"
                name="fila"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Pasillo"
                name="pasillo"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Puesto"
                name="puesto"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Redes Sociales"
            name="redes_sociales"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={false}>
              Guardar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UsersTableEdit;

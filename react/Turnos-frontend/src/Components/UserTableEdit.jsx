import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Row, Col, message, Tag } from 'antd';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchOutlined } from '@ant-design/icons';

const getRolTag = tipo =>
  tipo === 'PROPIETARIO' ? <Tag color="green">Propietario</Tag>
  : tipo === 'INQUILINO' ? <Tag color="blue">Inquilino</Tag>
  : <Tag color="default">{tipo}</Tag>;

const UsersTableEdit = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [propietariosMap, setPropietariosMap] = useState({}); // Para asociar propietario por id

  // --- Fetch usuarios y build mapa propietarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('https://xn--urkupia-9za.online/api/users');
        setUsers(data);

        // Para buscar rápidamente propietarios por id
        const pMap = {};
        data.forEach(u => { if (u.tipo_propietario === 'PROPIETARIO') pMap[u.id] = u; });
        setPropietariosMap(pMap);
        setFiltered(data);
      } catch {
        message.error('Error al obtener los usuarios');
      }
    };
    fetchUsers();
  }, []);

  // --- Buscador dinámico
  useEffect(() => {
    if (!search) setFiltered(users);
    else setFiltered(
      users.filter(u =>
        [u.name, u.apellido, u.dni, u.puesto, u.celular].some(field =>
          String(field || '').toLowerCase().includes(search.toLowerCase())
        ) ||
        (u.tipo_propietario === 'INQUILINO' && propietariosMap[u.user_id_propietario] && (
          [propietariosMap[u.user_id_propietario].name, propietariosMap[u.user_id_propietario].apellido].some(f =>
            String(f || '').toLowerCase().includes(search.toLowerCase())
          )
        ))
      )
    );
  }, [search, users, propietariosMap]);

  // --- Editar
  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      await axios.put(`https://xn--urkupia-9za.online/api/users/update/${editingUser.id}`, values);
      message.success('Usuario actualizado correctamente');
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      // Refetch
      const { data } = await axios.get('https://xn--urkupia-9za.online/api/users');
      setUsers(data);
      setFiltered(data);
      // rebuild propietarios map
      const pMap = {};
      data.forEach(u => { if (u.tipo_propietario === 'PROPIETARIO') pMap[u.id] = u; });
      setPropietariosMap(pMap);
    } catch {
      message.error('Error al actualizar el usuario');
    }
  };

  // --- Columns: propietario muestra a sus inquilinos (DNI), inquilino muestra dueño
  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
    { title: 'Apellido', dataIndex: 'apellido', key: 'apellido' },
    { title: 'Tipo', dataIndex: 'tipo_propietario', key: 'tipo', render: getRolTag },
    { title: 'DNI', dataIndex: 'dni', key: 'dni' },
    { title: 'Celular', dataIndex: 'celular', key: 'celular' },
    { title: 'Fila', dataIndex: 'fila', key: 'fila' },
    { title: 'Pasillo', dataIndex: 'pasillo', key: 'pasillo' },
    { title: 'Puesto', dataIndex: 'puesto', key: 'puesto' },
    { title: 'Tamaño', dataIndex: 'tamano_puesto', key: 'tamano_puesto' },
    {
      title: 'Propietario / Inquilinos',
      key: 'propietario_inquilinos',
      render: (user) =>
        user.tipo_propietario === 'INQUILINO'
          ? propietariosMap[user.user_id_propietario]
            ? <>
                <Tag color="green">Dueño</Tag>
                {propietariosMap[user.user_id_propietario].name} {propietariosMap[user.user_id_propietario].apellido} (DNI: {propietariosMap[user.user_id_propietario].dni})
              </>
            : <span style={{ color: '#aaa' }}>Sin propietario</span>
          : (
              users
                .filter(inq => inq.tipo_propietario === 'INQUILINO' && inq.user_id_propietario === user.id)
                .map((inq, i) => (
                  <div key={inq.id} style={{ marginBottom: 2 }}>
                    <Tag color="blue">Inq.</Tag>
                    {inq.name} {inq.apellido} (DNI: {inq.dni})
                  </div>
                ))
            ),
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleEdit(record)}
        >
          Editar
        </Button>
      ),
    },
  ];

  // --- Animación Modal con Framer Motion
  const modalMotion = {
    initial: { opacity: 0, y: -60 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 60 },
    transition: { duration: 0.25 }
  };

  return (
    <>
      <Input
        placeholder="Buscar usuario, puesto, DNI..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        prefix={<SearchOutlined />}
        style={{ width: 300, marginBottom: 16 }}
      />

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal animado */}
      <AnimatePresence>
        {isModalVisible && (
          <Modal
            open={isModalVisible}
            footer={null}
            onCancel={handleCancel}
            destroyOnClose
            centered
            width={500}
            style={{ top: 40 }}
            closeIcon={null}
            modalRender={modal => (
              <motion.div {...modalMotion}>{modal}</motion.div>
            )}
          >
            <div style={{ marginBottom: 16 }}>
              <Tag color={editingUser?.tipo_propietario === 'INQUILINO' ? "blue" : "green"}>
                {editingUser?.tipo_propietario === 'INQUILINO' ? "Editando Inquilino" : "Editando Propietario"}
              </Tag>
            </div>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Ingrese nombre' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Ingrese apellido' }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="DNI" name="dni" rules={[{ required: true, message: 'Ingrese DNI' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Celular" name="celular">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Fila" name="fila">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Pasillo" name="pasillo">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Puesto" name="puesto">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Guardar
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default UsersTableEdit;

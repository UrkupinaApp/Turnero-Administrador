import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Input, Form, Button, Space, message } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

const EditableContext = React.createContext(null);

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) inputRef.current.focus();
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} es requerido.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const UserTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [form] = Form.useForm();

  // --- Cargar datos del backend ---
  const fetchData = async () => {
    try {
      const res = await fetch('https://xn--urkupia-9za.online/api/users/');
      let data = await res.json();
      setDataSource(data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      message.error('No se pudieron cargar los usuarios');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Buscador de columnas ---
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Buscar ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reiniciar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false,
    onFilterDropdownVisibleChange: visible => {
      if (visible) setTimeout(() => searchInput.current.select(), 100);
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // --- Cargar créditos ---
  const handleSave = async row => {
    try {
      const res = await fetch(
        `https://xn--urkupia-9za.online/api/creditos/carga/${row.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creditos: row.creditosACargar }),
        }
      );
      if (!res.ok) throw new Error('Error en la petición');
      await res.json();
      message.success('Créditos actualizados');
      fetchData();
    } catch (err) {
      console.error('Error al actualizar créditos:', err);
      message.error('No se pudieron actualizar los créditos');
    }
  };

  // --- Cambiar estado (suspender/habilitar) ---
  const updateUserStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No se encontró token');

      const res = await fetch(
        `https://xn--urkupia-9za.online/api/users/suspender/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cambiar estado');
      message.success(
        newStatus === 'activo'
          ? 'Usuario habilitado'
          : 'Usuario suspendido'
      );
      fetchData();
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      message.error('No se pudo cambiar el estado del usuario');
    }
  };

  // --- Eliminar usuario ---
  const deleteUser = async id => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No se encontró token');

      const res = await fetch(
        `https://xn--urkupia-9za.online/api/users/delete/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        message.error(data.message || 'Error al eliminar usuario');
        return;
      }
      message.success('Usuario eliminado con éxito');
      fetchData();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      message.error('No se pudo eliminar el usuario');
    }
  };

  // --- Columnas ---
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text, record) => (
        <span>
          {text}
          {record.tipo_propietario === 'INQUILINO' && record.propietario_name
            ? <span style={{ color: '#888', fontSize: '0.95em' }}> (Inq. de {record.propietario_name})</span>
            : null}
        </span>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_propietario',
      key: 'tipo_propietario',
      render: tipo =>
        tipo === 'INQUILINO'
          ? 'Sub Inquilino'
          : tipo === 'PROPIETARIO'
            ? 'Propietario'
            : tipo,
      filters: [
        { text: 'Propietario', value: 'PROPIETARIO' },
        { text: 'Socio', value: 'SOCIO' },
        { text: 'Sub Inquilino', value: 'INQUILINO' }
      ],
      onFilter: (value, record) => record.tipo_propietario === value,
    },
    {
      title: 'Puesto',
      dataIndex: 'puesto',
      key: 'puesto',
      ...getColumnSearchProps('puesto'),
    },
    {
      title: 'Fila',
      dataIndex: 'fila',
      key: 'fila',
      ...getColumnSearchProps('fila'),
    },
    {
      title: 'Pasillo',
      dataIndex: 'pasillo',
      key: 'pasillo',
      ...getColumnSearchProps('pasillo'),
    },
    {
      title: 'Créditos',
      dataIndex: 'creditos',
      key: 'creditos',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <span style={{ fontSize: '1.1em' }}>
          {status === 'activo' ? '✅ Activo' : '❌ Inactivo'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Input
            value={record.creditosACargar}
            onChange={e => {
              const newData = [...dataSource];
              const idx = newData.findIndex(item => item.id === record.id);
              newData[idx].creditosACargar = e.target.value;
              setDataSource(newData);
            }}
            placeholder="Cargar créditos"
            style={{ width: 120 }}
          />
          <Button type="primary" onClick={() => handleSave(record)}>
            Cargar
          </Button>
          {record.status === 'activo' ? (
            <Button
              type="dashed"
              onClick={() => updateUserStatus(record.id, 'inactivo')}
              style={{ borderColor: 'orange', color: 'white', background: "orange" }}
            >
              Suspender
            </Button>
          ) : (
            <Button onClick={() => updateUserStatus(record.id, 'activo')}>
              Habilitar
            </Button>
          )}
          <Button danger onClick={() => deleteUser(record.id)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100%",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb"
      }}
    >
      <div style={{
        width: "100%",
        height: "80vh",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <EditableContext.Provider value={form}>
          <Form form={form} component={false}>
            <Table
              components={{ body: { cell: EditableCell } }}
              bordered
              dataSource={dataSource}
              columns={columns}
              rowKey={record => `${record.id}-${record.puesto}-${record.tipo_propietario}`}
              pagination={{ pageSize: 10 }}
              style={{
                height: "100%",
                width: "100%",
              }}
              scroll={{ y: "55vh" }}
            />
          </Form>
        </EditableContext.Provider>
      </div>
    </div>
  );
};

export default UserTable;

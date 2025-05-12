import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Input, Form, Button, Space } from 'antd';
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
        rules={[{ required: true, message: `${title} is required.` }]}
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

  // Función para obtener usuarios
  const fetchData = async () => {
    try {
      const response = await fetch('https://xn--urkupia-9za.online/api/users/');
      const data = await response.json();
      setDataSource(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Actualiza créditos
  const handleSave = async row => {
    try {
      const response = await fetch(
        `https://xn--urkupia-9za.online/api/creditos/carga/${row.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creditos: row.creditosACargar }),
        }
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      fetchData();
    } catch (error) {
      console.error('Error al actualizar créditos:', error);
    }
  };

  // Cambia estado de usuario y recarga
  const updateUserStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No se encontró token');

      const response = await fetch(
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Error ${response.status}`);

      // Recarga la tabla después de cambiar estado
      fetchData();
    } catch (err) {
      console.error(`Error al ${newStatus === 'activo' ? 'habilitar' : 'suspender'} usuario:`, err.message);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Puesto',
      dataIndex: 'puesto',
      key: 'puesto',
      ...getColumnSearchProps('puesto'),
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
              const index = newData.findIndex(item => record.id === item.id);
              newData[index].creditosACargar = e.target.value;
              setDataSource(newData);
            }}
            placeholder="Cargar créditos"
            style={{ width: 120 }}
          />
          <Button type="primary" onClick={() => handleSave(record)}>
            Cargar
          </Button>
          {record.status === 'activo' ? (
            <Button danger onClick={() => updateUserStatus(record.id, 'inactivo')}>
              Suspender
            </Button>
          ) : (
            <Button type="default" onClick={() => updateUserStatus(record.id, 'activo')}>
              Habilitar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <EditableContext.Provider value={form}>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          dataSource={dataSource}
          columns={columns}
          rowClassName="editable-row"
          pagination={{ pageSize: 10 }}
        />
      </Form>
    </EditableContext.Provider>
  );
};

export default UserTable;

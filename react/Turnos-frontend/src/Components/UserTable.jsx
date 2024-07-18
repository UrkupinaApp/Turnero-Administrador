import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Input, Form, Button } from 'antd';

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
    if (editing) {
      inputRef.current.focus();
    }
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
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3005/api/users/')
      .then(response => response.json())
      .then(data => {
        setDataSource(data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  const handleSave = async (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);

    try {
      const response = await fetch(`http://localhost:3005/api/creditos/carga/${row.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditos: row.creditos }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Updated successfully', data);

      // Update the local state with the new credits
      newData[index].creditos = data.creditos;
      setDataSource([...newData]);
    } catch (error) {
      console.error('There was an error updating the data!', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Creditos',
      dataIndex: 'creditos',
      key: 'creditos',
      editable: true,
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      render: (_, record) => (
        <span>
          <Button
            onClick={() => handleSave(record)}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Cargar
          </Button>
        </span>
      ),
    },
    {
      title: 'Cantidad a Cargar',
      dataIndex: 'creditosACargar',
      key: 'creditosACargar',
      render: (_, record) => (
        <Input
          value={record.creditosACargar}
          onChange={(e) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => record.id === item.id);
            newData[index].creditosACargar = e.target.value;
            setDataSource(newData);
          }}
        />
      ),
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  return (
    <EditableContext.Provider value={form}>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={dataSource}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
    </EditableContext.Provider>
  );
};

export default UserTable;

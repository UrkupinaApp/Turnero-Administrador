import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Select, Switch, message, Card, InputNumber } from 'antd';
import axios from 'axios';
import '../css/RegisterUserForm.css';

const { Option } = Select;

const RegisterUserForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tipoPropietario, setTipoPropietario] = useState("PROPIETARIO");
  const [uso, setUso] = useState("USO PROPIO");
  const [multiplePuestos, setMultiplePuestos] = useState(false);
  const [cantidadPuestos, setCantidadPuestos] = useState(1);

  // Para buscar propietarios en caso de inquilino
  const [propietarios, setPropietarios] = useState([]);
  const [searchPropietario, setSearchPropietario] = useState('');
  const [selectedPropietario, setSelectedPropietario] = useState(null);

  // Datos del puesto para SOCIO
  const [socioPuesto, setSocioPuesto] = useState({
    fila: '',
    pasillo: '',
    puesto: '',
    tamano_puesto: 2,
  });

  // Para inquilinos por puesto (para propietarios)
  const [puestos, setPuestos] = useState([
    {
      fila: '',
      pasillo: '',
      puesto: '',
      tamano_puesto: 2,
      inquilinos: []
    }
  ]);

  // Buscar propietarios
  const handleSearchPropietario = async (v) => {
    setSearchPropietario(v);
    if (v.length > 2) {
      try {
        const res = await axios.get('https://xn--urkupia-9za.online/api/users/propietarios', {
          params: { search: v }
        });
        setPropietarios(res.data); // [{id, name, apellido, dni, fila, pasillo, puesto, tamano_puesto}]
      } catch (err) {
        setPropietarios([]);
      }
    } else {
      setPropietarios([]);
    }
  };

  // Cuando se selecciona propietario, rellenar los campos del puesto
  const handleSelectPropietario = (value) => {
    const propietario = propietarios.find(p => p.id === value);
    setSelectedPropietario(value);
    if (propietario) {
      setSocioPuesto({
        fila: propietario.fila || '',
        pasillo: propietario.pasillo || '',
        puesto: propietario.puesto || '',
        tamano_puesto: propietario.tamano_puesto || 2,
      });
      // También rellenar los valores en el form visual
      form.setFieldsValue({
        fila: propietario.fila || '',
        pasillo: propietario.pasillo || '',
        puesto: propietario.puesto || '',
        tamano_puesto: propietario.tamano_puesto || 2,
      });
    }
  };

  // Cambiar cantidad de puestos
  const handleCantidadPuestosChange = (val) => {
    setCantidadPuestos(val);
    let nuevos = [];
    for (let i = 0; i < val; i++) {
      nuevos.push({
        fila: '',
        pasillo: '',
        puesto: '',
        tamano_puesto: 2,
        inquilinos: []
      });
    }
    setPuestos(nuevos);
  };

  // Actualiza datos de cada puesto
  const handlePuestoChange = (idx, field, value) => {
    const newPuestos = [...puestos];
    newPuestos[idx][field] = value;

    // Limita cantidad de inquilinos según tamaño
    if (field === 'tamano_puesto') {
      if (value === 2) newPuestos[idx].inquilinos = newPuestos[idx].inquilinos.slice(0, 1);
      else if (value === 4) newPuestos[idx].inquilinos = newPuestos[idx].inquilinos.slice(0, 2);
    }
    setPuestos(newPuestos);
  };

  // Maneja inputs de inquilinos
  const handleInquilinoChange = (pIdx, iIdx, field, value) => {
    const newPuestos = [...puestos];
    if (!newPuestos[pIdx].inquilinos) newPuestos[pIdx].inquilinos = [];
    newPuestos[pIdx].inquilinos[iIdx] = { ...newPuestos[pIdx].inquilinos[iIdx], [field]: value };
    setPuestos(newPuestos);
  };

  // Agregar inquilino por puesto según regla
  const addInquilino = (pIdx) => {
    const max = puestos[pIdx].tamano_puesto === 4 ? 2 : 1;
    if (puestos[pIdx].inquilinos.length < max) {
      const newPuestos = [...puestos];
      newPuestos[pIdx].inquilinos = [...newPuestos[pIdx].inquilinos, {}];
      setPuestos(newPuestos);
    }
  };

  // Eliminar inquilino
  const removeInquilino = (pIdx, iIdx) => {
    const newPuestos = [...puestos];
    newPuestos[pIdx].inquilinos = newPuestos[pIdx].inquilinos.filter((_, i) => i !== iIdx);
    setPuestos(newPuestos);
  };

  // Enviar formulario
  const onFinish = async (values) => {
    setLoading(true);
    try {
      let data;
      if (tipoPropietario === 'PROPIETARIO') {
        data = {
          ...values,
          tipo_propietario: tipoPropietario,
          uso,
          puestos: puestos.map((p, idx) => ({
            ...p,
            inquilinos: p.inquilinos.map((i, ii) => ({
              ...i,
              subletra: p.tamano_puesto === 4 && p.inquilinos.length === 2 ? (ii === 0 ? 'A' : 'B') : undefined
            }))
          })),
          creditos: 20
        };
      } else {
        data = {
          ...values,
          tipo_propietario: tipoPropietario,
          uso,
          propietario_asignado: selectedPropietario,
          fila: socioPuesto.fila,
          pasillo: socioPuesto.pasillo,
          puesto: socioPuesto.puesto,
          tamano_puesto: socioPuesto.tamano_puesto,
          creditos: 20
        };
      }

      const response = await axios.post('https://xn--urkupia-9za.online/api/users/register', data);
      message.success(response.data.message);
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-bg">
      <div className="registro-card">
        <div className="registro-title">Registro de Usuarios</div>
        <Form
          form={form}
          name="register_user"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ uso: "USO PROPIO", tipo_propietario: "PROPIETARIO" }}
          className="registro-form"
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Ingrese nombre' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Ingrese apellido' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Contraseña" name="password" rules={[{ required: true, message: 'Ingrese contraseña' }]}>
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Celular" name="celular" rules={[{ required: true, message: 'Ingrese celular' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="DNI" name="dni" rules={[{ required: true, message: 'Ingrese DNI' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Ingrese un email válido' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Tipo" name="tipo_propietario" rules={[{ required: true, message: 'Seleccione tipo' }]}>
                <Select size="large" onChange={setTipoPropietario}>
                  <Option value="PROPIETARIO">PROPIETARIO</Option>
                  <Option value="SOCIO">SOCIO</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Uso" name="uso" rules={[{ required: true, message: 'Seleccione uso' }]}>
                <Select size="large" onChange={setUso}>
                  <Option value="USO PROPIO">USO PROPIO</Option>
                  <Option value="ALQUILA">ALQUILA</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}></Col>
          </Row>

          {/* Si es propietario, permite indicar si tiene más de un puesto */}
          {tipoPropietario === 'PROPIETARIO' && (
            <Row gutter={16} align="middle">
              <Col xs={24} md={8}>
                <Form.Item label="¿Tiene más de un puesto?">
                  <Switch checked={multiplePuestos} onChange={(checked) => {
                    setMultiplePuestos(checked);
                    handleCantidadPuestosChange(checked ? 2 : 1);
                  }} />
                </Form.Item>
              </Col>
              {multiplePuestos && (
                <Col xs={24} md={8}>
                  <Form.Item label="Cantidad de puestos">
                    <InputNumber
                      min={1}
                      max={10}
                      value={cantidadPuestos}
                      onChange={handleCantidadPuestosChange}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          )}

          {/* Si es SOCIO, selector de propietario y campos de puesto */}
          {tipoPropietario === 'SOCIO' && (
            <>
              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item label="Buscar propietario del puesto" required>
                    <Select
                      showSearch
                      placeholder="Buscar propietario por DNI, nombre, etc."
                      onSearch={handleSearchPropietario}
                      filterOption={false}
                      onChange={handleSelectPropietario}
                    >
                      {propietarios.map(p => (
                        <Option key={p.id} value={p.id}>
                          {p.name} {p.apellido} (DNI: {p.dni})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Card title="Datos del Puesto" style={{ marginBottom: 16 }}>
                <Row gutter={12}>
                  <Col xs={24} md={4}>
                    <Form.Item label="Fila" name="fila" rules={[{ required: true, message: 'Ingrese la fila' }]}>
                      <Input value={socioPuesto.fila} onChange={e => setSocioPuesto({ ...socioPuesto, fila: e.target.value })} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item label="Pasillo" name="pasillo" rules={[{ required: true, message: 'Ingrese el pasillo' }]}>
                      <Input value={socioPuesto.pasillo} onChange={e => setSocioPuesto({ ...socioPuesto, pasillo: e.target.value })} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item label="Puesto" name="puesto" rules={[{ required: true, message: 'Ingrese el puesto' }]}>
                      <Input value={socioPuesto.puesto} onChange={e => setSocioPuesto({ ...socioPuesto, puesto: e.target.value })} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Tamaño" name="tamano_puesto" rules={[{ required: true, message: 'Seleccione tamaño' }]}>
                      <Select
                        value={socioPuesto.tamano_puesto}
                        onChange={v => setSocioPuesto({ ...socioPuesto, tamano_puesto: v })}
                      >
                        <Option value={2}>2 metros</Option>
                        <Option value={4}>4 metros</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </>
          )}

          {/* Si es propietario, formulario de puestos */}
          {tipoPropietario === 'PROPIETARIO' && puestos.map((puesto, idx) => (
            <Card key={idx} title={`Datos Puesto #${idx + 1}`} style={{ marginBottom: 16 }}>
              <Row gutter={12}>
                <Col xs={24} md={4}>
                  <Input
                    placeholder="Fila"
                    value={puesto.fila}
                    onChange={e => handlePuestoChange(idx, 'fila', e.target.value)}
                  />
                </Col>
                <Col xs={24} md={4}>
                  <Input
                    placeholder="Pasillo"
                    value={puesto.pasillo}
                    onChange={e => handlePuestoChange(idx, 'pasillo', e.target.value)}
                  />
                </Col>
                <Col xs={24} md={4}>
                  <Input
                    placeholder="Puesto"
                    value={puesto.puesto}
                    onChange={e => handlePuestoChange(idx, 'puesto', e.target.value)}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Select
                    value={puesto.tamano_puesto}
                    onChange={v => handlePuestoChange(idx, 'tamano_puesto', v)}
                  >
                    <Option value={2}>2 metros</Option>
                    <Option value={4}>4 metros</Option>
                  </Select>
                </Col>
              </Row>

              {/* Inquilinos para el puesto */}
              <Card
                size="small"
                title={`Inquilinos del puesto (máx. ${puesto.tamano_puesto === 4 ? 2 : 1})`}
                style={{ marginTop: 12, background: '#fafafa' }}
              >
                {puesto.inquilinos && puesto.inquilinos.map((inq, iidx) => (
                  <Row gutter={8} key={iidx} style={{ marginBottom: 8 }}>
                    <Col span={4}>
                      <Input
                        placeholder={`Nombre ${puesto.tamano_puesto === 4 ? (iidx === 0 ? 'A' : 'B') : ''}`}
                        value={inq.name || ''}
                        onChange={e => handleInquilinoChange(idx, iidx, 'name', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Input
                        placeholder="Apellido"
                        value={inq.apellido || ''}
                        onChange={e => handleInquilinoChange(idx, iidx, 'apellido', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Input
                        placeholder="DNI"
                        value={inq.dni || ''}
                        onChange={e => handleInquilinoChange(idx, iidx, 'dni', e.target.value)}
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Celular"
                        value={inq.celular || ''}
                        onChange={e => handleInquilinoChange(idx, iidx, 'celular', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Input
                        placeholder="Email (opcional)"
                        value={inq.email || ''}
                        onChange={e => handleInquilinoChange(idx, iidx, 'email', e.target.value)}
                      />
                    </Col>
                    <Col span={6}>
                      <Input.Password
                        placeholder="Contraseña"
                        value={inq.password || ''}
                        onChange={e => handleInquilinoChange(idx, iidx, 'password', e.target.value)}
                      />
                    </Col>
                    <Col span={2}>
                      <Button danger onClick={() => removeInquilino(idx, iidx)}>-</Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  type="dashed"
                  onClick={() => addInquilino(idx)}
                  disabled={puesto.inquilinos.length >= (puesto.tamano_puesto === 4 ? 2 : 1)}
                >
                  + Agregar inquilino
                </Button>
              </Card>
            </Card>
          ))}

          <Form.Item className="registro-submit-btn">
            <Button type="primary" htmlType="submit" loading={loading}>Registrar</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterUserForm;

import React from 'react'
import AppLayout from './CustomLayout';
import RegisterUserForm from './userRegisterForm';
import UsersTableEdit from './UserTableEdit';
import '../css/ClientesPage.css';

const Clientes = () => {
  return (
    <AppLayout>
      <div className="clientes-main">
        <h1 className="clientes-title">Registro de Usuarios</h1>
        <div className="clientes-content-grid">
          <div className="clientes-form-block">
            <RegisterUserForm />
          </div>
          <div className="clientes-table-block">
            <UsersTableEdit />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Clientes;

import React from 'react'
import AppLayout from './CustomLayout';
import RegisterUserForm from './userRegisterForm';
import UsersTableEdit from './UserTableEdit';

const Clientes = () => {
  return (
    <AppLayout>
      <h1>Registro de usuarios </h1>

        <RegisterUserForm/>
        <hr/>
        <br></br>

        <h1>Edicion de datos de usuarios</h1>
        <UsersTableEdit/>
    </AppLayout>
  )
}

export default Clientes;
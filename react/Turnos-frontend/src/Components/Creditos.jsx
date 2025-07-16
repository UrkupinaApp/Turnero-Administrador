import React from 'react'
import AppLayout from './CustomLayout';
import UserTable from './UserTable';
import UsersTableEdit from './UserTableEdit';

const Creditos = () => {
  return (

    <AppLayout>

        <h1 style={{textAlign:"center",fontSize:"40px"}}>Carga de Creditos</h1>
        <UserTable/>

    </AppLayout>
  )
}

export default Creditos;
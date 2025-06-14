import React from 'react';
import UserOrders from './UserOrders';
import AdminOrders from './AdminOrders';

const Orders: React.FC = () => {
  const user = localStorage.getItem('user');
  const role = user ? JSON.parse(user).role : 'user';

  return (
    <div className="orders-page">
      {role === 'admin' ? <AdminOrders /> : <UserOrders />}
    </div>
  );
};

export default Orders;

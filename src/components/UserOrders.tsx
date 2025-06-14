import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/orders.css';

interface Order {
  idOrder: number;
  totalPrice: number;
  orderStatusName: string;
  orderTimestamp: string;
}

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const user = localStorage.getItem('user');
  const email = user ? JSON.parse(user).email : null;

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/${email}`);
        const data = await res.json();
const sortedData = data.sort((a: Order, b: Order) => new Date(b.orderTimestamp).getTime() - new Date(a.orderTimestamp).getTime());
setOrders(sortedData);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchUserOrders();
  }, [email]);

  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'shipped':
      case 'dostavljeno':
        return 'status status-shipped';
      case 'placed':
      case 'na čekanju':
        return 'status status-placed';
      case 'delivered':
        return 'status status-delivered';
      case 'cancelled':
      case 'otkazano':
        return 'status status-cancelled';
      default:
        return 'status';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRowClick = (id: number) => {
    navigate(`/order/${id}`);
  };

  return (
    <div>
      <header>
  <div className="logo">
  <a href="/">
  <img src="/olive3.png" alt="Logo" className="logo-image" />
    </a>
    <a href="/fyp">FOR YOU</a>
    <a href="/">SHOP</a>
    <a href="/orders">MY ORDERS</a>
  </div>
</header>

<div className="top-right">
          <div style={{ display: 'flex', marginTop: '10px'}}>
            <button onClick={() => navigate('/cart')} className="cart-button">CART</button>
            <button onClick={handleLogout} className="logout-button">LOG OUT</button>

          </div>
        
      </div>
    
    <div className="orders-container">
      <h1>My Orders</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Total price</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.idOrder}
              className="clickable-row"
              onClick={() => handleRowClick(order.idOrder)}
            >
              <td>{order.idOrder}</td>
              <td>{order.totalPrice} €</td>
              <td>
                <span className={getStatusClass(order.orderStatusName)}>
                  {order.orderStatusName}
                </span>
              </td>
              <td>{new Date(order.orderTimestamp).toLocaleDateString('hr-HR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default UserOrders;

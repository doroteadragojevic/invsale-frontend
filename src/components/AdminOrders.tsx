import React, { useEffect, useState } from 'react';
import '../styles/orders.css';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminMenu';

interface Order {
  idOrder: number;
  email: string;
  totalPrice: number;
  orderStatusName: string;
  orderTimestamp: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('Svi');
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error while fetching orders:", err);
      }
    };

    fetchAllOrders();
  }, []);

  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'shipped':
      case 'dostavljeno':
        return 'status status-shipped';
      case 'placed':
      case 'na čekanju':
        return 'status status-placed';
      case 'na čekanju':
        return 'status status-delivered';
      case 'cancelled':
      case 'otkazano':
        return 'status status-cancelled';
      default:
        return 'status';
    }
  };

  const handleRowClick = (id: number) => {
    navigate(`/order/${id}`);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const filteredOrders = (selectedStatus === 'Svi'
  ? orders
  : orders.filter(order =>
      order.orderStatusName.toLowerCase() === selectedStatus.toLowerCase()
    )
).sort((a, b) => new Date(b.orderTimestamp).getTime() - new Date(a.orderTimestamp).getTime());

  const uniqueStatuses = Array.from(
    new Set(orders.map(o => o.orderStatusName))
  );

  return (
    <div>
    <AdminHeader />
    <div className="orders-container">
      <h1>ORDER MANAGEMENT</h1>

      <div className="filter-container">
        <label htmlFor="status-filter">Filter by status: </label>
        <select id="status-filter" value={selectedStatus} onChange={handleStatusChange}>
          <option value="Svi">All</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Total price</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.idOrder}
                className="clickable-row"
                onClick={() => handleRowClick(order.idOrder)}>
              <td>{order.idOrder}</td>
              <td>{order.email}</td>
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

export default AdminOrders;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/orders.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminHeader from './AdminMenu';
import { useNavigate } from "react-router-dom";


interface Order {
  idOrder: number;
  email: string;
  totalPrice: number;
  orderStatusName: string;
  orderTimestamp: string;
  shippingAddress: string;
}

interface OrderItem {
  idOrderItem: number;
  productId: number;
  productName: string;
  unitId: number;
  unitName: string;
  quantity: number;
  orderId: number;
}

interface PriceListDTO {
  price: number;
  discount: number | null;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [prices, setPrices] = useState<Map<string, PriceListDTO>>(new Map());
  const [hasReviewed, setHasReviewed] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;
  const isAdmin = parsedUser?.role === 'admin';
  const isRegularUser = parsedUser?.role === 'user';

  const navigate = useNavigate();

   // Provjera je li korisnik već ostavio recenziju za narudžbu
   useEffect(() => {
    const checkReview = async () => {
      try {
        const user = localStorage.getItem('user');
       const email = user ? JSON.parse(user).email : null;
        const res = await fetch(`${apiUrl}/orderreview/${id}/${email}`);
        if (res.ok) {
          const data = await res.json();
          console.log("ATA: " + data);
          setHasReviewed(data); // Pretpostavka da vraća objekt { hasReview: true/false }
        }
      } catch (err) {
        console.error('Error fetching order status:', err);
      }
    };
    checkReview();
  }, [id, apiUrl]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/id/${id}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    };

    const fetchOrderItems = async () => {
      try {
        const res = await fetch(`${apiUrl}/orderItem/order/${id}`);
        const data = await res.json();
        setOrderItems(data);
      } catch (err) {
        console.error('Error fetching order items:', err);
      }
    };

    fetchOrder();
    fetchOrderItems();
  }, [id]);

  useEffect(() => {
    const fetchPrices = async () => {
      const pricePromises = orderItems.map(async (item) => {
        const priceRes = await fetch(
          `${apiUrl}/pricelist/date/${item.productId}/${item.unitId}`,
          {
            method: 'POST',
            body: JSON.stringify(new Date()),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const priceData: PriceListDTO = await priceRes.json();
        return { key: `${item.productId}-${item.unitId}`, priceData };
      });

      const priceData = await Promise.all(pricePromises);
      const priceMap = new Map(priceData.map((p) => [p.key, p.priceData]));
      setPrices(priceMap);
    };

    if (orderItems.length > 0) {
      fetchPrices();
    }
  }, [orderItems]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const generatePDF = () => {
    if (!order) return;
  
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text(`Order Number #${order.idOrder}`, 14, 20);
  
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(order.orderTimestamp).toLocaleDateString('hr-HR')}`, 14, 30);
    doc.text(`Email: ${order.email}`, 14, 37);
    doc.text(`Shipping address: ${order.shippingAddress}`, 14, 44);
    doc.text(`Status: ${order.orderStatusName}`, 14, 51);
    doc.text(`Total: ${order.totalPrice.toFixed(2)} €`, 14, 58);
  
    const rows = orderItems.map((item) => {
      const priceData = prices.get(`${item.productId}-${item.unitId}`);
      const price = priceData ? priceData.price : 0;
      const discount = priceData?.discount ?? null;
      const finalPrice = getPriceWithDiscount(price, discount);
  
      return [
        item.productName,
        item.quantity,
        item.unitName,
        `${finalPrice.toFixed(2)} €`,
        discount ? `${(discount * 100).toFixed(0)} %` : '-',
      ];
    });
  
    autoTable(doc, {
      startY: 70,
      head: [['Product', 'Quantity', 'Packaging', 'Price', 'Discount']],
      body: rows,
    });
  
    doc.save(`Order_${order.idOrder}.pdf`);
  };

  const handleStatusChange = async (newStatus : String) => {
    if (!order) return;
    try {
      const res = await fetch(`${apiUrl}/orders/${order.idOrder}/${newStatus}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const updatedRes = await fetch(`${apiUrl}/orders/id/${id}`);
        const updatedData = await updatedRes.json();
        setOrder(updatedData);
        alert('Order status sucessfuly changed.');
      } else {
        alert('Error happened while status change.');
      }
    } catch (err) {
      console.error('rror happened while status change:', err);
    }
  };

  if (!order) return <div>Učitavanje...</div>;

  const getPriceWithDiscount = (price: number, discount: number | null) => {
    if (discount === null || discount === 0) return price;
    return price * (1 - discount);
  };

  return (
    <div>
      {isAdmin && (<AdminHeader />)}
      {!isAdmin && (
        <>
        <header>
  <div className="logo">
  <a href="/">
  <img src="/olive3.png" alt="Logo" className="logo-image" />
    </a>
    <a href="/fyp">FYP</a>
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
      </>
      )}
    <div className="order-details-container">
      <h2>Order #{order.idOrder}</h2>
      <p><strong>Total:</strong> {order.totalPrice} €</p>
      <p><strong>Status:</strong> {order.orderStatusName}</p>
      <p><strong>Date:</strong> {new Date(order.orderTimestamp).toLocaleDateString('hr-HR')}</p>

      {(isRegularUser && order.orderStatusName !== 'SHIPPED' && order.orderStatusName !== 'IN_PROGRESS' && order.orderStatusName !== 'PLACED' && !hasReviewed) && (
            <div style={{ marginTop: '20px' }}>
              <button
                className="add-review-btn-o"
                onClick={() => window.location.href = `/review?orderId=${order.idOrder}`}
              >
                ADD REVIEW
              </button>
            </div>
          )}

      {isAdmin && (
        <>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Shipping address:</strong> {order.shippingAddress}</p>
          <button onClick={() => handleStatusChange("SHIPPED")} className="change-status-btn">
            Mark as shipped
          </button>
          <button onClick={() => handleStatusChange("CANCELLED")} className="change-status-btn">
            Mark as cancelled
          </button>
          <button onClick={generatePDF} className="download-pdf-btn">
  Download PDF
</button>
        </>
      )}

      <h3>Items</h3>
      {orderItems.length > 0 ? (
        <>
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Packaging</th>
                <th>Price Per Packaging</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => {
                const priceData = prices.get(`${item.productId}-${item.unitId}`);
                const price = priceData ? priceData.price : 0;
                const discount = priceData ? priceData.discount : null;
                const finalPrice = getPriceWithDiscount(price, discount);
                const priceClass = discount ? 'discounted-price' : '';

                return (
                  <tr key={item.idOrderItem}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitName}</td>
                    <td className={priceClass}>
                      {finalPrice.toFixed(2)} €
                      {(discount !== null && discount !== 0) && (
                        <span> ({discount * 100}% discount)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <p>No items.</p>
      )}
    </div>
    </div>
  );
};

export default OrderDetails;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/home.css'
import '../styles/cart.css';

type OrderItemDTO = {
  idOrderItem: number;
  productId: number;
  productName: string;
  unitId: number;
  unitName: string;
  quantity: number;
  orderId: number;
};

type PriceListDTO = {
  idPriceList: number;
  idProduct: number;
  unitId: number;
  price: number;
  discount: number | null;
};

export default function Cart() {
  const [orderItems, setOrderItems] = useState<OrderItemDTO[]>([]);
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [coupon, setCoupon] = useState<string>('');
  const [idOrder, setIdOrder] = useState(0);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const user = localStorage.getItem('user');
  const email = user ? JSON.parse(user).email : null;

  useEffect(() => {
    const loadCartData = async () => {
      try {
        // Dohvati aktivnu narudžbu korisnika
        const activeOrderRes = await fetch(`${apiUrl}/orders/cart/${email}`);
        if (!activeOrderRes.ok) {
          navigate('/');
          return;
        }

        const activeOrder = await activeOrderRes.json();
        const orderId = activeOrder.idOrder;
        setIdOrder(orderId);

        // Dohvati stavke narudžbe
        const itemsRes = await fetch(`${apiUrl}/orderItem/order/${orderId}`);
        const items: OrderItemDTO[] = await itemsRes.json();
        setOrderItems(items);

        // Dohvati cijene za svaku stavku
        const pricePromises = items.map(async item => {
          const res = await fetch(`${apiUrl}/pricelist/${item.productId}/${item.unitId}`);
          if (res.ok) {
            const priceData: PriceListDTO = await res.json();
            const finalPrice = priceData.discount != null
              ? priceData.price * (1 - priceData.discount)
              : priceData.price;
            return { idOrderItem: item.idOrderItem, price: finalPrice };
          } else {
            return { idOrderItem: item.idOrderItem, price: 0 };
          }
        });

        const priceResults = await Promise.all(pricePromises);
        const priceMap: Record<number, number> = {};
        priceResults.forEach(p => {
          priceMap[p.idOrderItem] = p.price;
        });
        setPrices(priceMap);

        // Izračunaj ukupnu cijenu
        const total = items.reduce((acc, item) => {
          const price = priceMap[item.idOrderItem] || 0;
          return acc + item.quantity * price;
        }, 0);
        fetchTotalPrice(orderId);
      } catch (err) {
        console.error("Error fetching cart:", err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, [apiUrl, navigate]);

  const fetchTotalPrice = async (orderId: number) => {
    try {
      const res = await fetch(`${apiUrl}/orders/id/${orderId}`, { method: "GET" });
      if (!res.ok) throw new Error('Error fetching order info.');
      const newOrderInfo = await res.json();
      setTotalPrice(newOrderInfo.totalPrice);
    } catch (err) {
      console.error("Error fetching order info:", err);
    }
  };

  const handleRemoveItem = async (orderItemId: number) => {
    try {
      const res = await fetch(`${apiUrl}/orderItem/${orderItemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error('Error deleting item');

      const removedItem = orderItems.find(i => i.idOrderItem === orderItemId);
      setOrderItems(prev => prev.filter(item => item.idOrderItem !== orderItemId));
      setPrices(prev => {
        const updated = { ...prev };
        delete updated[orderItemId];
        return updated;
      });
      if (removedItem) {
        fetchTotalPrice(idOrder);
        //setTotalPrice(prev => prev - (prices[orderItemId] || 0) * removedItem.quantity);
      }
    } catch (err) {
      console.error("Error deleting item: ", err);
    }
  };

  const handleCouponChange = (value: string) => {
      // Provjera duljine i formata kupona
      if (value.length > 20) {
        alert("Incorrect coupon.");
        return;
      }
    
      if (!/^[a-zA-Z0-9]*$/.test(value)) {
        alert("Incorrect coupon.");
        return;
      }
    
      setCoupon(value);
    
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${idOrder}/apply/${code}`, { method: "PUT" });
  
      if (!res.ok) {
        if (res.status === 400) {
          const errorMessage = await res.text();
          alert(errorMessage || "Coupon already used or is no longer active.");
        } else {
          throw new Error('Error applying coupon.');
        }
        return;
      }
  
      const newOrderInfo = await res.json();
      setTotalPrice(newOrderInfo.totalPrice);
    } catch (err) {
      console.error("Error applying coupon: ", err);
      alert("Error occured during applying coupon.");
    }
  };
  

  const clearCoupon = async (code: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${idOrder}/remove/${code}`, { method: "PUT" });
      if (!res.ok) throw new Error('Error removing coupon.');
      const newOrderInfo = await res.json();
      setTotalPrice(newOrderInfo.totalPrice);
      setCoupon('');
    } catch (err) {
      console.error("Error removing coupon:", err);
    }
  };

  if (loading) return <div className="cart-container">Loading...</div>;

  return (
    <div>
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
    <div className="cart-container">
      <h1>Your Cart</h1>
      {orderItems.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>PACKAGING</th>
                <th>QUANTITY</th>
                <th>PRICE PER PACKAGING</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map(item => {
                const unitPrice = prices[item.idOrderItem] ?? 0;
                return (
                  <tr key={item.idOrderItem}>
                    <td>{item.productName}</td>
                    <td>{item.unitName}</td>
                    <td>{item.quantity}</td>
                    <td>{unitPrice.toFixed(2)} €</td>
                    <td>{(unitPrice * item.quantity).toFixed(2)} €</td>
                    
                      <button onClick={() => handleRemoveItem(item.idOrderItem)} className="remove-item">Remove</button>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="right-panel">
  <div className="coupon-entry">
    <p>COUPON: </p>
    <input
      className="coupon-input"
      value={coupon}
      onChange={(e) => handleCouponChange(e.target.value)}
    />
    <button onClick={() => applyCoupon(coupon)} className="coupon-button">
      APPLY
    </button>
    <button onClick={() => clearCoupon(coupon)} className="coupon-button">
      CLEAR
    </button>
  </div>

  <div className="checkout-section">
    <div className="total-price">
      <strong>Total: {totalPrice.toFixed(2)} €</strong>
    </div>
    <div className="checkout">
      <button
        onClick={() => navigate('/checkout')}
        className="checkout-button"
      >
        Checkout
      </button>
    </div>
  </div>
</div>

        </>
      )}
    </div>
    </div>
  );
}

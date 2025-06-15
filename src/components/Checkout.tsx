import React, { useEffect, useState } from 'react';
import '../styles/checkout.css';
import { useNavigate } from "react-router-dom";

type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'CASH_ON_DELIVERY';

interface Order {
  idOrder: number;
  totalPrice: number;
}

const Checkout: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [idOrder, setIdOrder] = useState<number>(0);
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ street?: string; city?: string }>({});
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
  const user = localStorage.getItem('user');
  const email = user ? JSON.parse(user).email : null;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const activeOrderRes = await fetch(`${apiUrl}/orders/cart/${email}`);
        if (!activeOrderRes.ok) {
          navigate('/');
          return;
        }

        const data = await activeOrderRes.json();
        setOrder(data);
        setIdOrder(data.idOrder);
      } catch (err) {
        console.error('Greška pri dohvaćanju narudžbe:', err);
      }
    };

    fetchOrder();
  }, [idOrder]);

  // Validacija unosa
  const validateInputs = () => {
    const newErrors: { street?: string; city?: string; fullName?: string } = {};

if (fullName.trim().length === 0) {
  newErrors.fullName = "Required.";
} else if (fullName.length > 100) {
  newErrors.fullName = "Too long.";
}

    if (street.length > 80) {
      newErrors.street = "Too long.";
    }

    if (city.length > 50) {
      newErrors.city = "Too long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!order || !validateInputs()) return;

    const mapPaymentMethod = (method: PaymentMethod | ''): 'CASH' | 'CARD' => {
      switch (method) {
        case 'CREDIT_CARD':
        case 'PAYPAL':
          return 'CARD';
        case 'CASH_ON_DELIVERY':
        case '':
        default:
          return 'CASH';
      }
    };

    const fullAddress = `${fullName}, ${street}, ${city}, ${country}`;

    const dto = {
      idOrder: order.idOrder,
      paymentMethod: mapPaymentMethod(paymentMethod),
      shippingAddress: fullAddress.trim() || null,
    };

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/orders/place/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!res.ok) throw new Error('Error while placing order.');
      alert('Order successfully placed!');
      navigate("/");
    } catch (err) {
      console.error(err);
      alert('Error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {order ? (
        <>
          <p className='total-price'><strong>Total:</strong> {order.totalPrice} €</p>

            <div>
            <label>Full name:</label><br />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
            </div>
          <div>
            
            <label>Street:</label><br />
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
            {errors.street && <p className="error-text">{errors.street}</p>}
          </div>

          <div>
            <label>City:</label><br />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            {errors.city && <p className="error-text">{errors.city}</p>}
          </div>

          <div>
            <label>Country:</label><br />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">--Select country--</option>
              <option value="Croatia">Croatia</option>
            </select>
          </div>

          <div>
            <label>Methods of payment:</label><br />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="">--Select--</option>
              <option value="CASH_ON_DELIVERY">By cash</option>
            </select>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={
  isSubmitting ||
  !fullName.trim() ||
  !street.trim() ||
  !city.trim() ||
  !country ||
  !paymentMethod ||
  Object.keys(errors).length > 0
}
          >
            {isSubmitting ? 'Pending...' : 'Place order'}
          </button>
        </>
      ) : (
        <p>Loading order...</p>
      )}
    </div>
  );
};

export default Checkout;

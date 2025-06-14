import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/review.css";

interface OrderItem {
  idOrderItem: number;
  productName: string;
  unitName: string;
}

interface ReviewData {
    rating: number; 
    comment: string;
  }

const Review: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderReview, setOrderReview] = useState<ReviewData>({ rating: 5, comment: '' });
  const [itemReviews, setItemReviews] = useState<Map<number, ReviewData>>(new Map());

  const apiUrl = process.env.REACT_APP_API_URL;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!orderId) return;
      try {
        console.log("Fetch from " + `${apiUrl}/orderItem/order/${orderId}`);
        const res = await fetch(`${apiUrl}/orderItem/order/${orderId}`);
        const data = await res.json();
        setOrderItems(data);
        const initialMap = new Map();
        data.forEach((item: OrderItem) =>
          initialMap.set(item.idOrderItem, { rating: 5, comment: '' })
        );
        setItemReviews(initialMap);
      } catch (err) {
        console.error('Error fetching order items:', err);
      }
    };

    fetchOrderItems();
  }, [orderId]);

  const handleItemReviewChange = (id: number, field: keyof ReviewData, value: string | number) => {
    setItemReviews((prev) => {
      const updated = new Map(prev);
      const current = updated.get(id) || { rating: 5, comment: '' };
      updated.set(id, { ...current, [field]: value });
      return updated;
    });
  };

  const handleSubmit = async () => {
    const now = new Date().toISOString();

    try {
      // Order review
      await fetch(`${apiUrl}/orderreview/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingEnumMap[orderReview.rating],
          comment: orderReview.comment,
          reviewDate: now,
          invsaleUser: user.email,
          orderId: parseInt(orderId!),
        }),
      });

      // Order item reviews
      for (const [orderItemId, data] of itemReviews.entries()) {
        await fetch(`${apiUrl}/itemreviews/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rating: ratingEnumMap[data.rating],
              comment: data.comment,
              reviewDate: now,
              invsaleUser: user.email,
              orderItemId: orderItemId,
            }),
          });
      }

      alert('Review added successfuly!');
    } catch (err) {
      console.error('Error sending reviewa:', err);
      alert('Error. Please try again.');
    }
  };

  const ratingDisplayMap: { [key: number]: string } = {
    1: '★☆☆☆☆',
    2: '★★☆☆☆',
    3: '★★★☆☆',
    4: '★★★★☆',
    5: '★★★★★',
  };

  const ratingEnumMap: { [key: number]: string } = {
    1: 'ONE',
    2: 'TWO',
    3: 'THREE',
    4: 'FOUR',
    5: 'FIVE',
  };

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
      
      <div className="top-right">
          <div style={{ display: 'flex', marginTop: '10px'}}>
            <button onClick={() => navigate('/cart')} className="cart-button">CART</button>
          </div>
       
      </div>
    <div className="review-container">
      <h2>Review order #{orderId}</h2>

      <div className="order-review">
        <label>Rating:</label>
<div className="rating-circle-group">
  {[1, 2, 3, 4, 5].map((n) => (
    <label
      key={n}
      className={`rating-circle ${orderReview.rating === n ? 'active' : ''}`}
    >
      <input
        type="radio"
        value={n}
        checked={orderReview.rating === n}
        onChange={() => setOrderReview({ ...orderReview, rating: n })}
        style={{ display: 'none' }}
      />
      {n}
    </label>
  ))}
</div>


        <label>Comment:</label>
        <textarea
          value={orderReview.comment}
          onChange={(e) => setOrderReview({ ...orderReview, comment: e.target.value })}
        />
      </div>

      <h3>Item review</h3>
      <table className="review-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Packaging</th>
            <th>Rating</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item) => {
            const itemReview = itemReviews.get(item.idOrderItem);
            return (
              <tr key={item.idOrderItem}>
                <td>{item.productName}</td>
                <td>{item.unitName}</td>
                <td>
                  <select
                    value={itemReview?.rating || 5}
                    onChange={(e) =>
                      handleItemReviewChange(item.idOrderItem, 'rating', parseInt(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={itemReview?.comment || ''}
                    onChange={(e) =>
                      handleItemReviewChange(item.idOrderItem, 'comment', e.target.value)
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="add-review-btn" onClick={handleSubmit}>
        ADD REVIEW
      </button>
    </div>
    </div>
  );
};

export default Review;

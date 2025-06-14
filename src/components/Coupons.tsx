import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from 'react-icons/fa';
import '../styles/Coupons.css';
import AdminHeader from "./AdminMenu";

type Coupon = {
  code: string;
  name: string;
  dateTimeFrom: string | null;
  dateTimeTo: string | null;
  usageLimit: number;
  discount: number;
};

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editedCoupons, setEditedCoupons] = useState<{ [key: string]: Coupon }>({});
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponName, setNewCouponName] = useState('');
  const [newCouponDateTimeFrom, setNewCouponDateTimeFrom] = useState('');
  const [newCouponDateTimeTo, setNewCouponDateTimeTo] = useState('');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState(0);
  const [newCouponDiscount, setNewCouponDiscount] = useState(0);
  const navigate = useNavigate();

  const alphanumericRegex = /^[a-zA-Z0-9]*$/;

  const apiUrl = process.env.REACT_APP_API_URL;

  // Pretvara ISO string u lokalni datetime format za input
  const toDateTimeLocalFormat = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatDate = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetch(`${apiUrl}/coupons/`)
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data);
        const initialCoupons: { [key: string]: Coupon } = {};
        data.forEach((coupon: Coupon) => {
          initialCoupons[coupon.code] = coupon;
        });
        setEditedCoupons(initialCoupons);
      })
      .catch((err) => console.error("Error fetching coupons:", err));
  }, [apiUrl]);

  const handleCouponSelect = (couponCode: string) => {
    navigate('/coupon', { state: { code: couponCode } });
  };

  const handleCouponChange = (code: string, field: keyof Coupon, value: any) => {
    setEditedCoupons(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value,
      },
    }));
  };

  const handleSave = (code: string) => {
    const updatedCoupon = editedCoupons[code];

    const updatedCoupons = coupons.map(coupon =>
      coupon.code === code ? { ...coupon, ...updatedCoupon } : coupon
    );
    setCoupons(updatedCoupons);

    fetch(`${apiUrl}/coupons/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCoupon),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save');
        console.log(`Saved coupon ${code}`);
      })
      .catch((err) => console.error("Error saving coupon:", err));
  };

  const handleDelete = (code: string) => {
    fetch(`${apiUrl}/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete');
        setCoupons(prev => prev.filter(coupon => coupon.code !== code));
        console.log(`Deleted coupon ${code}`);
      })
      .catch((err) => console.error("Error deleting coupon:", err));
  };

  const handleCreateNew = () => {
    if (!newCouponCode.trim()) {
      alert("Coupon code is required!");
      return;
    }
  
    if (!newCouponName.trim()) {
      alert("Coupon name is required!");
      return;
    }

    if (newCouponCode.length > 20) {
      alert("Coupon code cannot be longer than 20 characters!");
      return;
    }

    if (!alphanumericRegex.test(newCouponCode)) {
      alert("Coupon code can only contain letters and numbers!");
      return;
    }
  
    if (!newCouponDateTimeFrom || !newCouponDateTimeTo) {
      alert("Both date fields are required!");
      return;
    }
  
    if (new Date(newCouponDateTimeFrom) > new Date(newCouponDateTimeTo)) {
      alert("Start date cannot be after end date!");
      return;
    }
  
    if (newCouponUsageLimit <= 0) {
      alert("Usage limit must be a positive number!");
      return;
    }
  
    if (newCouponDiscount < 0 || newCouponDiscount > 100) {
      alert("Discount must be between 0 and 100!");
      return;
    }
  
    // Provjera jedinstvenosti koda kupona
    if (coupons.some((coupon) => coupon.code === newCouponCode)) {
      alert("Coupon code already exists!");
      return;
    }
  
    const newCoupon: Coupon = {
      code: newCouponCode,
      name: newCouponName,
      dateTimeFrom: formatDate(new Date(newCouponDateTimeFrom)),
      dateTimeTo: formatDate(new Date(newCouponDateTimeTo)),
      usageLimit: newCouponUsageLimit,
      discount: newCouponDiscount,
    };
  
    fetch(`${apiUrl}/coupons/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCoupon),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create new coupon');
        setCoupons((prev) => [...prev, newCoupon]);
        setNewCouponCode('');
        setNewCouponName('');
        setNewCouponDateTimeFrom('');
        setNewCouponDateTimeTo('');
        setNewCouponUsageLimit(0);
        setNewCouponDiscount(0);
        alert(`Created new coupon ${newCouponCode}`);
      })
      .catch((err) => console.error("Error creating coupon:", err));
  };
  

  return (
    <div>
            <AdminHeader />

      <div className="home-container-coupons">
        <div className="create-coupon-form">
          <input
            type="text"
            placeholder="Coupon Code"
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value)}
            className="coupon-input"
          />
          <input
            type="text"
            placeholder="Coupon Name"
            value={newCouponName}
            onChange={(e) => setNewCouponName(e.target.value)}
            className="coupon-input"
          />
          <p>Activation date</p>
          <input
            type="datetime-local"
            value={newCouponDateTimeFrom}
            onChange={(e) => setNewCouponDateTimeFrom(e.target.value)}
            className="coupon-input"
          />
          <p>Expiration date</p>
          <input
            type="datetime-local"
            value={newCouponDateTimeTo}
            onChange={(e) => setNewCouponDateTimeTo(e.target.value)}
            className="coupon-input"
          />
          <p>Usages per user</p>
          <input
            type="number"
            placeholder="Usage Limit"
            value={newCouponUsageLimit}
            onChange={(e) => setNewCouponUsageLimit(Number(e.target.value))}
            className="coupon-input"
          />
          <p>Discount (decimal)</p>
          <input
            type="number"
            placeholder="Discount"
            value={newCouponDiscount}
            onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
            className="coupon-input"
          />
          <button onClick={handleCreateNew} className="create-new-button">
            CREATE
          </button>
        </div>

        <div className="coupons">
          <h2 className="coupons-title">Discount Coupons</h2>
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Activation Date</th>
                <th>Expiration date</th>
                <th>Usages Per User</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.code}>
                  <td onClick={() => handleCouponSelect(coupon.code)} style={{ cursor: 'pointer' }}>
                    <strong>{coupon.code}</strong>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editedCoupons[coupon.code]?.name ?? coupon.name}
                      onChange={(e) => handleCouponChange(coupon.code, 'name', e.target.value)}
                      className="coupon-input"
                    />
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={toDateTimeLocalFormat(editedCoupons[coupon.code]?.dateTimeFrom ?? coupon.dateTimeFrom)}
                      onChange={(e) => handleCouponChange(coupon.code, 'dateTimeFrom', e.target.value)}
                      className="coupon-input"
                    />
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={toDateTimeLocalFormat(editedCoupons[coupon.code]?.dateTimeTo ?? coupon.dateTimeTo)}
                      onChange={(e) => handleCouponChange(coupon.code, 'dateTimeTo', e.target.value)}
                      className="coupon-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editedCoupons[coupon.code]?.usageLimit ?? coupon.usageLimit}
                      onChange={(e) => handleCouponChange(coupon.code, 'usageLimit', Number(e.target.value))}
                      className="coupon-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editedCoupons[coupon.code]?.discount ?? coupon.discount}
                      onChange={(e) => handleCouponChange(coupon.code, 'discount', Number(e.target.value))}
                      className="coupon-input"
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: 0, marginBottom: '8px', marginLeft: '10px' }}>
                    <button onClick={() => handleSave(coupon.code)} className="save-button">
                      SAVE
                    </button>
                    <button onClick={() => handleDelete(coupon.code)} className="delete-button">
                      <FaTrash />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Coupons;

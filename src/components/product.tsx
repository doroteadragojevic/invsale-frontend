import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import '../styles/ProductDetail.css';
import { useNavigate } from "react-router-dom";


const apiUrl = process.env.REACT_APP_API_URL;

type Product = {
  idProduct: number;
  name: string;
  manufacturerName: string | null;
  description: string;
  imageData: string | null;
  reserved: number;
  quantityOnStock: number;
};

type Unit = {
  idUnit: number;
  name: string;
};

type CartItem = {
  idOrderItem: number;
  productId: number;
  unitId: number;
  quantity: number;
};

const ProductDetail = () => {
  const location = useLocation();
  const productId = location.state?.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [reserved, setReserved] = useState<number>(0);  // State to hold reserved quantity
  const [reviews, setReviews] = useState<{ rating: string; comment: string }[]>([]);
const [avgRating, setAvgRating] = useState<number | null>(null);
  const navigate = useNavigate();


useEffect(() => {
  if (!productId) return;

  // Dohvati recenzije proizvoda
  fetch(`${apiUrl}/itemreviews/product/${productId}`)
    .then((res) => res.json())
    .then((data) => {
      setReviews(data);
    })
    .catch((err) => console.error('Error fetching reviews:', err));
}, [productId]);

  useEffect(() => {
    if (!productId) return;

    fetch(`${apiUrl}/products/${productId}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch((err) => console.error('Error fetching product details:', err));

    fetch(`${apiUrl}/products/price/${productId}`)
      .then((res) => res.json())
      .then(setPrice)
      .catch((err) => console.error('Error fetching price:', err));

    fetch(`${apiUrl}/products/units/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        if (data.length > 0) setSelectedUnit(data[0].idUnit);
      })
      .catch((err) => console.error('Error fetching units:', err));

      fetch(`${apiUrl}/products/rating/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setAvgRating(data);
      })
      .catch((err) => console.error('Error fetching units:', err));

    // Fetch reserved quantity
    fetch(`${apiUrl}/products/reserved/${productId}/${selectedUnit}`)
      .then((res) => res.json())
      .then((data) => setReserved(data)) // Assume the response contains 'reserved'
      .catch((err) => console.error('Error fetching reserved quantity:', err));

    // Fetch orderId from backend
    const user = localStorage.getItem('user');
    const email = user ? JSON.parse(user).email : '';
    
    fetch(`${apiUrl}/orders/cart/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.idOrder) {
          setOrderId(data.idOrder);
        }
      })
      .catch((err) => console.error("Error fetching active order:", err));
  }, [productId]);

  useEffect(() => {
    if (!orderId || !productId || !selectedUnit) return;

    fetch(`${apiUrl}/orderItem/order/${orderId}`)
      .then((res) => res.json())
      .then((items) => {
        const found = items.find(
          (item: CartItem) => item.productId === productId && item.unitId === selectedUnit
        );
        setCartItem(found || null);
      })
      .catch((err) => console.error("Error checking cart item:", err));
  }, [orderId, productId, selectedUnit]);

  const createOrderIfNeeded = async () => {
    if (orderId) return orderId;

    const user = localStorage.getItem('user');
    const email = user ? JSON.parse(user).email : '';

    // Create a new order if no active order exists
    const res = await fetch(`${apiUrl}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const newOrder = await res.json();
    setOrderId(newOrder.idOrder);
    return newOrder.idOrder;
  };

  const handleAddToCart = async () => {
    if (!selectedUnit || !productId || !product) return;

    // Prevent adding to cart if the product is out of stock
    if (reserved >= product.quantityOnStock) {
      alert("This product is currently out of stock.");
      return;
    }

    const currentOrderId = await createOrderIfNeeded();

    await fetch(`${apiUrl}/orderItem/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        unitId: selectedUnit,
        quantity: 1,
        orderId: currentOrderId,
      }),
    });

    const updatedItems = await fetch(`${apiUrl}/orderItem/order/${currentOrderId}`).then(res => res.json());
    const found = updatedItems.find(
      (item: CartItem) => item.productId === productId && item.unitId === selectedUnit
    );
    setCartItem(found || null);
  };

  const updateQuantity = async (orderItemId: number, action: 'inc' | 'dec') => {
    if (!cartItem || !product) return;
  
    // Ovisno o akciji, povećavamo ili smanjujemo količinu za 1
    const newQuantity = action === 'inc' ? cartItem.quantity + 1 : cartItem.quantity - 1;
  
    // Provjera da li želimo smanjiti količinu ispod 1 ili prijeći u negativnu količinu
    if (newQuantity <= 0) {
      // Ako količina padne ispod 1, brišemo artikl iz košarice
      await fetch(`${apiUrl}/orderItem/${cartItem.idOrderItem}`, { method: "DELETE" });
      setCartItem(null);
    } else {
      // Provjera da li je količina rezervirana veća ili jednaka na skladištu
      if (reserved + newQuantity > product.quantityOnStock) {
        alert("No more available stock for this product.");
        return;
      }

      const path = action === 'inc' ? `/orderItem/${orderItemId}` : `/orderItem/de/${orderItemId}`;
      const res = await fetch(`${apiUrl}${path}`, { method: "PUT" });;
  
      // Ažuriraj stanje s novom količinom
      setCartItem({ ...cartItem, quantity: newQuantity });
    }
  };

  // Funkcija koja dohvaća cijenu za odabrano pakiranje
const fetchPriceForUnit = async (productId: number, unitId: number) => {
  try {
    const res = await fetch(`${apiUrl}/pricelist/price/${productId}/${unitId}`);
    if (!res.ok) throw new Error("Failed to fetch price");
    const data = await res.json();
    setPrice(data);
  } catch (error) {
    console.error('Error fetching price for unit:', error);
    setPrice(null);
  }
};

// useEffect koji prati promjenu odabranog pakiranja
useEffect(() => {
  if (productId && selectedUnit !== null) {
    fetchPriceForUnit(productId, selectedUnit);
  }
}, [selectedUnit, productId]);


  const mapRating = (rating: string) => {
    switch(rating) { 
        case 'FIVE': { 
           return 5;
        } 
        case 'FOUR': { 
           return 4;
        } 
        case 'THREE': { 
            return 3;
         } 
         case 'TWO': { 
            return 2;
         } 
         case 'ONE': { 
            return 1;
         } 
        default: { 
           return 1; 
           break; 
        } 
     } 
  };
  

   const user = localStorage.getItem('user');
  const isLoggedIn = !!user; // true ako postoji
  if (!product) return <div>Loading...</div>;

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
    
    <div className="product-detail-container">
      <div className="product-detail-main">
        <div className="product-image">
          {product.imageData && (
            <img src={`data:image/jpeg;base64,${product.imageData}`} alt={product.name} />
          )}
        </div>
  
        <div className="product-info">
          <h2>{product.name}</h2>
          {product.manufacturerName && <p className="manufacturer">{product.manufacturerName}</p>}
          <p className="price">{price !== null ? `$${price.toFixed(2)}` : 'Price not available'}</p>
  
          <div className="quantity-cart">
            <label htmlFor="unit">Packaging:</label>
            <select
  id="unit"
  value={selectedUnit ?? ''}
  onChange={(e) => {
    const unitId = parseInt(e.target.value);
    setSelectedUnit(unitId);
    // Nema potrebe za dodatnim fetchom ovdje jer će useEffect reagirati na setSelectedUnit
  }}
>
  {units.map((unit) => (
    <option key={unit.idUnit} value={unit.idUnit}>
      {unit.name}
    </option>
  ))}
</select>

  
            {isLoggedIn ? (
              cartItem ? (
              <div className="quantity-buttons">
                <button onClick={() => updateQuantity(cartItem.idOrderItem, 'dec')}>-</button>
                <span>{cartItem.quantity}</span>
                <button onClick={() => updateQuantity(cartItem.idOrderItem, 'inc')}>+</button>
              </div>
            ) : (
              <button onClick={handleAddToCart}>ADD TO CART</button>
            )):(
          <div style={{ marginTop: '-8px' }}>
  <em style={{ color: '#666' }}>Log in to add product to the cart.</em>
          </div>
        )}
          </div>
  
          <div className="product-description">
            <h3>Details</h3>
            <p>{product.description}</p>
          </div>

          <p className='product-info-rating'><strong>Average Rating:</strong> {avgRating ? avgRating.toFixed(1) : 'N/A'}</p>

  
        </div>
      </div>
  
      <div className="product-ratings">
  <h3>User Reviews</h3>
  {reviews.length > 0 ? (
    <>
          <div className="ratings-list">
        {reviews.map((review, index) => (
          <div key={index} className="review-item">
            <div className="stars">
              {'★'.repeat(mapRating(review.rating))}{'☆'.repeat(5 - review.rating)}
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </>
  ) : (
    <p>No ratings yet.</p>
  )}
</div>

    </div>
    </div>
  );
  
};

export default ProductDetail;

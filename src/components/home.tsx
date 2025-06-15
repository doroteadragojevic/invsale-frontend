import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/home.css';
import OrderReviews from './OrderReviews';
import ChatbotPopup from './ChatbotPopup.js';

type Product = {
  idProduct: number;
  name: string;
  manufacturerName: string | null;
  description: string;
  imageData: string | null;
  price?: number;
  discount: boolean;
  quantityOnStock?: number;
  reserved: number;
};

type Category = {
  name: string;
  description: string | null;
};

type CartItem = {
  idOrderItem: number;
  productId: number;
  quantity: number;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      const user = localStorage.getItem('user');
      const email = user ? JSON.parse(user).email : null;

      if (email) {
        fetch(`${apiUrl}/orders/cart/${email}`)
          .then(res => res.json())
          .then(order => {
            if (order?.idOrder) {
              setOrderId(order.idOrder);
              return fetch(`${apiUrl}/orderItem/order/${order.idOrder}`);
            } else {
              return Promise.reject("Nema trenutne narudžbe");
            }
          })
          .then(res => res.json())
          .then(setCartItems)
          .catch(console.error);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${apiUrl}/categories/`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const encodedCategoryName = selectedCategory ? encodeURIComponent(selectedCategory) : null;
    const suffix = selectedCategory ? `/products/category/${encodedCategoryName}` : "/products/";

    fetch(`${apiUrl}${suffix}`)
      .then(res => res.json())
      .then(async (data) => {
        const productsWithDetails = await Promise.all(
          data.map(async (product: any) => {
            const pricePromise = fetch(`${apiUrl}/products/price/${product.idProduct}`).then(res => res.json());
            const discountPromise = fetch(`${apiUrl}/products/discount/${product.idProduct}`).then(res => res.json());
            const unitRes = await fetch(`${apiUrl}/products/basicUnit/${product.idProduct}`);
            const unitData = await unitRes.json();
            const unitId = unitData.idUnit;
            const reservedPromise = fetch(`${apiUrl}/products/reserved/${product.idProduct}/${unitId}`)
              .then(res => res.json())
              .then((reserved: any) => reserved);

            // Čekanje svih podataka
            const [price, discount, reserved] = await Promise.all([pricePromise, discountPromise, reservedPromise]);

            return {
              ...product,
              price,
              discount,
              reserved,
              imageData: product.imageData ? `data:image/jpeg;base64,${product.imageData}` : null,
            };
          })
        );
        setProducts(productsWithDetails);
      })
      .catch(console.error);
  }, [selectedCategory]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setOrderId(null);
    setCartItems([]);
    navigate('/');
  };

  const getCartItem = (productId: number) => {
    return cartItems.find(item => item.productId === productId);
  };

  const updateQuantity = async (idOrderItem: number, action: 'inc' | 'dec') => {
    if (!idOrderItem) {
      console.error("Invalid idOrderItem:", idOrderItem);
      return;
    }
  
    try {
      // Pronađi proizvod u stanju
      const item = cartItems.find(i => i.idOrderItem === idOrderItem);
      if (!item) return;
  
      const product = products.find(p => p.idProduct === item.productId);
      if (!product) return;
  
      const availableQuantity = (product.quantityOnStock ?? 0) - (product.reserved ?? 0);
  
      // Ako je inkrement, provjeri dostupnost
      if (action === 'inc' && availableQuantity <= 0) {
        alert("Nema više proizvoda na skladištu.");
        return;
      }
  
      // Ako je dekrement i količina je 1, brišemo direktno
      if (action === 'dec' && item.quantity === 1) {
        // Poziv prema backendu za brisanje
        const deleteRes = await fetch(`${apiUrl}/orderItem/${idOrderItem}`, { method: "DELETE" });
  
        if (!deleteRes.ok) throw new Error('Greška kod brisanja stavke');
  
        // Ažuriraj stanje u košarici
        setCartItems(prev => prev.filter(ci => ci.idOrderItem !== idOrderItem));
  
        // Ažuriraj stanje proizvoda (oslobodi rezervirano)
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.idProduct === product.idProduct
              ? { ...p, reserved: Math.max((p.reserved ?? 0) - 1, 0) }
              : p
          )
        );
  
        return;
      }
  
      // Ako je inkrement ili dekrement s količinom većom od 1, nastavi
      const path = action === 'inc' ? `/orderItem/${idOrderItem}` : `/orderItem/de/${idOrderItem}`;
      const res = await fetch(`${apiUrl}${path}`, { method: "PUT" });
  
      if (!res.ok) throw new Error('Greška kod ažuriranja količine');
  
      // Dohvati ažuriranu stavku
      const updatedRes = await fetch(`${apiUrl}/orderItem/${idOrderItem}`);
      if (!updatedRes.ok) throw new Error('Greška kod dohvaćanja ažurirane stavke');
  
      const updatedItem = await updatedRes.json();
  
      // Ažuriraj košaricu
      setCartItems(prev =>
        prev
          .map(item =>
            item.idOrderItem === updatedItem.idOrderItem
              ? { ...item, quantity: updatedItem.quantity }
              : item
          )
          .filter(item => item.quantity > 0)
      );
  
      // Ažuriraj stanje proizvoda
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.idProduct === updatedItem.productId
            ? { ...p, reserved: updatedItem.quantity }
            : p
        )
      );
    } catch (err) {
      console.error("Greška kod ažuriranja količine:", err);
    }
  };
  
  
  
  
  const handleAddToCart = async (productId: number) => {
    try {
      const product = products.find(p => p.idProduct === productId);
  
      if (!product) {
        console.error("Proizvod nije pronađen.");
        return;
      }
  
      const availableQuantity = (product.quantityOnStock ?? 0) - (product.reserved ?? 0);
  
      if (availableQuantity <= 0) {
        alert("Nema više proizvoda na skladištu.");
        return;
      }
  
      // Nastavlja se postojeći kod...
      let currentOrderId = orderId;
  
      if (!currentOrderId) {
        const user = localStorage.getItem('user');
        const email = user ? JSON.parse(user).email : '';
        const res = await fetch(`${apiUrl}/orders/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const newOrder = await res.json();
        currentOrderId = newOrder.idOrder;
        setOrderId(currentOrderId);
      }
  
      const unitRes = await fetch(`${apiUrl}/products/basicUnit/${productId}`);
      const unitData = await unitRes.json();
      const unitId = unitData.idUnit;
  
      const res = await fetch(`${apiUrl}/orderItem/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          unitId,
          quantity: 1,
          orderId: currentOrderId
        })
      });
  
      const newItem = await res.json();
      setCartItems(prev => [...prev, {
        idOrderItem: newItem.idOrderItem,
        productId: newItem.productId,
        quantity: newItem.quantity
      }]);
  
      // Ažuriraj reserved u frontend stanju
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.idProduct === productId
            ? { ...product, reserved: (product.reserved ?? 0) + 1 }
            : product
        )
      );
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  return (
    <div className="body">
      <header>
  <div className="logo">
  <a href="/#/">
  <img src="/olive3.png" alt="Logo" className="logo-image" />
    </a>
    <Link to="/fyp">FYP</Link>
    <Link to="/">SHOP</Link>
    <Link to="/orders">MY ORDERS</Link>
  </div>
</header>
      
      <div className="top-right">
        {isLoggedIn ? (
          <div style={{ display: 'flex', marginTop: '10px'}}>
            <button onClick={() => navigate('/cart')} className="cart-button">CART</button>
            <button onClick={handleLogout} className="logout-button">LOG OUT</button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="login-button">LOG IN</button>
        )}
      </div>

      <div className="home-container">
        <div className="categories">
          <h2 className="categories-title">CATEGORIES</h2>
          <ul>
            {categories.map((category) => (
              <li key={category.name} className="category-item" onClick={() => handleCategorySelect(category.name)}>
                <strong>{category.name}</strong>
              </li>
            ))}
          </ul>
          <button onClick={handleClearFilter} className="clear-filter">CLEAR</button>
        </div>
        <div className="products">
          <h1 className="products-title">Shop</h1>
          <div className="products-grid">
            {products.map((product) => {
              const cartItem = getCartItem(product.idProduct);
              const maxQuantity = product.quantityOnStock ?? Infinity;
              const reserved = product.reserved ?? 0;
              const available = maxQuantity - reserved;

              return (
                <div key={product.idProduct} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.imageData || "/path/to/default-image.jpg"}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/path/to/default-image.jpg";
                      }}
                    />
                    <div className="overlay">
                      <button onClick={() => navigate('/product', { state: { productId: product.idProduct , isLoggedIn: true} })} className="view-button">VIEW</button>
                    </div>
                  </div>
                  <div className="product-name">{product.name}</div>
                  {product.price !== undefined && (
                    <div className="product-price" style={{ color: product.discount ? '#687616' : 'inherit' }}>
                      {product.price !== null ? `${product.price} €` : "Price not available"}
                    </div>
                  )}
                  <div className="add-to-cart">
                    {cartItem ? (
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(cartItem.idOrderItem, 'dec')}>−</button>
                        <span>{cartItem.quantity}</span>
                        <button
                          onClick={() => {
                            if (available <= 0) {
                              alert("Nema više proizvoda na skladištu.");
                            } else {
                              updateQuantity(cartItem.idOrderItem, 'inc');
                            }
                          }}
                        >+</button>
                      </div>
                    ) : (
                      available <= 0 ? (
                        <div className="not-available">Not available</div>
                      ) : (
                        <button className="add-to-cart-button" onClick={() => handleAddToCart(product.idProduct)}>
                          ADD TO CART
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <OrderReviews />
      <ChatbotPopup />
    </div>
  );
}

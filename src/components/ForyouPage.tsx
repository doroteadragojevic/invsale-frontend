import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/home.css';

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

type CartItem = {
  idOrderItem: number;
  productId: number;
  quantity: number;
};

export default function ForYouPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

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
    const user = localStorage.getItem('user');
    const email = user ? JSON.parse(user).email : null;

    fetch(`${apiUrl}/products/recommended/${email}`)
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
  }, []);

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
      const path = action === 'inc' ? `/orderItem/${idOrderItem}` : `/orderItem/de/${idOrderItem}`;
      const res = await fetch(`${apiUrl}${path}`, { method: "PUT" });
  
      if (!res.ok) throw new Error('Greška kod ažuriranja količine');
  
      // Nakon uspješne promjene količine, osvježavamo cartItems i ažuriramo reserved
      const updatedRes = await fetch(`${apiUrl}/orderItem/${idOrderItem}`);
      if (!updatedRes.ok) throw new Error('Greška kod dohvaćanja ažurirane stavke');
  
      const updatedItem = await updatedRes.json();
  
      setCartItems(prev =>
        prev
          .map(item =>
            item.idOrderItem === updatedItem.idOrderItem
              ? { ...item, quantity: updatedItem.quantity }
              : item
          )
          .filter(item => item.quantity > 0)
      );
  
      // Ažuriraj reserved stanje odmah u stanju proizvoda
      const updatedProducts = [...products];
      const productIndex = updatedProducts.findIndex(product => product.idProduct === updatedItem.productId);
      if (productIndex !== -1) {
        const updatedProduct = updatedProducts[productIndex];
        updatedProduct.reserved = updatedItem.quantity;
        setProducts(updatedProducts);
      }
  
      if (action === 'dec' && updatedItem.quantity === 0) {
        await fetch(`${apiUrl}/orderItem/${idOrderItem}`, { method: "DELETE" });
      }
    } catch (err) {
      console.error("Greška kod ažuriranja količine:", err);
    }
  };
  
  
  const handleAddToCart = async (productId: number) => {
    try {
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
      console.log("New Order Item: ", newItem);
      setCartItems(prev => [...prev, {
        idOrderItem: newItem.idOrderItem,
        productId: newItem.productId,
        quantity: newItem.quantity
      }]);
  
      // Ponovno dohvaćanje podataka o "reserved" nakon dodavanja u košaricu
      
      const updatedProduct = await fetch(`${apiUrl}/products/reserved/${productId}/${unitId}`).then(res => res.json());
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.idProduct === productId
            ? { ...product, reserved: updatedProduct.reserved }
            : product
        )
      );
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const navigateToOrders = () => {
    navigate('/orders'); // URL za kategorije
    setIsMenuOpen(false); // Zatvori meni nakon odabira
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
        {isLoggedIn ? (
          <div style={{ display: 'flex', marginTop: '10px'}}>
            <button onClick={() => navigate('/cart')} className="cart-button">CART</button>
            <button onClick={handleLogout} className="logout-button">LOG OUT</button>

          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="login-button">Prijava</button>
        )}
      </div>


      <div className="home-container"
      style={{
        justifyContent: 'center',
      }}
      >
        <div className="products">
          <h1 className="products-title">Recommended for you</h1>
          <div
  className="products-grid"
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    justifyContent: 'center',
    padding: '0 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  }}
>
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
                      <button onClick={() => navigate('/product', { state: { productId: product.idProduct } })} className="view-button">VIEW</button>
                    </div>
                  </div>
                  <div className="product-name">{product.name}</div>
                  {product.price !== undefined && (
                    <div className="product-price" style={{ color: product.discount ? 'goldenrod' : 'inherit' }}>
                      {product.price !== null ? `$${product.price}` : "Price not available"}
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
    </div>
  );
}

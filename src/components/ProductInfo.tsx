import React from 'react';

type Product = {
  name: string;
  manufacturerName: string | null;
  description: string;
  price: number | null;
};

type ProductInfoProps = {
  product: Product;
};

const ProductInfo = ({ product, price, units, selectedUnit, setSelectedUnit, cartItem, reserved, updateQuantity, handleAddToCart }: ProductInfoProps) => {
  const user = localStorage.getItem('user');
  const isLoggedIn = !!user; // true ako postoji
  console.log(isLoggedIn);
    return (
      <div className="product-info">
        <h2>{product.name}</h2>
        {product.manufacturerName && <p className="manufacturer">{product.manufacturerName}</p>}
        <p className="price">
          {price !== null && price !== undefined ? `$${price.toFixed(2)}` : 'Price not available'}
        </p>
  
        <div className="quantity-cart">
          <label htmlFor="unit">Unit:</label>
          <select
            id="unit"
            value={selectedUnit ?? ''}
            onChange={(e) => setSelectedUnit(parseInt(e.target.value))}
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
            <button onClick={handleAddToCart}>Add to Cart</button>
          )):
          (
          <div style={{ marginTop: '10px', color: '#666' }}>
            <em>Prijavite se kako biste dodali proizvod u košaricu.</em>
          </div>
        )}
        </div>
  
        <div className="product-description">
          <h3>Details</h3>
          <p>{product.description}</p>
        </div>
  
        <div className="product-rating">
          <h4>Avg Rating:</h4>
          <div className="stars">★★★★☆</div>
        </div>
      </div>
    );
  };
  

export default ProductInfo;

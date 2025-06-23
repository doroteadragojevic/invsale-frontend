import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import '../styles/ProductDetail.css';
import AdminHeader from './AdminMenu';

type Product = {
  idProduct: number;
  name: string;
  idManufacturer: number | null;
  manufacturerName: string | null;
  description: string;
  imageData: string | null;
  quantityOnStock: number | null;
  ingredients: Set<string>;
  reorderNotificationThreshold: number | null;
};

type Category = { name: string };
type Unit = { idUnit: number; name: string };
type Manufacturer = { idManufacturer: number; name: string };

const UpdateProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productId = location.state?.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [allManufacturers, setAllManufacturers] = useState<Manufacturer[]>([]);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [reviews, setReviews] = useState<{ rating: string; comment: string }[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchPrice();
      fetchAllCategories();
      fetchAllUnits();
      fetchAllManufacturers();
      fetchProductCategories();
      fetchProductUnits();
      fetchRatings();
      fetchAvgRating();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/${productId}`);
      const data = await res.json();
      setProduct({
        ...data,
        ingredients: data.ingredients ? new Set(data.ingredients) : new Set(), 
      });
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const fetchAvgRating = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/rating/${productId}`);
      const data = await res.json();
      setAvgRating(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${apiUrl}/itemreviews/product/${productId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const fetchPrice = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/price/${productId}`);
      const data = await res.json();
      setPrice(data);
    } catch (err) {
      console.error('Error fetching price:', err);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/categories/`);
      const data = await res.json();
      setAllCategories(data);
    } catch (err) {
      console.error('Error fetching all categories:', err);
    }
  };

  const fetchAllUnits = async () => {
    try {
      const res = await fetch(`${apiUrl}/units/`);
      const data = await res.json();
      setAllUnits(data);
    } catch (err) {
      console.error('Error fetching all units:', err);
    }
  };

  const fetchAllManufacturers = async () => {
    try {
      const res = await fetch(`${apiUrl}/manufacturer/`);
      const data = await res.json();
      setAllManufacturers(data);
    } catch (err) {
      console.error('Error fetching manufacturers:', err);
    }
  };

  const fetchProductCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/categories/${productId}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching product categories:', err);
    }
  };

  const fetchProductUnits = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/units/${productId}`);
      const data = await res.json();
      setUnits(data);
    } catch (err) {
      console.error('Error fetching product units:', err);
    }
  };

  const handleCategoryToggle = async (categoryName: string) => {
    const isSelected = categories.some(c => c.name === categoryName);

    try {
      const endpoint = isSelected ? 'remove' : 'add';
      await fetch(`${apiUrl}/products/${productId}/category/${endpoint}/${categoryName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName }),
      });
      fetchProductCategories();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleUnitToggle = async (unit: Unit) => {
    const isSelected = units.some(u => u.idUnit === unit.idUnit);

    try {
      const endpoint = isSelected ? 'remove' : 'add';
      await fetch(`${apiUrl}/products/${productId}/unit/${endpoint}/${unit.idUnit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUnit: unit.idUnit }),
      });
      fetchProductUnits();
    } catch (err) {
      console.error('Error updating unit:', err);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);

      const formData = new FormData();
      formData.append('image', file);

      try {
        await fetch(`${apiUrl}/products/img/${productId}`, {
          method: 'POST',
          body: formData,
        });
        fetchProduct();
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }
  };


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

  const handleUpdateBasicInfo = async () => {
    if (!product) return;

    if(!validateFields()) return;

    try {
      const response = await fetch(`${apiUrl}/products/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProduct: product.idProduct,
          name: product.name,
          idManufacturer: product.idManufacturer,
          description: product.description,
          quantityOnStock: product.quantityOnStock,
          ingredients: Array.from(product.ingredients), 
          reorderNotificationThreshold: product.reorderNotificationThreshold
        }),
      });

      if (response.ok) {
        alert('Product updated successfully!');
        navigate('/admin');
      } else {
        alert('Error updating product.');
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const validateFields = () => {
    if (!product) return false;
  
    if (!product.name.trim()) {
      alert("Product name is required.");
      return false;
    } else if (product.name.length > 50) {
      alert("Product name cannot exceed 50 characters.");
      return false;
    } 
    if (product.description.length > 250) {
      alert("Description cannot exceed 250 characters.");
      return false;
    } else if (!product.description.trim()) {
      alert("Description is required.");
      return false;
    } 
  
    if (product.quantityOnStock !== null && product.quantityOnStock < 0) {
      alert("Quantity cannot be negative.");
      return false;
    }
  
    if (
      product.reorderNotificationThreshold !== null &&
      product.reorderNotificationThreshold <= 0
    ) {
      alert("Threshold must be greater than 0.");
      return  false;
    } 

  
    return true;
  };
  

  const handleManufacturerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value, 10);
    const selectedManufacturer = allManufacturers.find(m => m.idManufacturer === selectedId);

    if (selectedManufacturer && product) {
      setProduct({
        ...product,
        idManufacturer: selectedManufacturer.idManufacturer,
        manufacturerName: selectedManufacturer.name,
      });
    }
  };

  const handleIngredientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const ingredientsSet = new Set(value.split(',').map(ingredient => ingredient.trim()));
    if (product) {
      setProduct({ ...product, ingredients: ingredientsSet });
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <AdminHeader />
    <div className="product-detail-container">
      <div className="product-detail-main">
        <div className="product-image">
          {product.imageData && (
            <img src={`data:image/jpeg;base64,${product.imageData}`} alt={product.name} />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="product-info">
          <label>Product Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            placeholder="Product Name"
          />

<label>Supplier</label>
          <select
            value={product.idManufacturer ?? ''}
            onChange={handleManufacturerChange}
          >
            <option value="">Select Manufacturer</option>
            {allManufacturers.map((m) => (
              <option key={m.idManufacturer} value={m.idManufacturer}>
                {m.name}
              </option>
            ))}
          </select>

<label>Description</label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            placeholder="Product Description"
          />


<label>Quantity on stock</label>
          <input
            type="number"
            value={product.quantityOnStock ?? ''}
            onChange={(e) => setProduct({ ...product, quantityOnStock: parseInt(e.target.value) })}
            placeholder="Quantity On Stock"
          />
<label>Ingredients</label>
          <textarea
            value={Array.from(product.ingredients).join(', ')}
            onChange={handleIngredientsChange}
            placeholder="Ingredients (comma separated)"
          />

          <label>Low Stock Limit</label>
          <input
            type="number"
            value={product.reorderNotificationThreshold ?? ''}
            onChange={(e) => setProduct({ ...product, reorderNotificationThreshold: parseInt(e.target.value) })}
            placeholder="Low Stock Limit"
          />

          <div>
  {price !== null ? `Price: ${price} €` : 'Price not available'}
</div>

          <div className="checkbox-section">
            <h4>Categories</h4>
            {allCategories.map((category) => (
              <div key={category.name}>
                <input
                  type="checkbox"
                  checked={categories.some(c => c.name === category.name)}
                  onChange={() => handleCategoryToggle(category.name)}
                />
                {category.name}
              </div>
            ))}
          </div>

          <div className="checkbox-section">
            <h4>Units</h4>
            {allUnits.map((unit) => (
              <div key={unit.idUnit}>
                <input
                  type="checkbox"
                  checked={units.some(u => u.idUnit === unit.idUnit)}
                  onChange={() => handleUnitToggle(unit)}
                />
                {unit.name}
              </div>
            ))}
          </div>

          <button onClick={handleUpdateBasicInfo}>Update Product</button>

          
          <button className="btn" onClick={() => navigate('/prices', { state: { productId: product.idProduct } })}>
            View Prices
          </button>
        </div>
        
      </div>
      <div className="product-ratings">
  <h3>User Ratings</h3>
  {reviews.length > 0 ? (
    <>
      <p>Average Rating: {avgRating ? avgRating.toFixed(1) : 'N/A'}</p>
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

export default UpdateProduct;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderReviews from "./OrderReviews";
import AdminHeader from "./AdminMenu";
import '../styles/home.css'; // Importiramo CSS datoteku


type Product = {
  idProduct: number;
  name: string;
  manufacturerName: string | null;
  description: string;
  imageData: string | null; // base64 encoded string, može biti null
  price?: number; // Dodajemo cijenu kao opcionalni parametar
  discount: boolean;
};

type Category = {
  name: string;
  description: string | null;
};

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  // Fetch categories
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log("Fetching from:", apiUrl);
    fetch(`${apiUrl}/categories/`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Ako postoji token, korisnik je prijavljen
  }, []);

  // Fetch products
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const encodedCategoryName = selectedCategory ? encodeURIComponent(selectedCategory) : null;
    const apiUrlSuffix = selectedCategory
      ? `/products/category/${encodedCategoryName}`
      : "/products/";
    fetch(`${apiUrl}${apiUrlSuffix}`)
      .then((res) => res.json())
      .then((data) => {
        const productsWithPrices = data.map((product: any) => {
          const pricePromise = fetch(`${apiUrl}/products/price/${product.idProduct}`).then(res => res.json());
          const discountPromise = fetch(`${apiUrl}/products/discount/${product.idProduct}`).then(res => res.json());
        
          return Promise.all([pricePromise, discountPromise])
            .then(([price, discount]) => ({
              ...product,
              price,
              discount,
              imageData: product.imageData ? `data:image/jpeg;base64,${product.imageData}` : null,
            }))
            .catch(() => ({
              ...product,
              price: null,
              discount: false,
              imageData: product.imageData ? `data:image/jpeg;base64,${product.imageData}` : null,
            }));
        });

        // Čekaj dok ne dobijemo sve proizvode i njihove cijene
        Promise.all(productsWithPrices)
          .then((filledProducts) => {
            setProducts(filledProducts);
          })
          .catch((err) => console.error("Error fetching product prices:", err));
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [selectedCategory]);

  // Choose category
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  // Reset filter
  const handleClearFilter = () => {
    setSelectedCategory(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false); // Postavi status prijave na false
    navigate('/'); // Preusmjeri na stranicu za prijavu
  };

  // Navigate to add new product page
  const handleAddProduct = () => {
    navigate('/add-product'); // Pretpostavljamo da imamo stranicu za dodavanje proizvoda
  };

  const handleDeleteProduct = async (idProduct: number) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      const response = await fetch(`${apiUrl}/products/${idProduct}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Product deleted!');
        setProducts(prevProducts => prevProducts.filter(product => product.idProduct !== idProduct));
      } else {
        alert('Error deleting product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div>
        <AdminHeader />
    <div className="home-container">
      <div className="categories">
      <button onClick={handleAddProduct} className="add-product-button">
          ADD PRODUCT
        </button>
        <h2 className="categories-title">CATEGORIES</h2>
        <ul>
          {categories.map((category) => (
            <li
              key={category.name}
              className="category-item"
              onClick={() => handleCategorySelect(category.name)}
            >
              <strong>{category.name}</strong>
            </li>
          ))}
        </ul>
        <button onClick={handleClearFilter} className="clear-filter">
          Clear Filter
        </button>
      </div>
      <div className="products">
        <h1 className="products-title">Products</h1>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.idProduct} className="product-card">
              {/* Slika proizvoda */}
              <div className="product-image-container">
                <img
                  src={product.imageData || "/path/to/default-image.jpg"}
                  alt={product.name}
                  className="product-image"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.log("Error loading image:", e.target);
                    (e.target as HTMLImageElement).src = "/path/to/default-image.jpg";
                  }}
                />
                <div className="overlay">
                <button
  onClick={() => navigate('/product-admin', { state: { productId: product.idProduct } })}
  className="view-button"
>
  VIEW
</button>
                </div>
              </div>

              {/* Naziv proizvoda */}
              <div className="product-name">{product.name}</div>

              {product.price !== undefined && (
  <div
    className="product-price"
    style={{ color: product.discount ? 'goldenrod' : 'inherit' }}
  >
    {product.price !== null ? `${product.price} €` : "Price not available"}
  </div>
)}

<button 
    className="delete-button-adm" 
    onClick={() => handleDeleteProduct(product.idProduct)}
  >
    DELETE
  </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    <OrderReviews />
    </div>
  );
}

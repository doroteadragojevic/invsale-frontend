import { useEffect, useState } from 'react';
import '../styles/Stocks.css'; // Stilizacija tablice
import AdminHeader from './AdminMenu';

type Product = {
  idProduct: number;
  name: string;
  stock: number;
  reorderNotificationThreshold: number;
};

export default function Stocks() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/products/`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData: Product[] = data.map((product: any) => ({
          idProduct: product.idProduct,
          name: product.name,
          stock: product.quantityOnStock,
          reorderNotificationThreshold: product.reorderNotificationThreshold || 0,
        }));
        setProducts(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("There was an error fetching the products.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div><AdminHeader />
    <div className="stocks-container">
      <h1>Inventory</h1>
      <table className="stocks-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Quantity on stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isLowStock = product.stock < product.reorderNotificationThreshold;
            return (
              <tr key={product.idProduct} className={isLowStock ? 'low-stock' : ''}>
                <td>{product.idProduct}</td>
                <td>{product.name}</td>
                <td>{product.stock}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}

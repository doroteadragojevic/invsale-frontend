import React, { useEffect, useState } from 'react';
import '../styles/stats.css';
import { jsPDF } from 'jspdf';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AdminHeader from './AdminMenu';


const ProductDTO = {
  idProduct: null,
  idManufacturer: null,
  manufacturerName: '',
  name: '',
  ingredients: null,
  description: '',
  imageData: '',
  reorderNotificationThreshold: null,
  quantityOnStock: null
};

const Stats = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState([]);

  const [categories, setCategories] = useState([]);
const [productsFilter, setProductsFilter] = useState([]);
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedProduct, setSelectedProduct] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/products/`);
      const data = await response.json();
      const mappedProducts = data.map((product) => ({
        ...ProductDTO,
        idProduct: product.idProduct,
        idManufacturer: product.idManufacturer,
        manufacturerName: product.manufacturerName,
        name: product.name,
        ingredients: product.ingredients,
        description: product.description,
        imageData: product.imageData,
        reorderNotificationThreshold: product.reorderNotificationThreshold,
        quantityOnStock: product.quantityOnStock
      }));
      setProducts(mappedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Greška prilikom dohvaćanja proizvoda:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchChartData(timeRange);
  }, [timeRange]);

  useEffect(() => {
  const fetchCategories = async () => {
    const res = await fetch(`${apiUrl}/categories/`);
    const data = await res.json();
    setCategories(data);
  };
  fetchCategories();
}, []);

useEffect(() => {
  const fetchProductsFilter = async () => {
    if (selectedCategory) {
      const res = await fetch(`${apiUrl}/products/category/${selectedCategory}`);
      const data = await res.json();
      setProductsFilter(data);
    } else {
      const res = await fetch(`${apiUrl}/products/`);
      const data = await res.json();
      setProductsFilter(data);
    }
  };
  fetchProductsFilter();
}, [selectedCategory]);


  const fetchChartData = async (range) => {
    try {
      let url = `${apiUrl}/orders/stats/${timeRange}`;
  const params = new URLSearchParams();
  if (selectedCategory) params.append("category", selectedCategory);
  if (selectedProduct) params.append("product", selectedProduct);

  const fullUrl = params.toString() ? `${url}?${params}` : url;

  const res = await fetch(fullUrl);
  const data = await res.json();
      setChartData(data); 
      console.log(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };
  const productsToRestock = products.filter(
    (product) => product.reorderNotificationThreshold >= product.quantityOnStock
  );

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Items to restock', 14, 22);

    doc.setFontSize(12);
    
    doc.text('Product', 14, 40);
    doc.text('Quantity on stock', 60, 40);
    doc.text('Low Stock Limit', 130, 40);
    doc.text('Supplier', 180, 40);

    let yPosition = 50;
    productsToRestock.forEach((product) => {
      doc.text(product.name, 14, yPosition);
      doc.text(product.quantityOnStock.toString(), 60, yPosition);
      doc.text(product.reorderNotificationThreshold.toString(), 130, yPosition);
      doc.text(product.manufacturerName, 180, yPosition);
      yPosition += 10;
    });

    doc.save('restock.pdf');
  };

  useEffect(() => {
  fetchChartData();
}, [timeRange, selectedCategory, selectedProduct]);

  return (
    <div><AdminHeader />
    <div className="stats-container">
      
      <h2>Items to restock</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          <button onClick={generatePDF} className='generate-button'>Generate restock PDF</button>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity on stock</th>
                <th>Low Stock Limit</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {productsToRestock.length > 0 ? (
                productsToRestock.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantityOnStock}</td>
                    <td>{product.reorderNotificationThreshold}</td>
                    <td>{product.manufacturerName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No products need restocking.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

<div className="chart-container">
  <h2>Number of Orders Over Time</h2>
  <div className="chart-controls">
    <label>Select period:</label>
<select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
  <option value="week">Week</option>
  <option value="month">Month</option>
  <option value="year">Year</option>
</select>

<label>Category:</label>
  <select
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value);
      setSelectedProduct(""); 
    }}
  >
    <option value="">All</option>
    {categories.map((cat) => (
      <option key={cat.name} value={cat.name}>
        {cat.name}
      </option>
    ))}
  </select>

  <label>Product:</label>
  <select
    value={selectedProduct}
    onChange={(e) => setSelectedProduct(e.target.value)}
  >
    <option value="">All</option>
    {productsFilter.map((prod) => (
      <option key={prod.idProduct} value={prod.idProduct}>
        {prod.name}
      </option>
    ))}
</select>

  </div>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
</div>
    </div>
    </div>
  );
};

export default Stats;

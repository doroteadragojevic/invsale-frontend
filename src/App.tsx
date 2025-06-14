import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from "./components/home";
import Login from "./components/Login";
import ProductDetail from "./components/product";
import Register from "./components/Register";
import AdminPage from "./components/AdminPage"
import CreateProduct from "./components/CreateProduct";
import UpdateProduct from "./components/UpdateProduct";
import Categories from "./components/Categories";
import Units from "./components/Units";
import Stocks from "./components/Stocks";
import Manufacturers from "./components/Manufacturers";
import PriceList from "./components/PriceList";
import Cart from "./components/Cart";
import Coupons from "./components/Coupons";
import Checkout from "./components/Checkout";
import Orders from "./components/Orders";
import OrderDetails from "./components/OrderDetails";
import Review from "./components/Review";
import OrderReviews from "./components/OrderReviews";
import ForYouPage from "./components/ForyouPage";
import Stats from "./components/Stats";
import Warehouse from "./components/Warehouse";
import FAQ from "./components/FAQ";
import View from "./components/home2";

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <Routes>
      <Route path="/home" element={<View />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/fyp" element={user.isAuthenticated && user.role === 'user' ? <ForYouPage /> : <Navigate to="/login"/>}/> 
      <Route path="/" element={user.isAuthenticated && user.role === 'user' ? <Home /> : <Navigate to="/login"/>}/> 
      <Route path="/product" element={<ProductDetail /> }/> 
      <Route path="/cart" element={user.isAuthenticated && user.role === 'user' ? <Cart /> : <Navigate to="/login"/>}/> 
      <Route path="/checkout" element={user.isAuthenticated && user.role === 'user' ? <Checkout /> : <Navigate to="/login"/>}/>
      <Route path="/review" element={user.isAuthenticated && user.role === 'user' ? <Review /> : <Navigate to="/login"/>}/>


      <Route path="/orders" element={user.isAuthenticated ? <Orders /> : <Navigate to="/login"/>}/> 
      <Route path="/order/:id" element={user.isAuthenticated ? <OrderDetails /> : <Navigate to="/login"/>}/> 


      <Route
        path="/admin"
        element={user.isAuthenticated && user.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />}
      />
      <Route path="/add-product" element={user.isAuthenticated && user.role === 'admin' ? <CreateProduct /> : <Navigate to="/login"/>}/>
      <Route path="/product-admin" element={user.isAuthenticated && user.role === 'admin' ? <UpdateProduct /> : <Navigate to="/login"/>}/>
      <Route path="/categories" element={user.isAuthenticated && user.role === 'admin' ? <Categories /> : <Navigate to="/login"/>}/>
      <Route path="/units" element={user.isAuthenticated && user.role === 'admin' ? <Units /> : <Navigate to="/login"/>}/>
      <Route path="/stocks" element={user.isAuthenticated && user.role === 'admin' ? <Stocks /> : <Navigate to="/login"/>}/>
      <Route path="/manufacturers" element={user.isAuthenticated && user.role === 'admin' ? <Manufacturers /> : <Navigate to="/login"/>}/>
      <Route path="/prices" element={user.isAuthenticated && user.role === 'admin' ? <PriceList /> : <Navigate to="/login"/>}/>
      <Route path="/coupons" element={user.isAuthenticated && user.role === 'admin' ? <Coupons /> : <Navigate to="/login"/>}/>
      <Route path="/reviews" element={user.isAuthenticated && user.role === 'admin' ? <OrderReviews2 /> : <Navigate to="/login"/>}/>
      <Route path="/stats" element={user.isAuthenticated && user.role === 'admin' ? <Stats /> : <Navigate to="/login"/>}/>
      <Route path="/skladiste" element={user.isAuthenticated && user.role === 'admin' ? <Warehouse /> : <Navigate to="/login"/>}/>
      <Route path="/FAQ" element={user.isAuthenticated && user.role === 'admin' ? <FAQ /> : <Navigate to="/login"/>}/>

    </Routes>
  );
}

export default App;

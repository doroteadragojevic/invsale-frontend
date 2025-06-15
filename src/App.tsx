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
import ForYouPage from "./components/ForyouPage";
import Stats from "./components/Stats";
import Warehouse from "./components/Warehouse";
import FAQ from "./components/FAQ";
import View from "./components/home2";
import OrderReviews2 from "./components/OrderReviews2";
import { useAuth } from "./components/AuthContext";

function App() {
  const { user, isAuthenticated } = useAuth();
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/fyp" element={isAuthenticated && user.role === 'user' ? <ForYouPage /> : <Navigate to="/login"/>}/> 
      <Route path="/" element={isAuthenticated && user.role === 'user' ? <Home /> : <View/>}/> 
      <Route path="/product" element={<ProductDetail /> }/> 
      <Route path="/cart" element={isAuthenticated && user.role === 'user' ? <Cart /> : <Navigate to="/login"/>}/> 
      <Route path="/checkout" element={isAuthenticated && user.role === 'user' ? <Checkout /> : <Navigate to="/login"/>}/>
      <Route path="/review" element={isAuthenticated && user.role === 'user' ? <Review /> : <Navigate to="/login"/>}/>


      <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login"/>}/> 
      <Route path="/order/:id" element={isAuthenticated ? <OrderDetails /> : <Navigate to="/login"/>}/> 


      <Route
        path="/admin"
        element={isAuthenticated && user.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />}
      />
      <Route path="/add-product" element={isAuthenticated && user.role === 'admin' ? <CreateProduct /> : <Navigate to="/login"/>}/>
      <Route path="/product-admin" element={isAuthenticated && user.role === 'admin' ? <UpdateProduct /> : <Navigate to="/login"/>}/>
      <Route path="/categories" element={isAuthenticated && user.role === 'admin' ? <Categories /> : <Navigate to="/login"/>}/>
      <Route path="/units" element={isAuthenticated && user.role === 'admin' ? <Units /> : <Navigate to="/login"/>}/>
      <Route path="/stocks" element={isAuthenticated && user.role === 'admin' ? <Stocks /> : <Navigate to="/login"/>}/>
      <Route path="/manufacturers" element={isAuthenticated && user.role === 'admin' ? <Manufacturers /> : <Navigate to="/login"/>}/>
      <Route path="/prices" element={isAuthenticated && user.role === 'admin' ? <PriceList /> : <Navigate to="/login"/>}/>
      <Route path="/coupons" element={isAuthenticated && user.role === 'admin' ? <Coupons /> : <Navigate to="/login"/>}/>
      <Route path="/reviews" element={isAuthenticated && user.role === 'admin' ? <OrderReviews2 /> : <Navigate to="/login"/>}/>
      <Route path="/stats" element={isAuthenticated && user.role === 'admin' ? <Stats /> : <Navigate to="/login"/>}/>
      <Route path="/skladiste" element={isAuthenticated && user.role === 'admin' ? <Warehouse /> : <Navigate to="/login"/>}/>
      <Route path="/FAQ" element={isAuthenticated && user.role === 'admin' ? <FAQ /> : <Navigate to="/login"/>}/>

    </Routes>
  );
}

export default App;

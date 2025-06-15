import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/login.css'; // Nova CSS datoteka

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error('Neispravni podaci za prijavu.');
      }
  
      const data = await response.json(); 
      const token = data.token;
      const isAdmin = data.isAdmin;
    
  
      // Spremi token (u lokalnu memoriju, session, ili state management)
    localStorage.setItem('token', token);
    localStorage.setItem("user", JSON.stringify({ isAuthenticated: true, role: isAdmin ? "admin" : "user", email: email }));

    window.location.href = isAdmin ? '/#/admin' : '/#/fyp';
  } catch (error) {
    console.error('Error while logging in:', error);
    alert(error.message); 
  }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
      <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-submit">LOG IN</button>
      </form>

      <div className="register-redirect">
        <p>You don't have an account?</p>
        <button onClick={() => navigate('/register')} className="register-button-l">
          REGISTER
        </button>
      </div>
    </div>
  );
}

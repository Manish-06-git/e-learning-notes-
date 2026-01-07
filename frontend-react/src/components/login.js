import "../index.css";
import API from "../services/api";

export default function Login({ onLogin }) {

  const login = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await API.post("/login", { email, password });
    localStorage.setItem("token", res.data.token);
    onLogin();
  };

  const register = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await API.post("/register", { email, password });
    alert("Account created! Login now.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>📘 E-Learning Notes</h1>
        <p>Organize your study notes efficiently</p>

        <input id="email" placeholder="Email address" />
        <input id="password" type="password" placeholder="Password" />

        <button className="primary" onClick={login}>Login</button>
        <button className="secondary" onClick={register}>Create Account</button>
      </div>
    </div>
  );
}

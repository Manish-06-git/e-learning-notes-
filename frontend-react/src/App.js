import { useState } from "react";
import Login from "./components/login";
import Dashboard from "./pages/dashboard";
import "./index.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  return loggedIn ? <Dashboard /> : <Login onLogin={() => setLoggedIn(true)} />;
}

export default App;

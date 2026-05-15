import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/login-auth/", {
        username,
        password,
      });

      const data = res.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <h1 style={styles.logo}> Welcome back,</h1>
        <p style={styles.subtitle}>Log in to continue</p>

        <input
          style={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },

  card: {
    width: "350px",
    padding: "40px",
    borderRadius: "12px",
    background: "#111827",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    textAlign: "center",
  },

  logo: {
    color: "#fff",
    fontSize: "24px",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: "14px",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #374151",
    background: "#020617",
    color: "white",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#6366f1",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default Login;
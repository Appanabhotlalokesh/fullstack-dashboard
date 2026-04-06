import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    API.get("/admin/users/")
      .then((res) => setUsers(res.data))
      .catch(() => alert("Failed to fetch users"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>⚡ Admin</h2>

        {/* Admin Info */}
        <div style={styles.profileBox}>
          <p style={styles.name}>{admin?.username}</p>
          <p style={styles.small}>{admin?.email}</p>
          <p style={styles.small}>{admin?.number}</p>
          <p style={styles.small}>{admin?.address}</p>

          {/* Logout */}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <div style={styles.grid}>
          {users.map((u) =>
            u.role !== "admin" ? (
              <div key={u.id} style={styles.card}>
                <h3>{u.username}</h3>
                <p>📧 {u.email}</p>
                <p>📱 {u.number}</p>
                <p>📍 {u.address}</p>
                <span style={styles.role}>{u.role}</span>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "#fff",
  },

  sidebar: {
    width: "250px",
    background: "#1e293b",
    padding: "20px",
  },

  logo: {
    marginBottom: "15px",
  },

  profileBox: {
    background: "#0f172a",
    padding: "15px",
    borderRadius: "10px",
  },

  name: {
    fontWeight: "bold",
    marginBottom: "5px",
  },

  small: {
    fontSize: "12px",
    color: "#cbd5f5",
  },

  logoutBtn: {
    marginTop: "15px",
    padding: "10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },

  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },

  title: {
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },

  role: {
    display: "inline-block",
    marginTop: "10px",
    padding: "5px 10px",
    background: "#6366f1",
    borderRadius: "5px",
    fontSize: "12px",
  },
};

export default AdminDashboard;
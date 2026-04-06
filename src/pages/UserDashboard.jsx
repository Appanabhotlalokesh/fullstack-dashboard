import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>👤 User Panel</h2>

        <div style={styles.profileBox}>
          <p style={styles.name}>{user?.username}</p>
          <p style={styles.small}>{user?.email}</p>
          <p style={styles.small}>{user?.number}</p>
          <p style={styles.small}>{user?.address}</p>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <h1 style={styles.title}>Welcome, {user?.username} 👋</h1>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Details</h3>

          <div style={styles.infoRow}>
            <span>Email:</span>
            <span>{user?.email}</span>
          </div>

          <div style={styles.infoRow}>
            <span>Phone:</span>
            <span>{user?.number}</span>
          </div>

          <div style={styles.infoRow}>
            <span>Address:</span>
            <span>{user?.address}</span>
          </div>
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
    boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
  },

  logo: {
    marginBottom: "20px",
  },

  profileBox: {
    background: "#0f172a",
    padding: "15px",
    borderRadius: "10px",
  },

  name: {
    fontWeight: "bold",
    marginBottom: "8px",
  },

  small: {
    fontSize: "12px",
    color: "#cbd5f5",
    marginBottom: "4px",
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
    transition: "0.3s",
  },

  main: {
    flex: 1,
    padding: "40px",
  },

  title: {
    marginBottom: "25px",
  },

  card: {
    background: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
  },

  cardTitle: {
    marginBottom: "15px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "14px",
    color: "#e2e8f0",
  },
};

export default UserDashboard;
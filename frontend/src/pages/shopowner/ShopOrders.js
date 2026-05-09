import React, { useEffect, useState } from "react";
import api from "../../api/api";
import PopupMessage from "../../components/common/PopupMessage";


function ShopOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/shopowner/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Orders error:", error);
      showPopup("error", "Load Failed", "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/shopowner/orders/${id}/status`, {
        status,
      });

      setOrders(
        orders.map((order) => (order.id === id ? res.data.order : order))
      );
    } catch (error) {
      console.error("Update order status error:", error);
      showPopup("error", "Update Failed", "Failed to update order status.");
    }
  };

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  if (loading) {
    return <p style={styles.loading}>Loading orders...</p>;
  }

  return (
    <div>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />
      <h1 style={styles.title}>Orders</h1>
      <p style={styles.desc}>View customer orders and update their status.</p>

      <div style={styles.tableBox}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={styles.td}>#{order.id}</td>
                <td style={styles.td}>{order.customer_name}</td>
                <td style={styles.td}>{order.product_name}</td>
                <td style={styles.td}>{order.quantity}</td>
                <td style={styles.td}>${order.total}</td>
                <td style={styles.td}>{order.order_date}</td>
                <td style={styles.td}>
                  <span style={getStatusStyle(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div style={styles.empty}>
            <h3>No orders yet</h3>
            <p>Customer orders will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusStyle = (status) => ({
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "800",
  backgroundColor:
    status === "Completed"
      ? "#dcfce7"
      : status === "Pending"
      ? "#fef9c3"
      : status === "Cancelled"
      ? "#fee2e2"
      : "#dbeafe",
  color:
    status === "Completed"
      ? "#166534"
      : status === "Pending"
      ? "#854d0e"
      : status === "Cancelled"
      ? "#991b1b"
      : "#1d4ed8",
});

const styles = {
  loading: {
    fontSize: "18px",
    fontWeight: "600",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
    marginBottom: "24px",
  },
  tableBox: {
    backgroundColor: "white",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "15px",
    backgroundColor: "#111827",
    color: "white",
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
  },
  select: {
    padding: "9px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
  },
};

export default ShopOrders;
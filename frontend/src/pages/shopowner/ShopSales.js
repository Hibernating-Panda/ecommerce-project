import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";

function ShopSales() {
  const [filter, setFilter] = useState("month");
  const [loading, setLoading] = useState(true);

  const [sales, setSales] = useState({
    total_sales: 0,
    total_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    best_selling_product: null,
    orders: [],
  });

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/shopowner/sales?filter=${filter}`);
        setSales(res.data);
      } catch (error) {
        console.error("Sales error:", error);
        setPopup({
          show: true,
          type: "error",
          title: "Load Failed",
          message: "Failed to load sales report.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [filter]);

  return (
    <div>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() =>
          setPopup({
            show: false,
            type: "success",
            title: "",
            message: "",
          })
        }
      />

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sales Report</h1>
          <p style={styles.desc}>
            View total sales, best-selling products, and order performance.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading sales report...</p>
      ) : (
        <>
          <div style={styles.cards}>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Sales</p>
              <h2 style={styles.cardValue}>${sales.total_sales}</h2>
            </div>

            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Orders</p>
              <h2 style={styles.cardValue}>{sales.total_orders}</h2>
            </div>

            <div style={styles.card}>
              <p style={styles.cardLabel}>Completed Orders</p>
              <h2 style={styles.cardValue}>{sales.completed_orders}</h2>
            </div>

            <div style={styles.card}>
              <p style={styles.cardLabel}>Cancelled Orders</p>
              <h2 style={styles.cardValue}>{sales.cancelled_orders}</h2>
            </div>
          </div>

          <div style={styles.bestBox}>
            <h2 style={styles.sectionTitle}>Best-Selling Product</h2>

            {sales.best_selling_product ? (
              <div style={styles.bestContent}>
                <h3 style={styles.bestName}>
                  {sales.best_selling_product.product_name}
                </h3>
                <p style={styles.bestText}>
                  Quantity Sold:{" "}
                  <strong>{sales.best_selling_product.quantity_sold}</strong>
                </p>
                <p style={styles.bestText}>
                  Total Sales:{" "}
                  <strong>${sales.best_selling_product.total_sales}</strong>
                </p>
              </div>
            ) : (
              <p style={styles.emptyText}>No completed sales yet.</p>
            )}
          </div>

          <div style={styles.tableBox}>
            <h2 style={styles.sectionTitle}>Sales Orders</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Time</th>
                </tr>
              </thead>

              <tbody>
                {sales.orders.map((order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>#{order.id}</td>
                    <td style={styles.td}>{order.customer_name}</td>
                    <td style={styles.td}>{order.product_name}</td>
                    <td style={styles.td}>{order.quantity}</td>
                    <td style={styles.td}>${order.total}</td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sales.orders.length === 0 && (
              <p style={styles.emptyText}>No sales data for this period.</p>
            )}
          </div>
        </>
      )}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
  },
  filterSelect: {
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    fontWeight: "700",
  },
  loading: {
    fontSize: "18px",
    fontWeight: "700",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontWeight: "800",
  },
  cardValue: {
    margin: "12px 0 0",
    fontSize: "34px",
    color: "#111827",
  },
  bestBox: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  sectionTitle: {
    marginTop: 0,
    color: "#111827",
  },
  bestContent: {
    backgroundColor: "#f9fafb",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },
  bestName: {
    marginTop: 0,
    fontSize: "24px",
    color: "#111827",
  },
  bestText: {
    color: "#374151",
  },
  tableBox: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    backgroundColor: "#111827",
    color: "white",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    padding: "18px",
  },
};

export default ShopSales;
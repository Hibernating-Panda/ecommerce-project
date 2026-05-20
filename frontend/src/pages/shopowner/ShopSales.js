import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import { roleThemes } from "../../theme/roleThemes";

function ShopSales() {
  const theme = roleThemes.shop_owner;

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
    fetchSales();
  }, [filter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
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

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  return (
    <div style={styles.page}>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />

      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Shop Owner</p>
          <h1 style={styles.title}>Sales Report</h1>
          <p style={styles.desc}>
            View total sales, best-selling products, and order performance.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ ...styles.filterSelect, borderColor: theme.border }}
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
            <StatCard title="Total Sales" value={`$${money(sales.total_sales)}`} theme={theme} />
            <StatCard title="Total Orders" value={sales.total_orders} theme={theme} />
            <StatCard title="Completed Orders" value={sales.completed_orders} theme={theme} />
            <StatCard title="Cancelled Orders" value={sales.cancelled_orders} theme={theme} />
          </div>

          <section style={styles.bestBox}>
            <h2 style={styles.sectionTitle}>Best-Selling Product</h2>

            {sales.best_selling_product ? (
              <div style={{ ...styles.bestContent, borderColor: theme.border }}>
                <h3 style={styles.bestName}>
                  {sales.best_selling_product.product_name || "Product"}
                </h3>
                <p style={styles.bestText}>
                  Quantity Sold:{" "}
                  <strong>{sales.best_selling_product.quantity_sold}</strong>
                </p>
                <p style={styles.bestText}>
                  Total Sales:{" "}
                  <strong>${money(sales.best_selling_product.total_sales)}</strong>
                </p>
              </div>
            ) : (
              <p style={styles.emptyText}>No completed sales yet.</p>
            )}
          </section>

          <section style={styles.tableBox}>
            <h2 style={styles.sectionTitle}>Sales Orders</h2>

            <div style={styles.tableWrap}>
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
                  {(sales.orders || []).map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>#{item.order_id || item.order?.id}</td>
                      <td style={styles.td}>
                        {item.order?.customer?.name ||
                          item.order?.customer_name ||
                          "Customer"}
                      </td>
                      <td style={styles.td}>{item.product?.name || "Product"}</td>
                      <td style={styles.td}>{item.quantity}</td>
                      <td style={styles.td}>${money(item.total)}</td>
                      <td style={styles.td}>
                        <span style={getStatusStyle(item.status)}>
                          {formatStatus(item.status)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(sales.orders || []).length === 0 && (
              <p style={styles.emptyText}>No sales data for this period.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, theme }) {
  return (
    <div style={{ ...styles.card, borderColor: theme.border }}>
      <p style={styles.cardLabel}>{title}</p>
      <h2 style={{ ...styles.cardValue, color: theme.primaryDark }}>{value}</h2>
    </div>
  );
}

const money = (value) => Number(value || 0).toFixed(2);

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusStyle = (status) => {
  const map = {
    ready: ["#dcfce7", "#166534"],
    accepted: ["#dbeafe", "#1d4ed8"],
    pending: ["#fef9c3", "#854d0e"],
    rejected: ["#fee2e2", "#991b1b"],
  };

  const [bg, color] = map[status] || ["#e5e7eb", "#374151"];

  return {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
    backgroundColor: bg,
    color,
    whiteSpace: "nowrap",
  };
};

const styles = {
  page: {
    width: "100%",
    maxWidth: "1440px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
    marginTop: "8px",
  },
  filterSelect: {
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    fontWeight: "800",
  },
  loading: {
    fontSize: "18px",
    fontWeight: "700",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontWeight: "800",
  },
  cardValue: {
    margin: "12px 0 0",
    fontSize: "clamp(28px, 4vw, 36px)",
  },
  bestBox: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
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
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    backgroundColor: "#1e40af",
    color: "white",
    whiteSpace: "nowrap",
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
    fontWeight: "700",
  },
};

export default ShopSales;
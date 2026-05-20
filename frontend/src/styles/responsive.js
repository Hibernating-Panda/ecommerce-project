export const responsive = {
  page: {
    minHeight: "100vh",
    width: "100%",
  },
  container: {
    width: "100%",
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "clamp(16px, 2vw, 32px)",
    boxSizing: "border-box",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "clamp(14px, 2vw, 22px)",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "clamp(18px, 2vw, 26px)",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
};
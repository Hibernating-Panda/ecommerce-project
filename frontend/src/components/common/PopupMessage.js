import React from "react";

function PopupMessage({ show, type = "success", title, message, onClose }) {
  if (!show) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarning = type === "warning";

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div
          style={{
            ...styles.icon,
            backgroundColor: isSuccess
              ? "#dcfce7"
              : isError
              ? "#fee2e2"
              : "#fef9c3",
            color: isSuccess ? "#166534" : isError ? "#991b1b" : "#854d0e",
          }}
        >
          {isSuccess ? "✓" : isError ? "!" : "?"}
        </div>

        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>

        <button onClick={onClose} style={styles.button}>
          OK
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  popup: {
    width: "360px",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  },
  icon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "900",
  },
  title: {
    margin: 0,
    color: "#111827",
  },
  message: {
    color: "#6b7280",
    lineHeight: "1.5",
    whiteSpace: "pre-line",
  },
  button: {
    marginTop: "16px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#111827",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default PopupMessage;
import React from "react";

function ConfirmPopup({
  show,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div style={styles.icon}>?</div>

        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.cancelBtn}>
            {cancelText}
          </button>

          <button onClick={onConfirm} style={styles.confirmBtn}>
            {confirmText}
          </button>
        </div>
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
    width: "380px",
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
    backgroundColor: "#fef9c3",
    color: "#854d0e",
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
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "22px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    fontWeight: "800",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#dc2626",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default ConfirmPopup;
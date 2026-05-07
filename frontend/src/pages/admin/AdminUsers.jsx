import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    user: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    account_status: "active",
  });

  const roleLabels = {
    user: "Customer",
    shop_owner: "Shop Owner",
    delivery_man: "Delivery Man",
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      account_status: "active",
    });
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createUser = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.post("/admin/users", formData);

      setMessage("User created successfully.");
      resetForm();
      fetchUsers();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      account_status: user.account_status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateUser = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await api.put(`/admin/users/${editingUser.id}`, payload);

      setMessage("User updated successfully.");
      resetForm();
      fetchUsers();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteModal({
      open: true,
      user,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      user: null,
    });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {
      setMessage("");
      setError("");

      await api.delete(`/admin/users/${deleteModal.user.id}`);

      setMessage("User deleted successfully.");
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const approveUser = async (id) => {
    try {
      setMessage("");
      setError("");

      await api.patch(`/admin/users/${id}/approve`);

      setMessage("User approved successfully.");
      fetchUsers();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to approve user.");
    }
  };

  const rejectUser = async (id) => {
    try {
      setMessage("");
      setError("");

      await api.patch(`/admin/users/${id}/reject`);

      setMessage("User rejected successfully.");
      fetchUsers();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to reject user.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Users</h1>
          <p style={styles.subtitle}>
            Create, edit, and manage customers, shop owners, and delivery men.
          </p>
        </div>

        <button onClick={fetchUsers} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>
            {editingUser ? "Edit User" : "Create New User"}
          </h2>

          {editingUser && (
            <button onClick={resetForm} style={styles.cancelButton}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={editingUser ? updateUser : createUser}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Password {editingUser && <span style={styles.hint}>(leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                name="password"
                placeholder={editingUser ? "New password optional" : "Enter password"}
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required={!editingUser}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="user">Customer</option>
                <option value="shop_owner">Shop Owner</option>
                <option value="delivery_man">Delivery Man</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Account Status</label>
              <select
                name="account_status"
                value={formData.account_status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving} style={styles.submitButton}>
            {saving
              ? "Saving..."
              : editingUser
              ? "Update User"
              : "Create User"}
          </button>
        </form>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>User List</h2>
            <p style={styles.tableSubtitle}>
              Admin accounts are hidden for safety.
            </p>
          </div>

          <span style={styles.countBadge}>{users.length} users</span>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyBox}>No users found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>#{user.id}</td>

                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>

                    <td style={styles.td}>{user.email}</td>

                    <td style={styles.td}>
                      <span style={getRoleBadgeStyle(user.role)}>
                        {roleLabels[user.role] || user.role}
                      </span>
                      <span style={getStatusBadgeStyle(user.account_status)}>
                        {user.account_status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          onClick={() => startEdit(user)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => openDeleteModal(user)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>

                        {user.account_status === "pending" && (
                        <>
                          <button
                            onClick={() => approveUser(user.id)}
                            style={styles.approveButton}
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => rejectUser(user.id)}
                            style={styles.rejectButton}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>⚠️</div>

            <h2 style={styles.modalTitle}>Delete User?</h2>

            <p style={styles.modalText}>
              Are you sure you want to delete{" "}
              <strong>{deleteModal.user?.name}</strong>?
            </p>

            <p style={styles.modalWarning}>
              This action cannot be undone.
            </p>

            <div style={styles.modalActions}>
              <button onClick={closeDeleteModal} style={styles.modalCancelButton}>
                Cancel
              </button>

              <button onClick={confirmDeleteUser} style={styles.modalDeleteButton}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getRoleBadgeStyle = (role) => {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  };

  if (role === "shop_owner") {
    return {
      ...base,
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  }

  if (role === "delivery_man") {
    return {
      ...base,
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    };
  }

  return {
    ...base,
    backgroundColor: "#dcfce7",
    color: "#166534",
  };
};

const getStatusBadgeStyle = (status) => {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  };

  if (status === "pending") {
    return {
      ...base,
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "rejected") {
    return {
      ...base,
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    ...base,
    backgroundColor: "#dcfce7",
    color: "#166534",
  };
};

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
  },

  refreshButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
    marginBottom: "24px",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "12px",
    flexWrap: "wrap",
  },

  formTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cancelButton: {
    padding: "9px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },

  hint: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
  },

  input: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },

  submitButton: {
    padding: "11px 18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },

  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "12px",
    flexWrap: "wrap",
  },

  tableTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  tableSubtitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  countBadge: {
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
  },

  loadingBox: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
  },

  emptyBox: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontSize: "13px",
    borderBottom: "1px solid #e5e7eb",
  },

  tr: {
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "14px",
    color: "#374151",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  actionGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    padding: "20px",
  },

  modalCard: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
  },

  modalIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    margin: "0 auto 16px auto",
  },

  modalTitle: {
    margin: "0 0 10px 0",
    color: "#111827",
    fontSize: "24px",
  },

  modalText: {
    margin: "0 0 8px 0",
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  modalWarning: {
    margin: "0 0 22px 0",
    color: "#991b1b",
    fontSize: "14px",
    fontWeight: "700",
  },

  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },

  modalCancelButton: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "800",
  },

  modalDeleteButton: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },

  approveButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  rejectButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#f97316",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },
};
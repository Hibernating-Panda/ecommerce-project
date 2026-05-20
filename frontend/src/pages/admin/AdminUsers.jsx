import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { roleThemes } from "../../theme/roleThemes";

export default function AdminUsers() {
  const theme = roleThemes.admin;

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    account_status: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    user: null,
  });

  const roleLabels = {
    user: "Customer",
    shop_owner: "Shop Owner",
    delivery_man: "Delivery Man",
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users", {
        params: {
          search: filters.search || undefined,
          role: filters.role || undefined,
          account_status: filters.account_status || undefined,
        },
      });

      setUsers(Array.isArray(response.data) ? response.data : response.data.data || []);
      setMeta(response.data?.meta || response.data || null);
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      role: "",
      account_status: "",
    });
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Admin</p>
          <h1 style={styles.title}>Users</h1>
          <p style={styles.subtitle}>
            Search, filter, approve, reject, and remove users.
          </p>
        </div>

        <button onClick={fetchUsers} style={{ ...styles.refreshButton, backgroundColor: theme.primary }}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.filterCard}>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search name, email, or phone..."
          style={styles.input}
        />

        <select name="role" value={filters.role} onChange={handleFilterChange} style={styles.input}>
          <option value="">All Roles</option>
          <option value="user">Customer</option>
          <option value="shop_owner">Shop Owner</option>
          <option value="delivery_man">Delivery Man</option>
        </select>

        <select
          name="account_status"
          value={filters.account_status}
          onChange={handleFilterChange}
          style={styles.input}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <button onClick={fetchUsers} style={{ ...styles.searchButton, backgroundColor: theme.primary }}>
          Search
        </button>

        <button onClick={clearFilters} style={styles.clearButton}>
          Clear
        </button>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>User List</h2>
            <p style={styles.tableSubtitle}>Admin accounts are hidden for safety.</p>
          </div>

          <span style={{ ...styles.countBadge, backgroundColor: theme.primaryLight, color: theme.primaryDark }}>
            {meta?.total || users.length} users
          </span>
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
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={styles.td}>#{user.id}</td>

                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={{ ...styles.avatar, backgroundColor: theme.primary }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>

                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.phone || "N/A"}</td>

                    <td style={styles.td}>
                      <span style={getRoleBadgeStyle(user.role)}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={getStatusBadgeStyle(user.account_status)}>
                        {user.account_status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        {user.account_status === "pending" && (
                          <>
                            <button onClick={() => approveUser(user.id)} style={styles.approveButton}>
                              Approve
                            </button>

                            <button onClick={() => rejectUser(user.id)} style={styles.rejectButton}>
                              Reject
                            </button>
                          </>
                        )}

                        <button onClick={() => openDeleteModal(user)} style={styles.deleteButton}>
                          Delete
                        </button>
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
              Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>?
            </p>
            <p style={styles.modalWarning}>This action cannot be undone.</p>

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
    fontWeight: "800",
    whiteSpace: "nowrap",
  };

  if (role === "shop_owner") return { ...base, backgroundColor: "#dbeafe", color: "#1e40af" };
  if (role === "delivery_man") return { ...base, backgroundColor: "#fef3c7", color: "#92400e" };

  return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
};

const getStatusBadgeStyle = (status) => {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  };

  if (status === "pending") return { ...base, backgroundColor: "#fef3c7", color: "#92400e" };
  if (status === "rejected") return { ...base, backgroundColor: "#fee2e2", color: "#991b1b" };

  return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
};

const styles = {
  page: {
    padding: "clamp(16px, 2.5vw, 28px)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "12px",
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
  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  refreshButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
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
  filterCard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
    border: "1px solid #eef1f6",
    marginBottom: "20px",
  },
  input: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  searchButton: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "none",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
  },
  clearButton: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    color: "#374151",
    fontWeight: "800",
    cursor: "pointer",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
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
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  countBadge: {
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
    minWidth: "900px",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontSize: "13px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px",
    color: "#374151",
    fontSize: "14px",
    borderBottom: "1px solid #e5e7eb",
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
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
  },
  actionGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  deleteButton: {
    padding: "8px 12px",
    borderRadius: "8px",
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
    fontWeight: "800",
  },
  rejectButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#f97316",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
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
    margin: "0 auto 16px",
  },
  modalTitle: {
    margin: "0 0 10px",
    color: "#111827",
    fontSize: "24px",
  },
  modalText: {
    margin: "0 0 8px",
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  modalWarning: {
    margin: "0 0 22px",
    color: "#991b1b",
    fontSize: "14px",
    fontWeight: "800",
  },
  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
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
};
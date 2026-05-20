export const roleThemes = {
  admin: {
    name: "Admin",
    primary: "#dc2626",
    primaryDark: "#991b1b",
    primaryLight: "#fee2e2",
    bg: "#fff5f5",
    border: "#fecaca",
  },
  customer: {
    name: "Customer",
    primary: "#16a34a",
    primaryDark: "#166534",
    primaryLight: "#dcfce7",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  delivery_man: {
    name: "Delivery",
    primary: "#ca8a04",
    primaryDark: "#854d0e",
    primaryLight: "#fef9c3",
    bg: "#fefce8",
    border: "#fde68a",
  },
  shop_owner: {
    name: "Shop Owner",
    primary: "#2563eb",
    primaryDark: "#1e40af",
    primaryLight: "#dbeafe",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
};

export const getRoleTheme = (role) => {
  return roleThemes[role] || roleThemes.customer;
};
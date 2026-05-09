import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

function DeliveryProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    vehicle_type: "",
    plate_number: "",
    status: "online",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/delivery/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.data || data);
      }
    } catch (error) {
      console.error("FETCH DELIVERY PROFILE ERROR:", error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/delivery/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setMessage("Profile updated successfully.");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      console.error("UPDATE DELIVERY PROFILE ERROR:", error);
      setMessage("Something went wrong.");
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={styles.box}>
      <h2 style={styles.heading}>Delivery Profile</h2>

      {message && <div style={styles.message}>{message}</div>}

      <form onSubmit={updateProfile} style={styles.form}>
        <div style={styles.group}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            placeholder="Delivery name"
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Phone</label>
          <input
            style={styles.input}
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            placeholder="Phone number"
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Vehicle Type</label>
          <select
            style={styles.input}
            name="vehicle_type"
            value={profile.vehicle_type || ""}
            onChange={handleChange}
          >
            <option value="">Select vehicle</option>
            <option value="motorbike">Motorbike</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Plate Number</label>
          <input
            style={styles.input}
            name="plate_number"
            value={profile.plate_number || ""}
            onChange={handleChange}
            placeholder="Example: 2AB-1234"
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.input}
            name="status"
            value={profile.status || "online"}
            onChange={handleChange}
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="busy">Busy</option>
          </select>
        </div>

        <button style={styles.button} type="submit">
          Save Profile
        </button>
      </form>
    </div>
  );
}

const styles = {
  box: {
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    maxWidth: 720,
  },
  heading: {
    margin: "0 0 18px",
    color: "#111827",
  },
  message: {
    background: "#dcfce7",
    color: "#15803d",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },
  input: {
    padding: "11px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
  },
  button: {
    gridColumn: "1 / -1",
    background: "#E8192C",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    marginTop: 8,
  },
};

export default DeliveryProfile;
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

const markerIcon = L.divIcon({
  html: "📍",
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  if (!position) return null;

  return <Marker position={[position.lat, position.lng]} icon={markerIcon} />;
}

function MapPickerModal({
  open,
  onClose,
  onSelect,
  initialLat,
  initialLng,
}) {
  const defaultPosition = {
    lat: 11.5564,
    lng: 104.9282,
  };

  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (initialLat && initialLng) {
      setPosition({
        lat: Number(initialLat),
        lng: Number(initialLng),
      });
    } else {
      setPosition(defaultPosition);
    }
  }, [open, initialLat, initialLng]);

  if (!open) return null;

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      },
      () => {
        alert("Failed to get your current location.");
      }
    );
  };

  const handleSelect = () => {
    if (!position) return;

    onSelect({
      latitude: position.lat,
      longitude: position.lng,
    });

    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Pick Location</h2>
            <p style={styles.subtitle}>
              Click on the map to choose your location.
            </p>
          </div>

          <button type="button" style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.mapBox}>
          <MapContainer
            center={[position?.lat || defaultPosition.lat, position?.lng || defaultPosition.lng]}
            zoom={14}
            style={styles.map}
            key={`${position?.lat || defaultPosition.lat}-${position?.lng || defaultPosition.lng}`}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div style={styles.coordinateBox}>
          <div>
            <strong>Latitude:</strong>{" "}
            {position ? position.lat.toFixed(8) : "Not selected"}
          </div>

          <div>
            <strong>Longitude:</strong>{" "}
            {position ? position.lng.toFixed(8) : "Not selected"}
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.secondaryButton} onClick={handleUseMyLocation}>
            Use My Current Location
          </button>

          <button type="button" style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>

          <button type="button" style={styles.selectButton} onClick={handleSelect}>
            Select Location
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
    background: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  modal: {
    width: "100%",
    maxWidth: 850,
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },

  title: {
    margin: 0,
    color: "#111827",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 30,
    cursor: "pointer",
    lineHeight: 1,
  },

  mapBox: {
    height: 430,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  coordinateBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 14,
    color: "#374151",
    fontSize: 14,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  },

  secondaryButton: {
    background: "#fef9c3",
    color: "#854d0e",
    border: "none",
    padding: "11px 15px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },

  cancelButton: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "11px 15px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },

  selectButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "11px 15px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default MapPickerModal;
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DeliveryMap = ({ 
  driverLocation = null,
  pickupLocation = null,
  deliveryLocation = null,
  routeHistory = []
}) => {
  // Default to New York coordinates
  const defaultLat = 40.7128;
  const defaultLng = -74.0060;
  const defaultZoom = 12;

  // Calculate center based on available locations
  const getCenter = () => {
    if (driverLocation) {
      return [driverLocation.latitude, driverLocation.longitude];
    }
    if (deliveryLocation) {
      return [deliveryLocation.latitude, deliveryLocation.longitude];
    }
    return [defaultLat, defaultLng];
  };

  // Prepare route polyline data
  const getRouteCoordinates = () => {
    const coords = [];
    
    if (pickupLocation) {
      coords.push([pickupLocation.latitude, pickupLocation.longitude]);
    }
    
    if (routeHistory && routeHistory.length > 0) {
      routeHistory.forEach(point => {
        coords.push([point.latitude, point.longitude]);
      });
    }
    
    if (driverLocation) {
      coords.push([driverLocation.latitude, driverLocation.longitude]);
    }
    
    return coords;
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={getCenter()}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Map Tiles - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {getRouteCoordinates().length > 1 && (
          <Polyline
            positions={getRouteCoordinates()}
            color="#3B82F6"
            weight={3}
            opacity={0.8}
            dashArray="5, 5"
          />
        )}

        {/* Pickup Location Marker */}
        {pickupLocation && (
          <Marker
            position={[pickupLocation.latitude, pickupLocation.longitude]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Pickup Location</p>
                <p className="text-gray-600">{pickupLocation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery Location Marker */}
        {deliveryLocation && (
          <Marker
            position={[deliveryLocation.latitude, deliveryLocation.longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Delivery Location</p>
                <p className="text-gray-600">{deliveryLocation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Current Location */}
        {driverLocation && (
          <Marker
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Driver Location</p>
                <p className="text-gray-600">Current Position</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(driverLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;

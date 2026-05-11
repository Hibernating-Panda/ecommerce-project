import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeliveryMap from '../../components/Map/DeliveryMap';
import { MapPin, Navigation, Clock, Truck } from 'lucide-react';

const TrackingPage = ({ deliveryId }) => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeliveryData();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchDeliveryData, 10000);
    
    return () => clearInterval(interval);
  }, [deliveryId]);

  const fetchDeliveryData = async () => {
    try {
      const response = await axios.get(`/api/customer/orders/${deliveryId}/track`);
      setDelivery(response.data);
    } catch (err) {
      setError('Failed to load delivery tracking data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const { delivery: deliveryData } = delivery;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'picked_up':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting for driver assignment';
      case 'picked_up':
        return 'Package picked up from store';
      case 'in_transit':
        return 'On the way to your location';
      case 'delivered':
        return 'Successfully delivered';
      case 'cancelled':
        return 'Delivery cancelled';
      default:
        return 'Status unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Delivery</h1>
          <p className="text-gray-600">Order #{delivery.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 card h-96">
            <DeliveryMap
              driverLocation={deliveryData.latestLocation ? {
                latitude: deliveryData.current_lat,
                longitude: deliveryData.current_lng,
                address: 'Current Location',
                timestamp: new Date()
              } : null}
              pickupLocation={{
                latitude: deliveryData.pickup_lat,
                longitude: deliveryData.pickup_lng,
                address: deliveryData.pickup_location
              }}
              deliveryLocation={{
                latitude: deliveryData.delivery_lat,
                longitude: deliveryData.delivery_lng,
                address: deliveryData.delivery_location
              }}
              routeHistory={deliveryData.locations || []}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Status</h3>
              <div className={`px-4 py-3 rounded-lg ${getStatusColor(deliveryData.status)}`}>
                <p className="font-medium capitalize">{deliveryData.status.replace('_', ' ')}</p>
                <p className="text-sm mt-1">{getStatusMessage(deliveryData.status)}</p>
              </div>
            </div>

            {/* Driver Info */}
            {deliveryData.driver && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Driver Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Driver Name</p>
                    <p className="font-medium">{deliveryData.driver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{deliveryData.driver.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            {deliveryData.estimated_time && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Estimated Time
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {deliveryData.estimated_time} min
                </p>
              </div>
            )}

            {/* Locations */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Locations</h3>
              
              {/* Pickup */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Pickup
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {deliveryData.pickup_location}
                </p>
              </div>

              {/* Delivery */}
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Navigation className="w-4 h-4 text-red-600" />
                  Destination
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {deliveryData.delivery_location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Timeline</h3>
          <div className="space-y-4">
            {/* Started */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <div className="w-1 bg-gray-300 flex-grow" style={{ minHeight: '30px' }}></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Started</p>
                <p className="text-sm text-gray-600">
                  {deliveryData.started_at ? new Date(deliveryData.started_at).toLocaleString() : 'Pending'}
                </p>
              </div>
            </div>

            {/* Picked Up */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 ${deliveryData.picked_up_at ? 'bg-blue-600' : 'bg-gray-300'} rounded-full`}></div>
                <div className="w-1 bg-gray-300 flex-grow" style={{ minHeight: '30px' }}></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Picked Up</p>
                <p className="text-sm text-gray-600">
                  {deliveryData.picked_up_at ? new Date(deliveryData.picked_up_at).toLocaleString() : 'Pending'}
                </p>
              </div>
            </div>

            {/* Delivered */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 ${deliveryData.completed_at ? 'bg-green-600' : 'bg-gray-300'} rounded-full`}></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Delivered</p>
                <p className="text-sm text-gray-600">
                  {deliveryData.completed_at ? new Date(deliveryData.completed_at).toLocaleString() : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;

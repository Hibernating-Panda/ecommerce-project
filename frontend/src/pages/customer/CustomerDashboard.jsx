import React from "react";
import Layout from "../../components/Layout/Layout";
import { Package, MapPin, Clock } from "lucide-react";

const CustomerDashboard = () => {
  const orders = [
    {
      id: 1,
      order: "ORD-1001",
      status: "in_transit",
      total: 45.99,
      date: "2024-05-10",
    },
    {
      id: 2,
      order: "ORD-1000",
      status: "delivered",
      total: 32.5,
      date: "2024-05-09",
    },
    {
      id: 3,
      order: "ORD-0999",
      status: "pending",
      total: 67.45,
      date: "2024-05-08",
    },
  ];

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="My Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Package}
          title="Total Orders"
          value="12"
          color="bg-blue-100"
        />
        <StatCard
          icon={MapPin}
          title="In Transit"
          value="1"
          color="bg-yellow-100"
        />
        <StatCard
          icon={Clock}
          title="Delivered"
          value="11"
          color="bg-green-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <Package className="w-8 h-8 text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">Place New Order</p>
          <p className="text-sm text-gray-600">Start a new delivery</p>
        </button>
        <button className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <MapPin className="w-8 h-8 text-green-600 mb-2" />
          <p className="font-semibold text-gray-900">Track Orders</p>
          <p className="text-sm text-gray-600">View order status</p>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Orders
        </h3>
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{order.order}</p>
                <p className="text-sm text-gray-500">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${order.total}</p>
                <span
                  className={`badge text-xs ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "in_transit"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;

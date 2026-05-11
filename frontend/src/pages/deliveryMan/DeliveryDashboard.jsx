import React from 'react';
import Layout from '../../components/Layout/Layout';
import { Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DeliveryDashboard = () => {
  const deliveries = [
    { id: 1, order: 'ORD-001', status: 'in_progress', customer: 'John Doe', location: 'Downtown' },
    { id: 2, order: 'ORD-002', status: 'completed', customer: 'Jane Smith', location: 'Uptown' },
    { id: 3, order: 'ORD-003', status: 'pending', customer: 'Bob Johnson', location: 'Midtown' },
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
    <Layout title="Delivery Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Truck} title="Active Deliveries" value="5" color="bg-blue-100" />
        <StatCard icon={Clock} title="Pending" value="3" color="bg-yellow-100" />
        <StatCard icon={CheckCircle} title="Completed Today" value="12" color="bg-green-100" />
        <StatCard icon={AlertCircle} title="Issues" value="1" color="bg-red-100" />
      </div>

      {/* Recent Deliveries */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{delivery.order}</td>
                  <td className="py-3 px-4">{delivery.customer}</td>
                  <td className="py-3 px-4">{delivery.location}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      delivery.status === 'completed' ? 'bg-green-100 text-green-700' :
                      delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryDashboard;

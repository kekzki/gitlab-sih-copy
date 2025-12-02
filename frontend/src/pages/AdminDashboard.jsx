import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-[rgb(45,106,106)] mb-4">
            Administrator Dashboard
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Welcome, Administrator! This is your dashboard.
          </p>

          {/* Placeholder sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                User Management
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                System Analytics
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Data Audit Logs
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Settings
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

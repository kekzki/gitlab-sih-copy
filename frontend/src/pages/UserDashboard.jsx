import React from "react";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-[rgb(45,106,106)] mb-4">
            My Dashboard
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Welcome, General User! Here you can browse and explore marine
            research data.
          </p>

          {/* Placeholder sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                My Favorites
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Recent Searches
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Saved Collections
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Profile Settings
              </h2>
              <p className="text-gray-600">Under development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

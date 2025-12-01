import React from "react";

const Settings = () => {
  return (
    <div className="min-h-screen p-10 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Account Settings
      </h1>
      <p className="text-xl text-gray-600">
        Feature Under Development: This is where you would update your name,
        phone number, and password.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        This component is linked from the "Manage Profile" button on the General
        User Dashboard.
      </p>
    </div>
  );
};

export default Settings;

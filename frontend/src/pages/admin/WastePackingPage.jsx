// frontend/src/pages/admin/WastePackingPage.jsx
import React, { useState } from "react";
import CreateWastePacking from "../admin/createWastePacking";
import ExistingWastePackings from "../admin/ExistingWastePackings"; // You'll create this for viewing existing entries

const WastePackingPage = () => {
  const [activeTab, setActiveTab] = useState("create"); // "create" or "view"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching your existing UI */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Waste Packing</h1>
              <p className="text-gray-600 mt-1">Manage waste packing entries</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("view")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "view"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                View Existing
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "create"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                + Create New
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "create"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Create New Entry
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "view"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                View/Edit Existing
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "create" ? (
          <CreateWastePacking />
        ) : (
          <ExistingWastePackings />
        )}
      </div>
    </div>
  );
};

export default WastePackingPage;
// frontend/src/pages/admin/ExistingWastePackings.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import wastePackingService from "../../services/wastePackingService";

// Helper function to safely convert to number and format
const formatNumber = (value, decimals = 3) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.000";
  return num.toFixed(decimals);
};

// Helper function to safely sum values
const sumNumbers = (array, key) => {
  if (!array || !Array.isArray(array)) return 0;
  return array.reduce((sum, item) => {
    const val = parseFloat(item[key]);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
};

const ExistingWastePackings = () => {
  const [packings, setPackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packingToDelete, setPackingToDelete] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackings();
  }, []);

  const fetchPackings = async () => {
    try {
      setLoading(true);
      const data = await wastePackingService.getAll();
      // Ensure all weight values are numbers
      const processedData = Array.isArray(data) ? data.map(packing => ({
        ...packing,
        totalWeight: parseFloat(packing.totalWeight) || 0,
        noOfBales: parseInt(packing.noOfBales) || 0,
        stock: parseFloat(packing.stock) || 0,
        details: Array.isArray(packing.details) ? packing.details.map(detail => ({
          ...detail,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0
        })) : []
      })) : [];
      setPackings(processedData);
    } catch (error) {
      toast.error("Failed to fetch waste packings");
      console.error("Error fetching packings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const packing = await wastePackingService.getById(id);
      // Ensure all weight values are numbers
      const processedPacking = {
        ...packing,
        totalWeight: parseFloat(packing.totalWeight) || 0,
        noOfBales: parseInt(packing.noOfBales) || 0,
        stock: parseFloat(packing.stock) || 0,
        details: Array.isArray(packing.details) ? packing.details.map(detail => ({
          ...detail,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0
        })) : []
      };
      setSelectedPacking(processedPacking);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to fetch packing details");
      console.error("Error fetching packing details:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/waste-packing/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await wastePackingService.delete(id);
      toast.success("Waste packing deleted successfully");
      fetchPackings();
      setShowDeleteModal(false);
      setPackingToDelete(null);
    } catch (error) {
      toast.error("Failed to delete waste packing");
    }
  };

  const confirmDelete = (id, wasteType, lotNo) => {
    setPackingToDelete({ id, wasteType, lotNo });
    setShowDeleteModal(true);
  };

  const filteredPackings = packings.filter(packing => {
    if (!packing) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (packing.wasteType && packing.wasteType.toLowerCase().includes(searchLower)) ||
      (packing.lotNo && packing.lotNo.toLowerCase().includes(searchLower)) ||
      (packing.packingType && packing.packingType.toLowerCase().includes(searchLower)) ||
      (packing._id && packing._id.includes(searchTerm))
    );
  });

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Existing Waste Packings</h2>
          <div className="flex gap-3">
            <button
              onClick={fetchPackings}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate("/admin/waste-packing/create")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by waste type, lot no, packing type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Packings Table */}
      {filteredPackings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No waste packings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new waste packing entry.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/admin/waste-packing/create")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Waste Packing
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waste Packing Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackings.map((packing) => (
                  <React.Fragment key={packing._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleRowExpand(packing._id)}
                            className="mr-3 text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              className={`w-5 h-5 transform ${expandedRow === packing._id ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {packing.wasteType || 'Unknown Waste Type'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Lot No: {packing.lotNo || 'N/A'} | Packing: {packing.packingType || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {packing.date ? new Date(packing.date).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {packing.noOfBales || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatNumber(packing.totalWeight)} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(packing._id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(packing._id)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(packing._id, packing.wasteType, packing.lotNo)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row for Bale Details */}
                    {expandedRow === packing._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="ml-8">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Bale Details ({(packing.details || []).length} bales)</h4>
                            {packing.details && packing.details.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sl. No.</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gross wt.</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tare wt.</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net wt.</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {packing.details.slice(0, 5).map((detail, index) => (
                                      <tr key={index}>
                                        <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{detail.baleNo || 'N/A'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{formatNumber(detail.grossWeight)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{formatNumber(detail.tareWeight)}</td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatNumber(detail.netWeight)}</td>
                                      </tr>
                                    ))}
                                    {packing.details.length > 5 && (
                                      <tr>
                                        <td colSpan="5" className="px-3 py-2 text-sm text-gray-500 text-center">
                                          ... and {packing.details.length - 5} more bales
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No bale details available</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
            <div>
              Showing {filteredPackings.length} of {packings.length} waste packings
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                <span className="text-xs">Click to expand for bale details</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPacking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Waste Packing Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Waste Type</label>
                  <p className="text-lg font-semibold">{selectedPacking.wasteType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg">{selectedPacking.date ? new Date(selectedPacking.date).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Packing Type</label>
                  <p className="text-lg">{selectedPacking.packingType || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lot No</label>
                  <p className="text-lg">{selectedPacking.lotNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">No. of Bales</label>
                  <p className="text-lg font-semibold">{selectedPacking.noOfBales || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Weight</label>
                  <p className="text-lg font-semibold text-blue-600">{formatNumber(selectedPacking.totalWeight)} kg</p>
                </div>
              </div>
            </div>
            
            {/* Bale Details Table in Modal */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">All Bale Details ({(selectedPacking.details || []).length})</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross wt.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tare wt.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net wt.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedPacking.details || []).map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{detail.baleNo || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.grossWeight)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.tareWeight)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatNumber(detail.netWeight)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-sm text-gray-900">Totals</td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'grossWeight'))}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'tareWeight'))}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'netWeight'))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedPacking._id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit This Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && packingToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Waste Packing</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center">
                  Are you sure you want to delete this waste packing entry?
                </p>
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    {packingToDelete.wasteType} - Lot No: {packingToDelete.lotNo}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone. All bale details will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPackingToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(packingToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingWastePackings;
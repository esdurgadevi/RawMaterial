// frontend/src/pages/admin/WasteEntryPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Package,
  Scale,
  Building,
  Filter
} from 'lucide-react';
import wasteEntryService from '../../services/wasteEntryService';

const WasteEntryPage = () => {
  // State Management
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'ALL',
    remarks: '',
    details: [
      {
        department: '',
        wasteType: '',
        packingType: 'BALE',
        netWeight: '',
        godown: 'AB'
      }
    ]
  });

  // Departments and Waste Types
  const departments = [
    'Carding',
    'Comber',
    'Speed Frame',
    'Spinning',
    'Auto Coner',
    'Blow Room',
    'Ring Frame'
  ];

  const wasteTypes = [
    'LICKERIN FLY',
    'FLAT STRIPS',
    'COMBER NOILS',
    'ROVING WASTE',
    'FAN WASTE',
    'YARN WASTE',
    'HARD WASTE',
    'SOFT WASTE'
  ];

  const packingTypes = ['BALE', 'BAG', 'BOX', 'ROLL'];
  const shifts = ['ALL', 'A', 'B', 'C'];
  const godowns = ['AB', 'CD', 'EF', 'GH'];

  // Fetch all waste entries
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await wasteEntryService.getAll();
      setEntries(data || []);
    } catch (error) {
      showNotification('Failed to fetch waste entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shift: 'ALL',
      remarks: '',
      details: [
        {
          department: '',
          wasteType: '',
          packingType: 'BALE',
          netWeight: '',
          godown: 'AB'
        }
      ]
    });
    setSelectedEntry(null);
    setIsEditing(false);
  };

  // Open modal for creating new entry
  const handleOpenCreateModal = () => {
    resetForm();
    setOpenModal(true);
  };

  // Open modal for editing entry
  const handleOpenEditModal = (entry) => {
    setFormData(entry);
    setSelectedEntry(entry);
    setIsEditing(true);
    setOpenModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  // Handle main form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle detail row changes
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index][field] = value;
    
    if (field === 'netWeight') {
      updatedDetails[index][field] = value === '' ? '' : Number(value);
    }
    
    setFormData(prev => ({
      ...prev,
      details: updatedDetails
    }));
  };

  // Add new detail row
  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          department: '',
          wasteType: '',
          packingType: 'BALE',
          netWeight: '',
          godown: 'AB'
        }
      ]
    }));
  };

  // Remove detail row
  const removeDetailRow = (index) => {
    if (formData.details.length > 1) {
      const updatedDetails = formData.details.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        details: updatedDetails
      }));
    }
  };

  // Calculate total weight
  const calculateTotalWeight = () => {
    return formData.details.reduce((total, detail) => {
      return total + (Number(detail.netWeight) || 0);
    }, 0);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.date) {
      showNotification('Date is required', 'error');
      return false;
    }

    for (let i = 0; i < formData.details.length; i++) {
      const detail = formData.details[i];
      if (!detail.department) {
        showNotification(`Department is required for row ${i + 1}`, 'error');
        return false;
      }
      if (!detail.wasteType) {
        showNotification(`Waste Type is required for row ${i + 1}`, 'error');
        return false;
      }
      if (!detail.netWeight || detail.netWeight <= 0) {
        showNotification(`Valid Net Weight is required for row ${i + 1}`, 'error');
        return false;
      }
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (isEditing && selectedEntry?._id) {
        await wasteEntryService.update(selectedEntry._id, formData);
        showNotification('Waste entry updated successfully');
      } else {
        await wasteEntryService.create(formData);
        showNotification('Waste entry created successfully');
      }
      
      fetchEntries();
      handleCloseModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        await wasteEntryService.delete(id);
        showNotification('Waste entry deleted successfully');
        fetchEntries();
      } catch (error) {
        showNotification('Failed to delete entry', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  // Calculate statistics
  const todayEntries = entries.filter(e => 
    new Date(e.date).toDateString() === new Date().toDateString()
  ).length;

  const totalWeightToday = todayEntries > 0 ? 
    entries.filter(e => new Date(e.date).toDateString() === new Date().toDateString())
      .reduce((sum, entry) => sum + entry.details.reduce((s, d) => s + (d.netWeight || 0), 0), 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in ${notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 rounded shadow-lg max-w-md`}>
          <div className="flex items-center">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Entry Management</h1>
            <p className="text-gray-600 mt-1">Manage waste entries across departments</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Waste Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-800">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Entries</p>
              <p className="text-2xl font-bold text-gray-800">{todayEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Scale className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Total Weight</p>
              <p className="text-2xl font-bold text-gray-800">{totalWeightToday.toLocaleString()} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Waste Entries</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No waste entries found. Create your first entry!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const totalWeight = entry.details.reduce((sum, detail) => sum + (detail.netWeight || 0), 0);
                  
                  return (
                    <tr key={entry._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDate(entry.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.shift === 'ALL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {entry.shift}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.details?.length || 0} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{totalWeight.toLocaleString()} kg</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.remarks}>
                          {entry.remarks || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(entry)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Waste Entry' : 'Create New Waste Entry'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Waste Entry Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {shifts.map((shift) => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional remarks..."
                    />
                  </div>
                </div>
              </div>

              {/* Details Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-700">Waste Details</h4>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Row
                  </button>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Waste Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Packing</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Net Weight (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Godown</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.details.map((detail, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <select
                              value={detail.department}
                              onChange={(e) => handleDetailChange(index, 'department', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              required
                            >
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={detail.wasteType}
                              onChange={(e) => handleDetailChange(index, 'wasteType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              required
                            >
                              <option value="">Select Waste Type</option>
                              {wasteTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={detail.packingType}
                              onChange={(e) => handleDetailChange(index, 'packingType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              {packingTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={detail.netWeight}
                              onChange={(e) => handleDetailChange(index, 'netWeight', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={detail.godown}
                              onChange={(e) => handleDetailChange(index, 'godown', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              {godowns.map((godown) => (
                                <option key={godown} value={godown}>{godown}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {formData.details.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDetailRow(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Weight */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Rows: {formData.details.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <p className="text-xl font-bold text-gray-800">{calculateTotalWeight().toLocaleString()} kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Entry' : 'Create Entry'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteEntryPage;
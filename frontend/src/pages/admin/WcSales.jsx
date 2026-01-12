import React, { useState, useEffect } from 'react';
import wasteInvoiceTypeService from '../../services/wasteInvoiceTypeService';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Hash,
  FileText,
  Receipt,
  Tag,
  Calculator,
  Percent,
  Check,
  X as XIcon
} from 'lucide-react';

const WasteInvoiceType = () => {
  // States
  const [wasteInvoiceTypes, setWasteInvoiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [viewingType, setViewingType] = useState(null);
  
  // Form state with all fields
  const [formData, setFormData] = useState({
    code: '',
    invoiceType: '',
    assessValue: false,
    charity: false,
    tax: false,
    gst: true,
    igst: false,
    duty: false,
    cess: false,
    hrSecCess: false,
    tcs: false,
    cst: false,
    cenvat: false,
    subTotal: true,
    totalValue: true,
    roundOff: true,
    packingForwardingCharges: false,
    roundOffDigits: 0,
    gstPercentage: 0,
    cgstPercentage: 0,
    sgstPercentage: 0
  });

  // Load waste invoice types on component mount
  useEffect(() => {
    fetchWasteInvoiceTypes();
  }, []);

  const fetchWasteInvoiceTypes = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await wasteInvoiceTypeService.getAll();
      
      // Extract waste invoice types array from response
      const typesData = Array.isArray(response) ? response : [];
      
      setWasteInvoiceTypes(typesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load waste invoice types');
      setWasteInvoiceTypes([]);
      setLoading(false);
    }
  };

  // Filter waste invoice types based on search
  const filteredTypes = (() => {
    const typesArray = Array.isArray(wasteInvoiceTypes) ? wasteInvoiceTypes : [];
    
    return typesArray.filter(type => {
      if (!type || typeof type !== 'object') return false;
      
      const typeCode = type.code ? type.code.toString() : '';
      const invoiceType = type.invoiceType || '';
      
      return searchTerm === '' || 
        typeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoiceType.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'code' ? (value === '' ? '' : parseInt(value) || value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingType) {
        // Update existing waste invoice type
        await wasteInvoiceTypeService.update(editingType.id, formData);
        setSuccess('Waste invoice type updated successfully!');
      } else {
        // Create new waste invoice type
        await wasteInvoiceTypeService.create(formData);
        setSuccess('Waste invoice type created successfully!');
      }
      
      // Refresh waste invoice types list
      fetchWasteInvoiceTypes();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (type) => {
    if (!type || !type.id) {
      setError('Invalid waste invoice type data');
      return;
    }
    
    setEditingType(type);
    setFormData({
      code: type.code || '',
      invoiceType: type.invoiceType || '',
      assessValue: type.assessValue ?? false,
      charity: type.charity ?? false,
      tax: type.tax ?? false,
      gst: type.gst ?? true,
      igst: type.igst ?? false,
      duty: type.duty ?? false,
      cess: type.cess ?? false,
      hrSecCess: type.hrSecCess ?? false,
      tcs: type.tcs ?? false,
      cst: type.cst ?? false,
      cenvat: type.cenvat ?? false,
      subTotal: type.subTotal ?? true,
      totalValue: type.totalValue ?? true,
      roundOff: type.roundOff ?? true,
      packingForwardingCharges: type.packingForwardingCharges ?? false,
      roundOffDigits: type.roundOffDigits ?? 0,
      gstPercentage: type.gstPercentage ?? 0,
      cgstPercentage: type.cgstPercentage ?? 0,
      sgstPercentage: type.sgstPercentage ?? 0
    });
    setShowModal(true);
  };

  const handleView = (type) => {
    if (!type || !type.id) {
      setError('Invalid waste invoice type data');
      return;
    }
    
    setViewingType(type);
    setShowViewModal(true);
  };

  const handleDelete = async (id, typeName) => {
    if (!id || !typeName) {
      setError('Invalid waste invoice type data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete waste invoice type "${typeName}"?`)) {
      return;
    }

    try {
      await wasteInvoiceTypeService.delete(id);
      setSuccess('Waste invoice type deleted successfully!');
      fetchWasteInvoiceTypes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete waste invoice type');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      invoiceType: '',
      assessValue: false,
      charity: false,
      tax: false,
      gst: true,
      igst: false,
      duty: false,
      cess: false,
      hrSecCess: false,
      tcs: false,
      cst: false,
      cenvat: false,
      subTotal: true,
      totalValue: true,
      roundOff: true,
      packingForwardingCharges: false,
      roundOffDigits: 0,
      gstPercentage: 0,
      cgstPercentage: 0,
      sgstPercentage: 0
    });
    setEditingType(null);
    setViewingType(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const exportTypes = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Invoice Type,GST %,CGST %,SGST %,Assess Value,Charity,Tax,IGST,Duty,Cess,HrSec Cess,TCS,CST,Cenvat\n" +
        filteredTypes.map(t => 
          `${t.code},${t.invoiceType},${t.gstPercentage},${t.cgstPercentage},${t.sgstPercentage},${t.assessValue ? 'Yes' : 'No'},${t.charity ? 'Yes' : 'No'},${t.tax ? 'Yes' : 'No'},${t.igst ? 'Yes' : 'No'},${t.duty ? 'Yes' : 'No'},${t.cess ? 'Yes' : 'No'},${t.hrSecCess ? 'Yes' : 'No'},${t.tcs ? 'Yes' : 'No'},${t.cst ? 'Yes' : 'No'},${t.cenvat ? 'Yes' : 'No'}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "waste_invoice_types.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Waste invoice types exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export waste invoice types');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Format code display
  const formatCode = (code) => {
    if (!code && code !== 0) return 'N/A';
    return code.toString().padStart(4, '0');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Toggle all boolean fields
  const toggleAllFields = (value) => {
    setFormData(prev => ({
      ...prev,
      assessValue: value,
      charity: value,
      tax: value,
      gst: value,
      igst: value,
      duty: value,
      cess: value,
      hrSecCess: value,
      tcs: value,
      cst: value,
      cenvat: value,
      subTotal: value,
      totalValue: value,
      roundOff: value,
      packingForwardingCharges: value
    }));
  };

  // Count enabled features
  const countEnabledFeatures = (type) => {
    if (!type) return 0;
    const features = [
      'assessValue', 'charity', 'tax', 'gst', 'igst', 'duty', 'cess', 
      'hrSecCess', 'tcs', 'cst', 'cenvat', 'subTotal', 'totalValue', 
      'roundOff', 'packingForwardingCharges'
    ];
    return features.filter(feature => type[feature]).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Waste Invoice Type Management</h1>
            <p className="text-gray-600">Manage all waste invoice types and their tax configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Type
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search waste invoice types by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportTypes}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={fetchWasteInvoiceTypes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Waste Invoice Types Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Waste Invoice Types ({filteredTypes.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredTypes.length} of {wasteInvoiceTypes.length} types
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading waste invoice types...</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No waste invoice types found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first waste invoice type
              </button>
            )}
          </div>
        ) : (
          /* Waste Invoice Types Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Configuration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <Hash className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {formatCode(type.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {type.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{type.invoiceType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Percent className="w-3 h-3 text-gray-400 mr-2" />
                          <div className="text-xs text-gray-600">
                            GST: {type.gstPercentage}% | CGST: {type.cgstPercentage}% | SGST: {type.sgstPercentage}%
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {type.gst && <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">GST</span>}
                          {type.igst && <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">IGST</span>}
                          {type.tax && <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Tax</span>}
                          {countEnabledFeatures(type) > 3 && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                              +{countEnabledFeatures(type) - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(type.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(type.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(type)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(type)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(type.id, type.invoiceType)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Waste Invoice Type Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingType ? 'Edit Waste Invoice Type' : 'Add New Waste Invoice Type'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type Code *
                        <span className="text-xs text-gray-500 ml-1">(Unique numeric code)</span>
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter unique type code"
                          disabled={editingType}
                        />
                      </div>
                    </div>

                    {/* Invoice Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Type Name *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="invoiceType"
                          value={formData.invoiceType}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter invoice type name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Toggle Buttons */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleAllFields(true)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center text-sm"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllFields(false)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center text-sm"
                    >
                      <XIcon className="w-3 h-3 mr-1" />
                      Disable All
                    </button>
                  </div>

                  {/* Tax Configuration Grid */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tax & Calculation Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Column 1 */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="assessValue"
                            checked={formData.assessValue}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Assess Value</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="charity"
                            checked={formData.charity}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Charity</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="tax"
                            checked={formData.tax}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Tax</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="gst"
                            checked={formData.gst}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">GST</span>
                        </label>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="igst"
                            checked={formData.igst}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">IGST</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="duty"
                            checked={formData.duty}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Duty</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="cess"
                            checked={formData.cess}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Cess</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="hrSecCess"
                            checked={formData.hrSecCess}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">HrSec Cess</span>
                        </label>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="tcs"
                            checked={formData.tcs}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">TCS</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="cst"
                            checked={formData.cst}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">CST</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="cenvat"
                            checked={formData.cenvat}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Cenvat</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="packingForwardingCharges"
                            checked={formData.packingForwardingCharges}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Packing Charges</span>
                        </label>
                      </div>

                      {/* Column 4 */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="subTotal"
                            checked={formData.subTotal}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Sub Total</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="totalValue"
                            checked={formData.totalValue}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Total Value</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="roundOff"
                            checked={formData.roundOff}
                            onChange={handleInputChange}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">Round Off</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Percentage Configuration */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Percentage Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST Percentage
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="gstPercentage"
                            value={formData.gstPercentage}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="GST %"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CGST Percentage
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="cgstPercentage"
                            value={formData.cgstPercentage}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="CGST %"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SGST Percentage
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="sgstPercentage"
                            value={formData.sgstPercentage}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="SGST %"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Round Off Digits
                        </label>
                        <div className="relative">
                          <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="roundOffDigits"
                            value={formData.roundOffDigits}
                            onChange={handleInputChange}
                            min="0"
                            max="10"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Round off digits"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    {editingType ? 'Update Type' : 'Create Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Waste Invoice Type Details Modal */}
      {showViewModal && viewingType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Waste Invoice Type Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Type Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Type Code</label>
                      <div className="mt-1 flex items-center">
                        <Hash className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-mono font-semibold text-gray-900">
                          {formatCode(viewingType.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingType.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Invoice Type</label>
                    <div className="mt-1 flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-lg font-medium text-gray-900">{viewingType.invoiceType}</span>
                    </div>
                  </div>

                  {/* Enabled Features */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Enabled Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {viewingType.assessValue && <div className="text-sm text-green-600">✓ Assess Value</div>}
                      {viewingType.charity && <div className="text-sm text-green-600">✓ Charity</div>}
                      {viewingType.tax && <div className="text-sm text-green-600">✓ Tax</div>}
                      {viewingType.gst && <div className="text-sm text-green-600">✓ GST</div>}
                      {viewingType.igst && <div className="text-sm text-green-600">✓ IGST</div>}
                      {viewingType.duty && <div className="text-sm text-green-600">✓ Duty</div>}
                      {viewingType.cess && <div className="text-sm text-green-600">✓ Cess</div>}
                      {viewingType.hrSecCess && <div className="text-sm text-green-600">✓ HrSec Cess</div>}
                      {viewingType.tcs && <div className="text-sm text-green-600">✓ TCS</div>}
                      {viewingType.cst && <div className="text-sm text-green-600">✓ CST</div>}
                      {viewingType.cenvat && <div className="text-sm text-green-600">✓ Cenvat</div>}
                      {viewingType.subTotal && <div className="text-sm text-green-600">✓ Sub Total</div>}
                      {viewingType.totalValue && <div className="text-sm text-green-600">✓ Total Value</div>}
                      {viewingType.roundOff && <div className="text-sm text-green-600">✓ Round Off</div>}
                      {viewingType.packingForwardingCharges && <div className="text-sm text-green-600">✓ Packing Charges</div>}
                    </div>
                  </div>

                  {/* Percentage Details */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Percentage Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">GST Percentage</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{viewingType.gstPercentage}%</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">CGST Percentage</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{viewingType.cgstPercentage}%</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">SGST Percentage</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{viewingType.sgstPercentage}%</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Round Off Digits</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{viewingType.roundOffDigits}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingType.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingType.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingType.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingType.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingType);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Type
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteInvoiceType;
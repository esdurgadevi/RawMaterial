import React, { useState, useEffect } from 'react';
import supplierService from '../../services/supplierService';
import stateService from '../../services/stateService';
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
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  ChevronDown,
  Truck,
  FileText
} from 'lucide-react';

// Helper component for detail items in view modal
const DetailItem = ({ label, value, isMultiline = false, isLink = false }) => {
  if (!value) return null;
  
  return (
    <div className={`${isMultiline ? '' : 'flex items-center justify-between'}`}>
      <span className="text-xs text-gray-500">{label}:</span>
      {isLink ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
        >
          {value}
        </a>
      ) : isMultiline ? (
        <div className="mt-1">
          <p className="text-sm text-gray-900 whitespace-pre-line">{value}</p>
        </div>
      ) : (
        <span className="text-sm font-medium text-gray-900 truncate ml-2">{value}</span>
      )}
    </div>
  );
};

const Supplier = () => {
  // States
  const [suppliers, setSuppliers] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    accountGroup: '',
    accountName: '',
    place: '',
    address: '',
    deliveryAddress: '',
    pincode: '',
    stateId: '',
    tinNo: '',
    cstNo: '',
    gstNo: '',
    phoneNo: '',
    cellNo: '',
    email: '',
    website: '',
    contactPerson: '',
    fax: '',
    accountNo: '',
    openingCredit: 0,
    openingDebit: 0
  });

  // Load suppliers and states on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchStates();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await supplierService.getAll();
      
      // Extract suppliers array from response (response.data.suppliers)
      const suppliersData = Array.isArray(response) ? response : [];
      
      setSuppliers(suppliersData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
      setSuppliers([]);
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    setStatesLoading(true);
    try {
      const response = await stateService.getAll();
      
      // Extract states array from response (response.data.states)
      const statesData = Array.isArray(response) ? response : [];
      
      setStates(statesData);
      setStatesLoading(false);
    } catch (err) {
      console.error('Failed to load states:', err);
      setStates([]);
      setStatesLoading(false);
    }
  };

  // Filter suppliers based on search
  const filteredSuppliers = (() => {
    const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
    
    return suppliersArray.filter(supplier => {
      if (!supplier || typeof supplier !== 'object') return false;
      
      const code = supplier.code || '';
      const accountName = supplier.accountName || '';
      const place = supplier.place || '';
      const accountGroup = supplier.accountGroup || '';
      const stateName = supplier.State ? supplier.State.state || '' : '';
      const gstNo = supplier.gstNo || '';
      const phoneNo = supplier.phoneNo || '';
      
      const matchesSearch = searchTerm === '' || 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gstNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = filterState === '' || 
        (supplier.State && supplier.State.id && supplier.State.id.toString() === filterState);
      
      return matchesSearch && matchesState;
    });
  })();

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'stateId' ? (value === '' ? '' : parseInt(value) || value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.code || !formData.accountName || !formData.accountGroup) {
      setError('Code, Account Name, and Account Group are required');
      return;
    }

    try {
      if (editingSupplier) {
        // Update existing supplier
        await supplierService.update(editingSupplier.id, formData);
        setSuccess('Supplier updated successfully!');
      } else {
        // Create new supplier
        await supplierService.create(formData);
        setSuccess('Supplier created successfully!');
      }
      
      // Refresh suppliers list
      fetchSuppliers();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (supplier) => {
    if (!supplier || !supplier.id) {
      setError('Invalid supplier data');
      return;
    }
    
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code || '',
      accountGroup: supplier.accountGroup || '',
      accountName: supplier.accountName || '',
      place: supplier.place || '',
      address: supplier.address || '',
      deliveryAddress: supplier.deliveryAddress || '',
      pincode: supplier.pincode || '',
      stateId: supplier.stateId || '',
      tinNo: supplier.tinNo || '',
      cstNo: supplier.cstNo || '',
      gstNo: supplier.gstNo || '',
      phoneNo: supplier.phoneNo || '',
      cellNo: supplier.cellNo || '',
      email: supplier.email || '',
      website: supplier.website || '',
      contactPerson: supplier.contactPerson || '',
      fax: supplier.fax || '',
      accountNo: supplier.accountNo || '',
      openingCredit: supplier.openingCredit || 0,
      openingDebit: supplier.openingDebit || 0
    });
    setShowModal(true);
  };

  const handleView = (supplier) => {
    if (!supplier || !supplier.id) {
      setError('Invalid supplier data');
      return;
    }
    
    setViewingSupplier(supplier);
    setShowViewModal(true);
  };

  const handleDelete = async (id, supplierName) => {
    if (!id || !supplierName) {
      setError('Invalid supplier data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`)) {
      return;
    }

    try {
      await supplierService.delete(id);
      setSuccess('Supplier deleted successfully!');
      fetchSuppliers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      accountGroup: '',
      accountName: '',
      place: '',
      address: '',
      deliveryAddress: '',
      pincode: '',
      stateId: '',
      tinNo: '',
      cstNo: '',
      gstNo: '',
      phoneNo: '',
      cellNo: '',
      email: '',
      website: '',
      contactPerson: '',
      fax: '',
      accountNo: '',
      openingCredit: 0,
      openingDebit: 0
    });
    setEditingSupplier(null);
    setViewingSupplier(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const exportSuppliers = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Account Name,Account Group,Place,State,Phone,GST No,Email\n" +
        filteredSuppliers.map(s => 
          `${s.code},${s.accountName},${s.accountGroup},${s.place},${s.State ? s.State.state : 'N/A'},${s.phoneNo || ''},${s.gstNo || ''},${s.email || ''}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "suppliers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Suppliers exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export suppliers');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterState('');
  };

  // Format code display
  const formatCode = (code) => {
    if (!code) return 'N/A';
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

  // Get unique states for filter dropdown
  const uniqueStates = [...new Set(suppliers
    .filter(s => s.State)
    .map(s => ({ id: s.State.id, name: s.State.state }))
  )].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Supplier Management</h1>
            <p className="text-gray-600">Manage all suppliers and their details</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Supplier
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

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers by code, name, place, GST, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* State Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              Clear Filters
            </button>
            <button
              onClick={exportSuppliers}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => {
                fetchSuppliers();
                fetchStates();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Suppliers ({filteredSuppliers.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No suppliers found</p>
            {searchTerm || filterState ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first supplier
              </button>
            )}
          </div>
        ) : (
          /* Suppliers Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact & Location
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
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <Hash className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {supplier.code}
                          </div>
                          <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{supplier.accountName}</div>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 text-gray-400 mr-2" />
                          <div className="text-xs text-gray-600">{supplier.accountGroup}</div>
                        </div>
                        {supplier.gstNo && (
                          <div className="flex items-center">
                            <CreditCard className="w-3 h-3 text-gray-400 mr-2" />
                            <div className="text-xs text-gray-500">GST: {supplier.gstNo}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 text-gray-400 mr-2" />
                          <div className="text-xs text-gray-600">{supplier.place}</div>
                        </div>
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 text-gray-400 mr-2" />
                          <div className="text-xs text-gray-600">
                            {supplier.State ? supplier.State.state : 'N/A'}
                          </div>
                        </div>
                        {supplier.phoneNo && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 text-gray-400 mr-2" />
                            <div className="text-xs text-gray-500">{supplier.phoneNo}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(supplier.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(supplier.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(supplier)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id, supplier.accountName)}
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

      {/* Create/Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
                  {/* Basic Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Code *
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter supplier code"
                            disabled={editingSupplier}
                          />
                        </div>
                      </div>

                      {/* Account Group */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Group *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="accountGroup"
                            value={formData.accountGroup}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter account group"
                          />
                        </div>
                      </div>

                      {/* Account Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Name *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter supplier/company name"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Location Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Place */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Place *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="place"
                            value={formData.place}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter city/town"
                          />
                        </div>
                      </div>

                      {/* State Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          {statesLoading ? (
                            <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                              <RefreshCw className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                              <span className="text-gray-500">Loading states...</span>
                            </div>
                          ) : (
                            <select
                              name="stateId"
                              value={formData.stateId}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                              <option value="">Select a state</option>
                              {states.map(state => (
                                <option key={state.id} value={state.id}>
                                  {state.code ? `${formatCode(state.code)} - ${state.state}` : state.state}
                                </option>
                              ))}
                            </select>
                          )}
                          {!statesLoading && states.length > 0 && (
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          )}
                        </div>
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter pincode"
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter full address"
                        />
                      </div>

                      {/* Delivery Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Address
                        </label>
                        <textarea
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter delivery address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax & Legal Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Tax & Legal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* TIN No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TIN No
                        </label>
                        <input
                          type="text"
                          name="tinNo"
                          value={formData.tinNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter TIN number"
                        />
                      </div>

                      {/* CST No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CST No
                        </label>
                        <input
                          type="text"
                          name="cstNo"
                          value={formData.cstNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter CST number"
                        />
                      </div>

                      {/* GST No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST No
                        </label>
                        <input
                          type="text"
                          name="gstNo"
                          value={formData.gstNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter GST number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Phone No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone No
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {/* Cell No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cell No
                        </label>
                        <input
                          type="text"
                          name="cellNo"
                          value={formData.cellNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter mobile number"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter website URL"
                        />
                      </div>

                      {/* Contact Person */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter contact person name"
                          />
                        </div>
                      </div>

                      {/* Fax */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fax
                        </label>
                        <input
                          type="text"
                          name="fax"
                          value={formData.fax}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter fax number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Financial Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Account No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account No
                        </label>
                        <input
                          type="text"
                          name="accountNo"
                          value={formData.accountNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter account number"
                        />
                      </div>

                      {/* Opening Credit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Credit
                        </label>
                        <input
                          type="number"
                          name="openingCredit"
                          value={formData.openingCredit}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Opening Debit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Debit
                        </label>
                        <input
                          type="number"
                          name="openingDebit"
                          value={formData.openingDebit}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
                      >
                        {editingSupplier ? (
                          <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Update Supplier
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Supplier
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Supplier Modal */}
      {showViewModal && viewingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Supplier Details</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {viewingSupplier.id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingSupplier(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Supplier Details */}
              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {viewingSupplier.accountName}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm font-mono font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              Code: {viewingSupplier.code}
                            </span>
                            <span className="text-sm text-gray-600">
                              Group: {viewingSupplier.accountGroup}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Created On</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(viewingSupplier.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(viewingSupplier.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Location Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="Place" value={viewingSupplier.place} />
                        <DetailItem label="State" value={viewingSupplier.State ? viewingSupplier.State.state : 'N/A'} />
                        <DetailItem label="Pincode" value={viewingSupplier.pincode} />
                        <DetailItem label="Address" value={viewingSupplier.address} isMultiline />
                        <DetailItem label="Delivery Address" value={viewingSupplier.deliveryAddress} isMultiline />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="Phone No" value={viewingSupplier.phoneNo} />
                        <DetailItem label="Cell No" value={viewingSupplier.cellNo} />
                        <DetailItem label="Email" value={viewingSupplier.email} />
                        <DetailItem label="Website" value={viewingSupplier.website} isLink />
                        <DetailItem label="Contact Person" value={viewingSupplier.contactPerson} />
                        <DetailItem label="Fax" value={viewingSupplier.fax} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Tax & Legal Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Tax & Legal Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="TIN No" value={viewingSupplier.tinNo} />
                        <DetailItem label="CST No" value={viewingSupplier.cstNo} />
                        <DetailItem label="GST No" value={viewingSupplier.gstNo} />
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Financial Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="Account No" value={viewingSupplier.accountNo} />
                        <DetailItem 
                          label="Opening Credit" 
                          value={viewingSupplier.openingCredit ? 
                            `₹${parseFloat(viewingSupplier.openingCredit).toFixed(2)}` : 
                            '₹0.00'
                          } 
                        />
                        <DetailItem 
                          label="Opening Debit" 
                          value={viewingSupplier.openingDebit ? 
                            `₹${parseFloat(viewingSupplier.openingDebit).toFixed(2)}` : 
                            '₹0.00'
                          } 
                        />
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        Additional Details
                      </h4>
                      <div className="space-y-2">
                        <DetailItem 
                          label="Last Updated" 
                          value={
                            viewingSupplier.updatedAt ? 
                              `${formatDate(viewingSupplier.updatedAt)} ${formatTime(viewingSupplier.updatedAt)}` : 
                              'N/A'
                          } 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingSupplier(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleEdit(viewingSupplier);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Supplier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplier;
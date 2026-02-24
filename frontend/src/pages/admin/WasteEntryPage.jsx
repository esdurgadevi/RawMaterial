// frontend/src/pages/admin/WasteEntryPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import wasteEntryService from '../../services/admin1/transaction-waste/wasteEntryService';
import wasteMasterService from '../../services/admin1/master/wasteMasterService';
import godownService from '../../services/admin1/master/godownService';
import packingTypeService from '../../services/admin1/master/packingTypeService';

const WasteEntryPage = () => {
  // State Management
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Master Data States
  const [wasteMasters, setWasteMasters] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [packingTypes, setPackingTypes] = useState([]);
  const [wasteMastersLoading, setWasteMastersLoading] = useState(false);
  const [godownsLoading, setGodownsLoading] = useState(false);
  const [packingTypesLoading, setPackingTypesLoading] = useState(false);
  
  // Predefined departments list (from your image)
  const departments = [
    'Carding',
    'Comber',
    'Speed Frame',
    'Spinning',
    'Auto Coner',
    'Blow Room',
    'Ring Frame'
  ];

  // Dropdown states for each field type
  const [showWasteDropdown, setShowWasteDropdown] = useState({});
  const [showPackingDropdown, setShowPackingDropdown] = useState({});
  const [showGodownDropdown, setShowGodownDropdown] = useState({});
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState({});
  
  // Search states for each dropdown
  const [wasteSearch, setWasteSearch] = useState({});
  const [packingSearch, setPackingSearch] = useState({});
  const [godownSearch, setGodownSearch] = useState({});
  const [departmentSearch, setDepartmentSearch] = useState({});
  
  // Error states
  const [wasteErrors, setWasteErrors] = useState({});
  const [packingErrors, setPackingErrors] = useState({});
  const [godownErrors, setGodownErrors] = useState({});
  const [departmentErrors, setDepartmentErrors] = useState({});
  
  // Refs for closing dropdowns
  const wasteRefs = useRef({});
  const packingRefs = useRef({});
  const godownRefs = useRef({});
  const departmentRefs = useRef({});

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'ALL',
    remarks: '',
    details: [
      {
        department: '',
        wasteMasterId: '',
        packingTypeId: '',
        godownId: '',
        netWeight: ''
      }
    ]
  });

  const shifts = ['ALL', 'A', 'B', 'C'];

  // Fetch all master data on component mount
  useEffect(() => {
    fetchMasterData();
  }, []);

  // Fetch all waste entries
  useEffect(() => {
    fetchEntries();
  }, []);

  // Set up click outside listeners for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check department dropdowns
      Object.keys(departmentRefs.current).forEach((key) => {
        if (departmentRefs.current[key] && !departmentRefs.current[key].contains(event.target)) {
          setShowDepartmentDropdown(prev => ({ ...prev, [key]: false }));
          validateDepartmentSelection(parseInt(key));
        }
      });
      
      // Check waste dropdowns
      Object.keys(wasteRefs.current).forEach((key) => {
        if (wasteRefs.current[key] && !wasteRefs.current[key].contains(event.target)) {
          setShowWasteDropdown(prev => ({ ...prev, [key]: false }));
        }
      });
      
      // Check packing dropdowns
      Object.keys(packingRefs.current).forEach((key) => {
        if (packingRefs.current[key] && !packingRefs.current[key].contains(event.target)) {
          setShowPackingDropdown(prev => ({ ...prev, [key]: false }));
        }
      });
      
      // Check godown dropdowns
      Object.keys(godownRefs.current).forEach((key) => {
        if (godownRefs.current[key] && !godownRefs.current[key].contains(event.target)) {
          setShowGodownDropdown(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMasterData = async () => {
    try {
      setWasteMastersLoading(true);
      setGodownsLoading(true);
      setPackingTypesLoading(true);
      
      const [wasteData, godownData, packingData] = await Promise.all([
        wasteMasterService.getAll(),
        godownService.getAll(),
        packingTypeService.getAll()
      ]);
      
      console.log("Waste Masters:", wasteData);
      
      setWasteMasters(Array.isArray(wasteData) ? wasteData : []);
      setGodowns(Array.isArray(godownData) ? godownData : []);
      setPackingTypes(Array.isArray(packingData) ? packingData : []);
    } catch (error) {
      console.error('Error fetching master data:', error);
      showNotification('Failed to load master data', 'error');
    } finally {
      setWasteMastersLoading(false);
      setGodownsLoading(false);
      setPackingTypesLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await wasteEntryService.getAll();
      console.log("Fetched entries:", data);
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

  // Get display values from master data
  const getWasteMasterName = (id) => {
    if (!id) return '';
    const waste = wasteMasters.find(w => w._id === id || w.id === id);
    return waste ? waste.waste || waste.name : '';
  };

  const getPackingTypeName = (id) => {
    if (!id) return '';
    const packing = packingTypes.find(p => p._id === id || p.id === id);
    return packing ? packing.name : '';
  };

  const getGodownName = (id) => {
    if (!id) return '';
    const godown = godowns.find(g => g._id === id || g.id === id);
    return godown ? godown.godownName : '';
  };

  // Filter functions
  const getFilteredDepartments = (index) => {
    const searchTerm = departmentSearch[index] || '';
    if (!searchTerm.trim()) return departments;
    return departments.filter(dept => 
      dept.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredWasteMasters = (index) => {
    const searchTerm = wasteSearch[index] || '';
    if (!searchTerm.trim()) return wasteMasters;
    return wasteMasters.filter(waste => 
      (waste.waste || waste.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waste.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waste.code?.toString().includes(searchTerm)
    );
  };

  const getFilteredPackingTypes = (index) => {
    const searchTerm = packingSearch[index] || '';
    if (!searchTerm.trim()) return packingTypes;
    return packingTypes.filter(packing => 
      packing.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packing.code?.toString().includes(searchTerm)
    );
  };

  const getFilteredGodowns = (index) => {
    const searchTerm = godownSearch[index] || '';
    if (!searchTerm.trim()) return godowns;
    return godowns.filter(godown => 
      godown.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      godown.code?.toString().includes(searchTerm) ||
      godown.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Validation functions
  const validateDepartmentSelection = (index) => {
    const department = formData.details[index]?.department;
    if (!department) {
      setDepartmentErrors(prev => ({ ...prev, [index]: 'Department is required' }));
    } else {
      setDepartmentErrors(prev => ({ ...prev, [index]: '' }));
    }
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
          wasteMasterId: '',
          packingTypeId: '',
          godownId: '',
          netWeight: ''
        }
      ]
    });
    setShowDepartmentDropdown({});
    setShowWasteDropdown({});
    setShowPackingDropdown({});
    setShowGodownDropdown({});
    setDepartmentSearch({});
    setWasteSearch({});
    setPackingSearch({});
    setGodownSearch({});
    setDepartmentErrors({});
    setWasteErrors({});
    setPackingErrors({});
    setGodownErrors({});
    setSelectedEntry(null);
    setIsEditing(false);
  };

  // Open modal for creating new entry
  const handleOpenCreateModal = () => {
    resetForm();
    setOpenModal(true);
  };

  // Open modal for editing entry
  const handleOpenEditModal = async (entry) => {
    try {
      const fullEntry = await wasteEntryService.getById(entry._id);
      console.log("Full entry for edit:", fullEntry);
      
      // Initialize search values for each detail
      const departmentSearchValues = {};
      const wasteSearchValues = {};
      const packingSearchValues = {};
      const godownSearchValues = {};
      
      fullEntry.details.forEach((detail, index) => {
        departmentSearchValues[index] = detail.department || '';
        wasteSearchValues[index] = getWasteMasterName(detail.wasteMaster?._id || detail.wasteMasterId);
        packingSearchValues[index] = getPackingTypeName(detail.packingType?._id || detail.packingTypeId);
        godownSearchValues[index] = getGodownName(detail.godown?._id || detail.godownId);
      });
      
      setFormData({
        date: fullEntry.date.split('T')[0],
        shift: fullEntry.shift,
        remarks: fullEntry.remarks || '',
        details: fullEntry.details.map(detail => ({
          department: detail.department || '',
          wasteMasterId: detail.wasteMaster?._id || detail.wasteMasterId,
          packingTypeId: detail.packingType?._id || detail.packingTypeId,
          godownId: detail.godown?._id || detail.godownId,
          netWeight: detail.netWeight
        }))
      });
      
      setDepartmentSearch(departmentSearchValues);
      setWasteSearch(wasteSearchValues);
      setPackingSearch(packingSearchValues);
      setGodownSearch(godownSearchValues);
      
      setSelectedEntry(fullEntry);
      setIsEditing(true);
      setOpenModal(true);
    } catch (error) {
      showNotification('Failed to load entry details', 'error');
    }
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

    // Clear error for this field
    if (field === 'department') {
      setDepartmentErrors(prev => ({ ...prev, [index]: '' }));
    }
  };

  // Handle department selection
  const handleDepartmentSelect = (index, department) => {
    handleDetailChange(index, 'department', department);
    setDepartmentSearch(prev => ({ ...prev, [index]: department }));
    setShowDepartmentDropdown(prev => ({ ...prev, [index]: false }));
    setDepartmentErrors(prev => ({ ...prev, [index]: '' }));
  };

  // Handle waste master selection
  const handleWasteSelect = (index, waste) => {
    const wasteId = waste._id || waste.id;
    handleDetailChange(index, 'wasteMasterId', wasteId);
    setWasteSearch(prev => ({ ...prev, [index]: waste.waste || waste.name }));
    setShowWasteDropdown(prev => ({ ...prev, [index]: false }));
    setWasteErrors(prev => ({ ...prev, [index]: '' }));
  };

  // Handle packing type selection
  const handlePackingSelect = (index, packing) => {
    const packingId = packing._id || packing.id;
    handleDetailChange(index, 'packingTypeId', packingId);
    setPackingSearch(prev => ({ ...prev, [index]: packing.name }));
    setShowPackingDropdown(prev => ({ ...prev, [index]: false }));
    setPackingErrors(prev => ({ ...prev, [index]: '' }));
  };

  // Handle godown selection
  const handleGodownSelect = (index, godown) => {
    const godownId = godown._id || godown.id;
    handleDetailChange(index, 'godownId', godownId);
    setGodownSearch(prev => ({ ...prev, [index]: godown.name }));
    setShowGodownDropdown(prev => ({ ...prev, [index]: false }));
    setGodownErrors(prev => ({ ...prev, [index]: '' }));
  };

  // Handle department search change
  const handleDepartmentSearchChange = (index, e) => {
    const value = e.target.value;
    setDepartmentSearch(prev => ({ ...prev, [index]: value }));
    setShowDepartmentDropdown(prev => ({ ...prev, [index]: true }));
    
    // Clear selection if search changes
    if (formData.details[index]?.department !== value) {
      handleDetailChange(index, 'department', '');
    }
  };

  // Handle waste search change
  const handleWasteSearchChange = (index, e) => {
    const value = e.target.value;
    setWasteSearch(prev => ({ ...prev, [index]: value }));
    setShowWasteDropdown(prev => ({ ...prev, [index]: true }));
    
    // Clear selection if search changes
    if (formData.details[index]?.wasteMasterId) {
      handleDetailChange(index, 'wasteMasterId', '');
    }
  };

  // Handle packing search change
  const handlePackingSearchChange = (index, e) => {
    const value = e.target.value;
    setPackingSearch(prev => ({ ...prev, [index]: value }));
    setShowPackingDropdown(prev => ({ ...prev, [index]: true }));
    
    if (formData.details[index]?.packingTypeId) {
      handleDetailChange(index, 'packingTypeId', '');
    }
  };

  // Handle godown search change
  const handleGodownSearchChange = (index, e) => {
    const value = e.target.value;
    setGodownSearch(prev => ({ ...prev, [index]: value }));
    setShowGodownDropdown(prev => ({ ...prev, [index]: true }));
    
    if (formData.details[index]?.godownId) {
      handleDetailChange(index, 'godownId', '');
    }
  };

  // Handle blur events
  const handleDepartmentBlur = (index) => {
    setTimeout(() => validateDepartmentSelection(index), 200);
  };

  // Add new detail row
  const addDetailRow = () => {
    const newIndex = formData.details.length;
    setFormData(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          department: '',
          wasteMasterId: '',
          packingTypeId: '',
          godownId: '',
          netWeight: ''
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
      
      // Clean up states for removed row
      const newDepartmentState = {};
      const newWasteState = {};
      const newPackingState = {};
      const newGodownState = {};
      
      Object.keys(departmentSearch).forEach(key => {
        const numKey = parseInt(key);
        if (numKey < index) newDepartmentState[key] = departmentSearch[key];
        else if (numKey > index) newDepartmentState[(numKey - 1).toString()] = departmentSearch[key];
      });
      
      Object.keys(wasteSearch).forEach(key => {
        const numKey = parseInt(key);
        if (numKey < index) newWasteState[key] = wasteSearch[key];
        else if (numKey > index) newWasteState[(numKey - 1).toString()] = wasteSearch[key];
      });
      
      Object.keys(packingSearch).forEach(key => {
        const numKey = parseInt(key);
        if (numKey < index) newPackingState[key] = packingSearch[key];
        else if (numKey > index) newPackingState[(numKey - 1).toString()] = packingSearch[key];
      });
      
      Object.keys(godownSearch).forEach(key => {
        const numKey = parseInt(key);
        if (numKey < index) newGodownState[key] = godownSearch[key];
        else if (numKey > index) newGodownState[(numKey - 1).toString()] = godownSearch[key];
      });
      
      setDepartmentSearch(newDepartmentState);
      setWasteSearch(newWasteState);
      setPackingSearch(newPackingState);
      setGodownSearch(newGodownState);
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
      if (!detail.wasteMasterId) {
        showNotification(`Waste Type is required for row ${i + 1}`, 'error');
        return false;
      }
      if (!detail.packingTypeId) {
        showNotification(`Packing Type is required for row ${i + 1}`, 'error');
        return false;
      }
      if (!detail.godownId) {
        showNotification(`Godown is required for row ${i + 1}`, 'error');
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

  // Format code
  const formatCode = (code) => {
    if (!code && code !== 0) return 'N/A';
    return code.toString().padStart(4, '0');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'} border px-4 py-3 rounded-lg shadow-lg max-w-md`}>
          <div className="flex items-center">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto text-xl"
            >
              ×
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
            <span className="mr-2">+</span>
            New Waste Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <span className="text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-800">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <span className="text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Entries</p>
              <p className="text-2xl font-bold text-gray-800">{todayEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <span className="text-xl">⚖️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Total Weight</p>
              <p className="text-2xl font-bold text-gray-800">{totalWeightToday.toLocaleString()} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Waste Entries</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packing Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Godown</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No waste entries found. Create your first entry!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <React.Fragment key={entry._id}>
                    {entry.details.map((detail, detailIndex) => (
                      <tr key={`${entry._id}-${detailIndex}`} className="hover:bg-gray-50 transition duration-150">
                        {detailIndex === 0 && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap" rowSpan={entry.details.length}>
                              <div className="text-sm font-medium text-gray-900">{formatDate(entry.date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" rowSpan={entry.details.length}>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                entry.shift === 'ALL' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                              }`}>
                                {entry.shift}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{detail.department || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getWasteMasterName(detail.wasteMaster?._id || detail.wasteMasterId) || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getPackingTypeName(detail.packingType?._id || detail.packingTypeId) || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{detail.netWeight?.toLocaleString()} kg</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getGodownName(detail.godown?._id || detail.godownId) || '-'}
                          </div>
                        </td>
                        {detailIndex === 0 && (
                          <td className="px-6 py-4" rowSpan={entry.details.length}>
                            <div className="text-sm text-gray-600 max-w-xs truncate" title={entry.remarks}>
                              {entry.remarks || '-'}
                            </div>
                          </td>
                        )}
                        {detailIndex === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" rowSpan={entry.details.length}>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleOpenEditModal(entry)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(entry._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Waste Entry' : 'Create New Waste Entry'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Waste Entry Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {shifts.map((shift) => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional remarks..."
                    />
                  </div>
                </div>
              </div>

              {/* Details Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-700">Waste Details</h4>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Row
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="space-y-1">
                      <div className="grid grid-cols-12 gap-3">
                        {/* Department Autocomplete */}
                        <div className="col-span-2">
                          <div className="relative" ref={el => departmentRefs.current[index] = el}>
                            <input
                              type="text"
                              value={departmentSearch[index] || ''}
                              onChange={(e) => handleDepartmentSearchChange(index, e)}
                              onFocus={() => setShowDepartmentDropdown(prev => ({ ...prev, [index]: true }))}
                              onBlur={() => handleDepartmentBlur(index)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Department..."
                              required
                            />
                            
                            {/* Department Dropdown */}
                            {showDepartmentDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredDepartments(index).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {departmentSearch[index] ? 'No departments found' : 'No departments available'}
                                  </div>
                                ) : (
                                  getFilteredDepartments(index).map((dept) => (
                                    <div
                                      key={dept}
                                      onClick={() => handleDepartmentSelect(index, dept)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        detail.department === dept ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="font-medium text-gray-900">{dept}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {departmentErrors[index] && (
                            <p className="mt-1 text-xs text-red-500">{departmentErrors[index]}</p>
                          )}
                        </div>

                        {/* Waste Type Autocomplete */}
                        <div className="col-span-2">
                          <div className="relative" ref={el => wasteRefs.current[index] = el}>
                            <input
                              type="text"
                              value={wasteSearch[index] || ''}
                              onChange={(e) => handleWasteSearchChange(index, e)}
                              onFocus={() => setShowWasteDropdown(prev => ({ ...prev, [index]: true }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Waste type..."
                              required
                            />
                            
                            {/* Waste Type Dropdown */}
                            {showWasteDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {wasteMastersLoading ? (
                                  <div className="p-3 text-center text-gray-500">Loading...</div>
                                ) : getFilteredWasteMasters(index).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {wasteSearch[index] ? 'No waste types found' : 'No waste types available'}
                                  </div>
                                ) : (
                                  getFilteredWasteMasters(index).map((waste) => (
                                    <div
                                      key={waste._id || waste.id}
                                      onClick={() => handleWasteSelect(index, waste)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        detail.wasteMasterId === (waste._id || waste.id) ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="font-medium text-gray-900">{waste.waste || waste.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {waste.department || 'No Dept'} • Code: #{formatCode(waste.code)} • {waste.wasteKg || 0}kg
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Packing Type Autocomplete */}
                        <div className="col-span-2">
                          <div className="relative" ref={el => packingRefs.current[index] = el}>
                            <input
                              type="text"
                              value={packingSearch[index] || ''}
                              onChange={(e) => handlePackingSearchChange(index, e)}
                              onFocus={() => setShowPackingDropdown(prev => ({ ...prev, [index]: true }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Packing type..."
                              required
                            />
                            
                            {/* Packing Type Dropdown */}
                            {showPackingDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {packingTypesLoading ? (
                                  <div className="p-3 text-center text-gray-500">Loading...</div>
                                ) : getFilteredPackingTypes(index).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {packingSearch[index] ? 'No packing types found' : 'No packing types available'}
                                  </div>
                                ) : (
                                  getFilteredPackingTypes(index).map((packing) => (
                                    <div
                                      key={packing._id || packing.id}
                                      onClick={() => handlePackingSelect(index, packing)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        detail.packingTypeId === (packing._id || packing.id) ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="font-medium text-gray-900">{packing.name}</div>
                                      <div className="text-xs text-gray-500">
                                        Code: #{formatCode(packing.code)}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Godown Autocomplete */}
                        <div className="col-span-2">
                          <div className="relative" ref={el => godownRefs.current[index] = el}>
                            <input
                              type="text"
                              value={godownSearch[index] || ''}
                              onChange={(e) => handleGodownSearchChange(index, e)}
                              onFocus={() => setShowGodownDropdown(prev => ({ ...prev, [index]: true }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Godown..."
                              required
                            />
                            
                            {/* Godown Dropdown */}
                            {showGodownDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {godownsLoading ? (
                                  <div className="p-3 text-center text-gray-500">Loading...</div>
                                ) : getFilteredGodowns(index).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {godownSearch[index] ? 'No godowns found' : 'No godowns available'}
                                  </div>
                                ) : (
                                  getFilteredGodowns(index).map((godown) => (
                                    <div
                                      key={godown._id || godown.id}
                                      onClick={() => handleGodownSelect(index, godown)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        detail.godownId === (godown._id || godown.id) ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="font-medium text-gray-900">{godown.godownName}</div>
                                      <div className="text-xs text-gray-500">
                                        Code: #{formatCode(godown.code)} • {godown.location || 'No Location'}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Net Weight */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={detail.netWeight}
                            onChange={(e) => handleDetailChange(index, 'netWeight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Weight (kg)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        {/* Action */}
                        <div className="col-span-1 flex items-center">
                          {formData.details.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDetailRow(index)}
                              className="text-red-500 hover:text-red-700 text-xl"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Weight */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Rows: {formData.details.length}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-600 mr-3">Total Weight:</span>
                    <span className="text-lg font-semibold text-gray-800">{calculateTotalWeight().toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
                    isEditing ? 'Update Entry' : 'Create Entry'
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
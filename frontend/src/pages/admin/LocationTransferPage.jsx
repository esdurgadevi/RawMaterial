// frontend/src/pages/admin/LocationTransferPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import locationTransferService from '../../services/admin1/transaction-cotton/locationTransferService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import godownService from '../../services/admin1/master/godownService';
import transportService from '../../services/admin1/master/transportService';

const LocationTransferPage = () => {
  // State Management
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Master Data
  const [godowns, setGodowns] = useState([]);
  const [transports, setTransports] = useState([]);
  const [lots, setLots] = useState([]); // Summary lots from getAll
  const [selectedLotDetails, setSelectedLotDetails] = useState(null); // Detailed lot with weightments

  // Form State - Header
  const [formData, setFormData] = useState({
    transferNo: '',
    transferDate: new Date().toISOString().split('T')[0], // Changed from date to transferDate
    fromLocationId: '', // Changed from from to fromLocationId
    toLocationId: '', // Changed from to to toLocationId
    transMode: 'ROAD',
    transportId: '',
    lorryNo: '',
    driverName: '',
    ownerMobile: '',
    driverMobile: '',
    itemName: 'Cotton Bale',
    qty: 0,
    kgs: 0,
    value: 0
  });

  // Selected lot and bales
  const [selectedLot, setSelectedLot] = useState(null);
  
  // Track selected bales with checkbox state
  const [selectedBaleIds, setSelectedBaleIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Search states
  const [lotSearch, setLotSearch] = useState('');
  const [showLotDropdown, setShowLotDropdown] = useState(false);
  const [loadingLotDetails, setLoadingLotDetails] = useState(false);

  // Refs
  const lotRef = useRef(null);
  const modalRef = useRef(null);

  // Transport modes
  const transportModes = ['ROAD', 'RAIL', 'AIR', 'SEA'];

  // Fetch initial data
  useEffect(() => {
    fetchTransfers();
    fetchMasterData();
    fetchLots();
  }, []);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lotRef.current && !lotRef.current.contains(event.target)) {
        setShowLotDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update select all when all bales are selected
  useEffect(() => {
    if (selectedLotDetails?.weightments) {
      const totalBales = selectedLotDetails.weightments.length;
      const selectedCount = selectedBaleIds.size;
      setSelectAll(totalBales > 0 && selectedCount === totalBales);
    }
  }, [selectedBaleIds, selectedLotDetails]);

  // Recalculate totals whenever selected bales change
  useEffect(() => {
    if (selectedLotDetails && selectedBaleIds.size > 0) {
      updateTotals();
    } else {
      setFormData(prev => ({
        ...prev,
        qty: 0,
        kgs: 0,
        value: 0
      }));
    }
  }, [selectedBaleIds, selectedLotDetails]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await locationTransferService.getAllLocationTransfers();
      setTransfers(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('Failed to fetch location transfers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [godownData, transportData] = await Promise.all([
        godownService.getAll(),
        transportService.getAll()
      ]);
      setGodowns(Array.isArray(godownData) ? godownData : []);
      setTransports(Array.isArray(transportData) ? transportData : []);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    }
  };

  const fetchLots = async () => {
    try {
      const data = await inwardLotService.getAll();
      setLots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    }
  };

  // Fetch complete lot details with weightments using getById
  const fetchLotDetails = async (lotId) => {
    try {
      setLoadingLotDetails(true);
      const lotDetails = await inwardLotService.getById(lotId);
      setSelectedLotDetails(lotDetails);
      
      // Reset bale selections
      setSelectedBaleIds(new Set());
      setSelectAll(false);
      
    } catch (error) {
      console.error('Failed to fetch lot details:', error);
      showNotification('Failed to load lot details', 'error');
      setSelectedLotDetails(null);
    } finally {
      setLoadingLotDetails(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  // Get godown name by id
  const getGodownName = (id) => {
    if (!id) return '-';
    const godown = godowns.find(g => g.id === id || g._id === id);
    return godown ? (godown.godownName || godown.name) : '-';
  };

  // Get godown id by name (for display)
  const getGodownIdByName = (name) => {
    if (!name) return null;
    const godown = godowns.find(g => (g.godownName || g.name) === name);
    return godown?.id || null;
  };

  // Get transport name by id
  const getTransportName = (id) => {
    if (!id) return '-';
    const transport = transports.find(t => t.id === id || t._id === id);
    return transport ? transport.transportName || transport.name : '-';
  };

  // Handle lot selection
  const handleLotSelect = async (lot) => {
    setSelectedLot(lot);
    setLotSearch(`${lot.lotNo} - ${lot.supplier || ''}`);
    setShowLotDropdown(false);
    
    // Fetch complete lot details with weightments
    await fetchLotDetails(lot.id);
  };

  // Filter lots based on search
  const getFilteredLots = () => {
    if (!lotSearch) return lots;
    return lots.filter(lot => {
      const lotNo = lot.lotNo?.toLowerCase() || '';
      const supplier = lot.supplier?.toLowerCase() || '';
      const searchTerm = lotSearch.toLowerCase();
      return lotNo.includes(searchTerm) || supplier.includes(searchTerm);
    });
  };

  // Handle individual checkbox change
  const handleBaleCheckboxChange = (weightmentId, checked) => {
    const newSelectedIds = new Set(selectedBaleIds);
    if (checked) {
      newSelectedIds.add(weightmentId);
    } else {
      newSelectedIds.delete(weightmentId);
    }
    setSelectedBaleIds(newSelectedIds);
  };

  // Handle select all checkbox
  const handleSelectAllChange = (checked) => {
    if (checked && selectedLotDetails?.weightments) {
      const allIds = new Set(selectedLotDetails.weightments.map(w => w.id));
      setSelectedBaleIds(allIds);
    } else {
      setSelectedBaleIds(new Set());
    }
    setSelectAll(checked);
  };

  // Update totals based on selected bales
  const updateTotals = () => {
    if (!selectedLotDetails || !selectedLotDetails.weightments) return;

    const selectedWeightments = selectedLotDetails.weightments.filter(w => 
      selectedBaleIds.has(w.id)
    );

    // Calculate total quantity
    const totalQty = selectedWeightments.length;
    
    // Calculate total kgs from weightments
    let totalKgs = 0;
    selectedWeightments.forEach(weightment => {
      const baleWeight = parseFloat(weightment.baleWeight) || 
        (parseFloat(weightment.grossWeight) - parseFloat(weightment.tareWeight) || 0);
      totalKgs += baleWeight;
    });
    
    // Calculate value based on candy rate (1 candy = 356 kg)
    const candyRate = parseFloat(selectedLotDetails.candyRate) || 
                     parseFloat(selectedLot?.candyRate) || 55600;
    const totalValue = (totalKgs / 356) * candyRate;

    setFormData(prev => ({
      ...prev,
      qty: totalQty,
      kgs: parseFloat(totalKgs.toFixed(3)),
      value: parseFloat(totalValue.toFixed(2))
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.transferNo) {
      console.log("transfer no");
      showNotification('Transfer number is required', 'error');
      return false;
    }
    if (!formData.transferDate) {
      console.log("transfer Date");
      showNotification('Date is required', 'error');
      return false;
    }
    if (!formData.fromLocationId) {
      console.log("from location");
      showNotification('From location is required', 'error');
      return false;
    }
    if (!formData.toLocationId) {
      console.log("to location");
      showNotification('To location is required', 'error');
      return false;
    }

    if (!selectedLot) {
      showNotification('Please select a lot', 'error');
      return false;
    }
    if (selectedBaleIds.size === 0) {
      showNotification('Please select at least one bale', 'error');
      return false;
    }
    return true;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      transferNo: '',
      transferDate: new Date().toISOString().split('T')[0],
      fromLocationId: '',
      toLocationId: '',
      transMode: 'ROAD',
      transportId: '',
      lorryNo: '',
      driverName: '',
      ownerMobile: '',
      driverMobile: '',
      itemName: 'Cotton Bale',
      qty: 0,
      kgs: 0,
      value: 0
    });
    setSelectedLot(null);
    setSelectedLotDetails(null);
    setSelectedBaleIds(new Set());
    setSelectAll(false);
    setLotSearch('');
    setSelectedTransfer(null);
    setIsEditing(false);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    // Generate transfer number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const nextYear = (parseInt(year) + 1).toString().padStart(2, '0');
    const transferNo = `LT/${year}-${nextYear}/` + String(transfers.length + 1).padStart(4, '0');
    setFormData(prev => ({ ...prev, transferNo }));
    setOpenModal(true);
  };

  // Open view modal
  const handleOpenViewModal = async (transfer) => {
    try {
      setModalLoading(true);
      const fullTransfer = await locationTransferService.getLocationTransferById(transfer.id || transfer._id);
      setViewTransfer(fullTransfer);
      setOpenViewModal(true);
    } catch (error) {
      showNotification('Failed to load transfer details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = async (transfer) => {
    try {
      setModalLoading(true);
      const fullTransfer = await locationTransferService.getLocationTransferById(transfer.id || transfer._id);
      
      // Map the data to form fields
      setFormData({
        transferNo: fullTransfer.transferNo || '',
        transferDate: fullTransfer.transferDate ? fullTransfer.transferDate.split('T')[0] : '',
        fromLocationId: fullTransfer.fromLocationId || getGodownIdByName(fullTransfer.from) || '',
        toLocationId: fullTransfer.toLocationId || getGodownIdByName(fullTransfer.to) || '',
        transMode: fullTransfer.transMode || 'ROAD',
        transportId: fullTransfer.transportId || '',
        lorryNo: fullTransfer.lorryNo || '',
        driverName: fullTransfer.driverName || '',
        ownerMobile: fullTransfer.ownerMobile || '',
        driverMobile: fullTransfer.driverMobile || '',
        itemName: fullTransfer.itemName || 'Cotton Bale',
        qty: fullTransfer.qty || 0,
        kgs: fullTransfer.kgs || 0,
        value: fullTransfer.value || 0
      });

      // Set selected lot and bales if available
      if (fullTransfer.details && fullTransfer.details.length > 0) {
        const firstDetail = fullTransfer.details[0];
        if (firstDetail.lotId) {
          // Find the lot from lots array
          const lot = lots.find(l => l.id === firstDetail.lotId);
          if (lot) {
            setSelectedLot(lot);
            setLotSearch(`${lot.lotNo} - ${lot.supplier || ''}`);
            
            // Fetch complete lot details with weightments
            await fetchLotDetails(lot.id);
            
            // Collect all bale IDs from all details
            const baleIds = new Set();
            fullTransfer.details.forEach(detail => {
              if (detail.bales) {
                detail.bales.forEach(bale => {
                  baleIds.add(bale.weightmentId);
                });
              }
            });
            setSelectedBaleIds(baleIds);
          }
        }
      }

      setSelectedTransfer(fullTransfer);
      setIsEditing(true);
      setOpenModal(true);
    } catch (error) {
      showNotification('Failed to load transfer details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Close modals
  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setViewTransfer(null);
  };

  // Submit form - UPDATED to match backend structure
  const handleSubmit = async () => {
    if (!validateForm()) 
    {
        console.log("not validate");
        return;
    }
    try {
      setModalLoading(true);
      
      // Group selected bales by lot
      // In this case, we're only selecting from one lot
      const details = [{
        lotId: selectedLot.id,
        stockQty: selectedBaleIds.size, // Total bales selected
        transferQty: selectedBaleIds.size, // Transfer all selected bales
        weightmentIds: Array.from(selectedBaleIds) // Array of bale IDs
      }];
      
      // Prepare submit data in the exact format backend expects
      const submitData = {
        transferNo: formData.transferNo,
        transferDate: formData.transferDate, // Note: field name is transferDate, not date
        fromLocationId: parseInt(formData.fromLocationId),
        toLocationId: parseInt(formData.toLocationId),
        transMode: formData.transMode,
        transportId: formData.transportId ? parseInt(formData.transportId) : null,
        lorryNo: formData.lorryNo || null,
        driverName: formData.driverName || null,
        ownerMobile: formData.ownerMobile || null,
        driverMobile: formData.driverMobile || null,
        itemName: formData.itemName,
        qty: formData.qty,
        kgs: parseFloat(formData.kgs),
        value: parseFloat(formData.value),
        details: details
      };
      
      console.log('Submitting data:', JSON.stringify(submitData, null, 2));
      
      if (isEditing && selectedTransfer) {
        // Note: Your backend update only updates header, not details
        await locationTransferService.updateLocationTransfer(selectedTransfer.id || selectedTransfer._id, submitData);
        showNotification('Location transfer updated successfully');
      } else {
        await locationTransferService.createLocationTransfer(submitData);
        showNotification('Location transfer created successfully');
      }
      
      await fetchTransfers();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      showNotification(error.response?.data?.message || error.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete transfer
  const handleDelete = async (transfer) => {
    const id = transfer.id || transfer._id;
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        setLoading(true);
        await locationTransferService.deleteLocationTransfer(id);
        showNotification('Location transfer deleted successfully');
        await fetchTransfers();
      } catch (error) {
        showNotification('Failed to delete transfer', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
        } border px-4 py-3 rounded-lg shadow-lg max-w-md`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-4 text-xl hover:text-gray-700"
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Location Transfer</h1>
            <p className="text-gray-600 mt-1">Manage inter-godown transfers of cotton bales</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200"
          >
            <span className="mr-2 text-xl">+</span>
            New Transfer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <span className="text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-800">{transfers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <span className="text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Transfers</p>
              <p className="text-2xl font-bold text-gray-800">
                {transfers.filter(t => {
                  const today = new Date().toISOString().split('T')[0];
                  return t.transferDate === today;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <span className="text-xl">⚖️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kgs</p>
              <p className="text-2xl font-bold text-gray-800">
                {transfers.reduce((sum, t) => sum + (parseFloat(t.kgs) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <span className="text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{transfers.reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Location Transfers</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lorry No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kgs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    No location transfers found. Create your first transfer!
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr key={transfer.id || transfer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transfer.transferNo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(transfer.transferDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.from || getGodownName(transfer.fromLocationId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.to || getGodownName(transfer.toLocationId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transfer.transMode === 'ROAD' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {transfer.transMode || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.lorryNo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{transfer.qty || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.kgs ? Number(transfer.kgs).toLocaleString() : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {transfer.value ? `₹${Number(transfer.value).toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleOpenViewModal(transfer)}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(transfer)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transfer)}
                          className="text-red-600 hover:text-red-800 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Location Transfer' : 'New Location Transfer'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={modalLoading}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Section */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Details</h4>
                
                {/* First Row - Transfer No, Date, From, To */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Transfer No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transferNo"
                      value={formData.transferNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="LT/26-27/0001"
                      disabled={modalLoading || isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="transferDate"
                      value={formData.transferDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      From <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fromLocationId"
                      value={formData.fromLocationId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      <option value="">Select Godown</option>
                      {godowns.map(godown => (
                        <option key={godown.id} value={godown.id}>
                          {godown.godownName || godown.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      To <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="toLocationId"
                      value={formData.toLocationId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      <option value="">Select Godown</option>
                      {godowns.map(godown => (
                        <option key={godown.id} value={godown.id}>
                          {godown.godownName || godown.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Second Row - Trans Mode, Lorry No, Owner Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Trans Mode
                    </label>
                    <select
                      name="transMode"
                      value={formData.transMode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      {transportModes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Lorry No
                    </label>
                    <input
                      type="text"
                      name="lorryNo"
                      value={formData.lorryNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="TN01AB1234"
                      disabled={modalLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Owner Mobile
                    </label>
                    <input
                      type="text"
                      name="ownerMobile"
                      value={formData.ownerMobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="9876543210"
                      disabled={modalLoading}
                    />
                  </div>
                </div>

                {/* Third Row - Transport, Driver Name, Driver Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Transport
                    </label>
                    <select
                      name="transportId"
                      value={formData.transportId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      <option value="">Select Transport</option>
                      {transports.map(transport => (
                        <option key={transport.id} value={transport.id}>
                          {transport.transportName || transport.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ramesh"
                      disabled={modalLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Driver Mobile
                    </label>
                    <input
                      type="text"
                      name="driverMobile"
                      value={formData.driverMobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="9123456780"
                      disabled={modalLoading}
                    />
                  </div>
                </div>

                {/* Fourth Row - Item Name */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Cotton Bale"
                      disabled={modalLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Lot Selection Section */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Lot Selection</h4>
                
                {/* Lot Search */}
                <div className="relative mb-4" ref={lotRef}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Search Lot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lotSearch}
                    onChange={(e) => {
                      setLotSearch(e.target.value);
                      setShowLotDropdown(true);
                    }}
                    onFocus={() => setShowLotDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search by lot number..."
                    disabled={modalLoading || loadingLotDetails}
                  />
                  
                  {showLotDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredLots().length === 0 ? (
                        <div className="p-3 text-center text-gray-500">No lots found</div>
                      ) : (
                        getFilteredLots().map(lot => {
                          const nettWeight = lot.nettWeight || '';
                          const balesQty = lot.qty || 0;
                          return (
                            <div
                              key={lot.id}
                              onClick={() => handleLotSelect(lot)}
                              className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{lot.lotNo}</div>
                              <div className="text-xs text-gray-500">
                                Nett Wt: {nettWeight} • Available: {balesQty} bales
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Loading Indicator for Lot Details */}
                {loadingLotDetails && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Loading lot details...</span>
                    </div>
                  </div>
                )}

                {/* Selected Lot Info */}
                {selectedLot && selectedLotDetails && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Selected Lot</p>
                        <p className="text-sm font-medium text-gray-900">{selectedLot.lotNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Bales</p>
                        <p className="text-sm font-medium text-gray-900">{selectedLotDetails.qty || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nett Weight</p>
                        <p className="text-sm font-medium text-gray-900">{selectedLotDetails.nettWeight || 0} kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bale Selection Section */}
              {selectedLotDetails && selectedLotDetails.weightments && selectedLotDetails.weightments.length > 0 && (
                <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium text-gray-700">Select Bales to Transfer</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {selectedBaleIds.size} of {selectedLotDetails.weightments.length} selected
                      </span>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => handleSelectAllChange(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={modalLoading}
                        />
                        <span className="text-sm text-gray-700">Select All</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-4 py-3">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bale Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gross Weight (kg)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tare Weight (kg)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Weight (kg)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedLotDetails.weightments.map((weightment) => {
                          const grossWeight = parseFloat(weightment.grossWeight) || 0;
                          const tareWeight = parseFloat(weightment.tareWeight) || 0;
                          const netWeight = parseFloat(weightment.baleWeight) || (grossWeight - tareWeight);
                          const candyRate = parseFloat(selectedLotDetails.candyRate) || 
                                           parseFloat(selectedLot?.candyRate) || 55600;
                          const baleValue = (netWeight / 356) * candyRate;
                          
                          return (
                            <tr 
                              key={weightment.id}
                              className={`hover:bg-gray-50 ${
                                selectedBaleIds.has(weightment.id) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedBaleIds.has(weightment.id)}
                                  onChange={(e) => handleBaleCheckboxChange(weightment.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  disabled={modalLoading}
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {weightment.baleNo || `Bale #${weightment.id}`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {grossWeight.toFixed(3)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {tareWeight.toFixed(3)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {netWeight.toFixed(3)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ₹{baleValue.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary Section */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Quantity (Bales)
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Kgs
                    </label>
                    <input
                      type="text"
                      value={formData.kgs}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Value (₹)
                    </label>
                    <input
                      type="text"
                      value={formData.value}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
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
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={modalLoading || loadingLotDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 min-w-[100px] justify-center"
                >
                  {modalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    isEditing ? 'Update' : 'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {openViewModal && viewTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Location Transfer Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transfer No</p>
                    <p className="text-base font-medium text-gray-900">{viewTransfer.transferNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transfer Date</p>
                    <p className="text-base text-gray-900">{formatDate(viewTransfer.transferDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">From Location</p>
                    <p className="text-base text-gray-900">{viewTransfer.from || getGodownName(viewTransfer.fromLocationId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">To Location</p>
                    <p className="text-base text-gray-900">{viewTransfer.to || getGodownName(viewTransfer.toLocationId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transport Mode</p>
                    <p className="text-base text-gray-900">{viewTransfer.transMode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lorry No</p>
                    <p className="text-base text-gray-900">{viewTransfer.lorryNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transport</p>
                    <p className="text-base text-gray-900">{viewTransfer.transport?.transportName || getTransportName(viewTransfer.transportId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Name</p>
                    <p className="text-base text-gray-900">{viewTransfer.driverName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Owner Mobile</p>
                    <p className="text-base text-gray-900">{viewTransfer.ownerMobile || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Mobile</p>
                    <p className="text-base text-gray-900">{viewTransfer.driverMobile || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Item Name</p>
                    <p className="text-base text-gray-900">{viewTransfer.itemName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              {viewTransfer.details && viewTransfer.details.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Details</h4>
                  {viewTransfer.details.map((detail, idx) => (
                    <div key={idx} className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Lot: {detail.lot?.lotNo || detail.lotId}</h5>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale Number</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {detail.bales && detail.bales.map((bale, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {bale.weightment?.baleNo || `Bale #${bale.weightmentId}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {bale.weightment?.baleWeight || 
                                   (bale.weightment ? 
                                    (parseFloat(bale.weightment.grossWeight) - parseFloat(bale.weightment.tareWeight)).toFixed(3) : '-')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  ₹{bale.weightment?.baleValue?.toFixed(2) || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">{viewTransfer.qty || 0} Bales</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Weight</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewTransfer.kgs ? `${Number(viewTransfer.kgs).toLocaleString()} kgs` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewTransfer.value ? `₹${Number(viewTransfer.value).toLocaleString()}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <div>
                  <p>Created: {viewTransfer.createdAt ? new Date(viewTransfer.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p>Last Updated: {viewTransfer.updatedAt ? new Date(viewTransfer.updatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTransferPage;
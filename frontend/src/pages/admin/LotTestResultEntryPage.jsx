// frontend/src/pages/admin/LotTestResultEntryPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import lotEntryService from '../../services/admin1/transaction-cotton/lotEntryService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';

const LotTestResultEntryPage = () => {
  // State Management
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState(null);

  // Form State - Only fields from the model
  const [formData, setFormData] = useState({
    lotId: '',
    permitNo: '',
    rd: '',
    staple: '',
    plusB: '',
    moist: '',
    mr: '',
    twoPointFive: '',
    grade: '',
    ui: '',
    eLog: '',
    strength: '', // This is the primary strength field
    sfi: '',
    mic: '',
    ml50: '',
    strMode: 'HVI',
    conStaple: '',
    sci: '',
    strength1: '' // New field for auto-calculated/second strength
  });

  // Display fields for lot information (not part of form submission)
  const [lotDisplay, setLotDisplay] = useState({
    lotNo: '',
    lotDate: '',
    billNo: '',
    billDate: '',
    supplier: '',
    variety: '',
    station: '',
    candyRate: '',
    weight: ''
  });

  // Search states
  const [lotSearch, setLotSearch] = useState('');
  const [showLotDropdown, setShowLotDropdown] = useState(false);

  // Refs
  const lotRef = useRef(null);
  const modalRef = useRef(null);

  // Test modes - matching model ENUM
  const strModes = ['ICC', 'HVI'];

  // Fetch initial data
  useEffect(() => {
    fetchEntries();
    fetchLots();
  }, []);

  // Calculate second strength based on strMode
  useEffect(() => {
    if (formData.strength) {
      const strengthValue = parseFloat(formData.strength);
      if (!isNaN(strengthValue)) {
        if (formData.strMode === 'HVI') {
          // For HVI mode: second strength = strength / 1.28
          const calculatedStrength = (strengthValue / 1.28).toFixed(2);
          setFormData(prev => ({
            ...prev,
            strength1: calculatedStrength
          }));
        } else if (formData.strMode === 'ICC') {
          // For ICC mode: second strength = same as strength
          setFormData(prev => ({
            ...prev,
            strength1: strengthValue
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        strength1: ''
      }));
    }
  }, [formData.strength, formData.strMode]);

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

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await lotEntryService.getAllLots();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('Failed to fetch lot test entries', 'error');
    } finally {
      setLoading(false);
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
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle lot selection with proper data mapping from the API response
  const handleLotSelect = async (lot) => {
    try {
      setModalLoading(true);
      
      // Get the lot ID
      const lotId = lot.id || lot._id;
      console.log('Selected lot:', lot);
      console.log('Fetching details for lot ID:', lotId);
      
      // Fetch complete lot details using getById
      const completeLot = await inwardLotService.getById(lotId);
      console.log('Complete lot details:', completeLot);
      
      setSelectedLot(completeLot);
      setSelectedLotId(lotId);
      
      // Extract data from the complete lot details - handle different possible structures
      const inwardEntry = completeLot.InwardEntry || completeLot.inwardEntry || {};
      const purchaseOrder = inwardEntry.purchaseOrder || inwardEntry.PurchaseOrder || {};
      const supplier = completeLot.supplier || {};
      const variety = completeLot.variety || {};
      const station = completeLot.station || purchaseOrder.Station || {};

      // Set lot display information (read-only) - including bill details from inward entry
      setLotDisplay({
        lotNo: completeLot.lotNo || completeLot.lot_number || '',
        lotDate: completeLot.lotDate || completeLot.lot_date || '',
        billNo: completeLot.billNo || '',
        billDate: completeLot.billDate || inwardEntry.bill_date || '',
        supplier: supplier ||  '',
        variety: variety ||  '',
        station: station || '',
        candyRate: completeLot.candyRate || '',
        weight: completeLot.nettWeight || completeLot.weight || inwardEntry.nettWeight || ''
      });

      // Set form data with lotId and pre-filled values from purchase order if available
      setFormData(prev => ({
        ...prev,
        lotId: lotId,
        permitNo: inwardEntry.permitNo || purchaseOrder.permit_no || '',
        staple: purchaseOrder.staple || '',
        moist: purchaseOrder.moist || '',
        strength: purchaseOrder.str || purchaseOrder.strength || '',
        mic: purchaseOrder.mic || '',
        // Other fields remain empty for user to fill
        rd: '',
        plusB: '',
        mr: '',
        twoPointFive: '',
        grade: '',
        ui: '',
        eLog: '',
        sfi: '',
        ml50: '',
        strMode: 'HVI',
        conStaple: '',
        sci: '',
        strength1: '' // Reset strength1 when lot changes
      }));

      setLotSearch(`${completeLot.lotNo || completeLot.lot_number} - ${supplier.accountName || supplier.name || purchaseOrder.supplierName || ''}`);
      setShowLotDropdown(false);
      
      showNotification('Lot details loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to fetch complete lot details:', error);
      showNotification('Failed to load lot details: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Filter lots based on search
  const getFilteredLots = () => {
    if (!lotSearch) return lots;
    return lots.filter(lot => {
      const lotNo = lot.lotNo?.toLowerCase() || '';
      const supplier = lot.InwardEntry?.purchaseOrder?.supplier?.accountName?.toLowerCase() || 
                      lot.InwardEntry?.purchaseOrder?.supplierName?.toLowerCase() || '';
      const searchTerm = lotSearch.toLowerCase();
      
      return lotNo.includes(searchTerm) || supplier.includes(searchTerm);
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      lotId: '',
      permitNo: '',
      rd: '',
      staple: '',
      plusB: '',
      moist: '',
      mr: '',
      twoPointFive: '',
      grade: '',
      ui: '',
      eLog: '',
      strength: '',
      sfi: '',
      mic: '',
      ml50: '',
      strMode: 'HVI',
      conStaple: '',
      sci: '',
      strength1: ''
    });
    setLotDisplay({
      lotNo: '',
      lotDate: '',
      billNo: '',
      billDate: '',
      supplier: '',
      variety: '',
      station: '',
      candyRate: '',
      weight: ''
    });
    setLotSearch('');
    setSelectedLot(null);
    setSelectedLotId(null);
    setSelectedEntry(null);
    setIsEditing(false);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    setOpenModal(true);
  };

  // Open view modal
  const handleOpenViewModal = async (entry) => {
    try {
      setModalLoading(true);
      const fullEntry = await lotEntryService.getLotEntryById(entry.id || entry._id);
      setViewEntry(fullEntry);
      setOpenViewModal(true);
    } catch (error) {
      showNotification('Failed to load entry details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = async (entry) => {
    try {
      setModalLoading(true);
      const fullEntry = await lotEntryService.getLotEntryById(entry.id || entry._id);
      
      // Map the response to form fields
      setFormData({
        lotId: fullEntry.lotId || '',
        permitNo: fullEntry.permitNo || '',
        rd: fullEntry.rd || '',
        staple: fullEntry.staple || '',
        plusB: fullEntry.plusB || '',
        moist: fullEntry.moist || '',
        mr: fullEntry.mr || '',
        twoPointFive: fullEntry.twoPointFive || '',
        grade: fullEntry.grade || '',
        ui: fullEntry.ui || '',
        eLog: fullEntry.eLog || '',
        strength: fullEntry.strength || '',
        sfi: fullEntry.sfi || '',
        mic: fullEntry.mic || '',
        ml50: fullEntry.ml50 || '',
        strMode: fullEntry.strMode || 'HVI',
        conStaple: fullEntry.conStaple || '',
        sci: fullEntry.sci || '',
        strength1: fullEntry.strength1 || '' // Include strength1 if it exists
      });

      // Set lot display information if available in the response
      if (fullEntry.lotNo) {
        setLotDisplay({
          lotNo: fullEntry.lotNo || '',
          lotDate: fullEntry.lotDate || '',
          billNo: fullEntry.billNo || '',
          billDate: fullEntry.billDate || '',
          supplier: fullEntry.supplier || '',
          variety: fullEntry.variety || '',
          station: fullEntry.station || '',
          candyRate: fullEntry.candyRate || '',
          weight: fullEntry.weight || ''
        });
        setLotSearch(fullEntry.lotNo);
      }

      setSelectedEntry(fullEntry);
      setIsEditing(true);
      setOpenModal(true);
    } catch (error) {
      showNotification('Failed to load entry details', 'error');
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
    setViewEntry(null);
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
    if (!formData.lotId) {
      showNotification('Please select a lot', 'error');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setModalLoading(true);
      
      // Prepare data - only send fields that are in the model
      const submitData = {
        lotId: formData.lotId,
        permitNo: formData.permitNo || null,
        rd: formData.rd ? parseFloat(formData.rd) : null,
        staple: formData.staple ? parseFloat(formData.staple) : null,
        plusB: formData.plusB ? parseFloat(formData.plusB) : null,
        moist: formData.moist ? parseFloat(formData.moist) : null,
        mr: formData.mr ? parseFloat(formData.mr) : null,
        twoPointFive: formData.twoPointFive ? parseFloat(formData.twoPointFive) : null,
        grade: formData.grade || null,
        ui: formData.ui ? parseFloat(formData.ui) : null,
        eLog: formData.eLog ? parseFloat(formData.eLog) : null,
        strength: formData.strength ? parseFloat(formData.strength) : null,
        sfi: formData.sfi ? parseFloat(formData.sfi) : null,
        mic: formData.mic ? parseFloat(formData.mic) : null,
        ml50: formData.ml50 ? parseFloat(formData.ml50) : null,
        strMode: formData.strMode || null,
        conStaple: formData.conStaple || null,
        sci: formData.sci ? parseFloat(formData.sci) : null,
        strength1: formData.strength1 ? parseFloat(formData.strength1) : null // Add strength1 to submission
      };
      
      if (isEditing && selectedEntry) {
        await lotEntryService.updateLotEntry(selectedEntry.id || selectedEntry._id, submitData);
        showNotification('Lot test entry updated successfully');
      } else {
        console.log('Submitting:', submitData);
        await lotEntryService.createLotEntry(submitData);
        showNotification('Lot test entry created successfully');
      }
      
      await fetchEntries();
      handleCloseModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete entry
  const handleDelete = async (entry) => {
    const id = entry.id || entry._id;
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        await lotEntryService.deleteLotEntry(id);
        showNotification('Lot test entry deleted successfully');
        await fetchEntries();
      } catch (error) {
        showNotification('Failed to delete entry', 'error');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lot Test Result Entry</h1>
            <p className="text-gray-600 mt-1">Manage cotton lot test results and quality parameters</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200"
          >
            <span className="mr-2 text-xl">+</span>
            New Test Result
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <span className="text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
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
              <p className="text-sm font-medium text-gray-600">Today's Tests</p>
              <p className="text-2xl font-bold text-gray-800">
                {entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <span className="text-xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Strength</p>
              <p className="text-2xl font-bold text-gray-800">
                {entries.length > 0 
                  ? (entries.reduce((sum, e) => sum + (parseFloat(e.strength) || 0), 0) / entries.length).toFixed(1)
                  : '0'} g/tex
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <span className="text-xl">📏</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Staple</p>
              <p className="text-2xl font-bold text-gray-800">
                {entries.length > 0 
                  ? (entries.reduce((sum, e) => sum + (parseFloat(e.staple) || 0), 0) / entries.length).toFixed(1)
                  : '0'} mm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Lot Test Results</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staple</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SCI</th>
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
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    No test results found. Create your first entry!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id || entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.lot?.lotNo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(entry.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.lot?.InwardEntry?.purchaseOrder?.supplier?.accountName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.lot?.InwardEntry?.purchaseOrder?.variety?.variety || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{entry.staple || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.strength || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.mic || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.grade || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{entry.sci || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleOpenViewModal(entry)}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(entry)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry)}
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
                {isEditing ? 'Edit Lot Test Result' : 'New Lot Test Result'}
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
              {/* Lot Selection */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Select Lot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative dropdown-container" ref={lotRef}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Search Lot <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lotSearch}
                      onChange={(e) => {
                        setLotSearch(e.target.value);
                        setShowLotDropdown(true);
                        if (selectedLot) {
                          setSelectedLot(null);
                          setSelectedLotId(null);
                          setLotDisplay({
                            lotNo: '',
                            lotDate: '',
                            billNo: '',
                            billDate: '',
                            supplier: '',
                            variety: '',
                            station: '',
                            candyRate: '',
                            weight: ''
                          });
                          setFormData(prev => ({
                            ...prev,
                            lotId: '',
                            permitNo: ''
                          }));
                        }
                      }}
                      onFocus={() => setShowLotDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder=""
                      disabled={modalLoading || isEditing}
                    />
                    
                    {showLotDropdown && !isEditing && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getFilteredLots().length === 0 ? (
                          <div className="p-3 text-center text-gray-500">No lots found</div>
                        ) : (
                          getFilteredLots().map(lot => {
                            const nettWeight = lot.nettWeight || '';
                            const qty = lot.qty || 0;
                            return (
                              <div
                                key={lot.id || lot._id}
                                onClick={() => handleLotSelect(lot)}
                                className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{lot.lotNo}</div>
                                <div className="text-xs text-gray-500">
                                  {qty} • {nettWeight} 
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lot Information Display (Read-only) */}
                {selectedLot && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Lot No.</p>
                      <p className="text-sm font-medium text-gray-900">{lotDisplay.lotNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lot Date</p>
                      <p className="text-sm text-gray-900">{lotDisplay.lotDate ? formatDate(lotDisplay.lotDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bill No.</p>
                      <p className="text-sm text-gray-900">{lotDisplay.billNo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bill Date</p>
                      <p className="text-sm text-gray-900">{lotDisplay.billDate ? formatDate(lotDisplay.billDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Supplier</p>
                      <p className="text-sm text-gray-900">{lotDisplay.supplier || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variety</p>
                      <p className="text-sm text-gray-900">{lotDisplay.variety || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Station</p>
                      <p className="text-sm text-gray-900">{lotDisplay.station || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Candy Rate</p>
                      <p className="text-sm text-gray-900">{lotDisplay.candyRate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-sm text-gray-900">{lotDisplay.weight || '-'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Results Grid - Matching Model Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Row 1 - Basic Test Results */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Permit No</label>
                  <input
                    type="text"
                    name="permitNo"
                    value={formData.permitNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">RD</label>
                  <input
                    type="number"
                    name="rd"
                    value={formData.rd}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Staple</label>
                  <input
                    type="number"
                    name="staple"
                    value={formData.staple}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                {/* Row 2 - More Test Results */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">+B</label>
                  <input
                    type="number"
                    name="plusB"
                    value={formData.plusB}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Moist</label>
                  <input
                    type="number"
                    name="moist"
                    value={formData.moist}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">MR</label>
                  <input
                    type="number"
                    name="mr"
                    value={formData.mr}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.01"
                    disabled={modalLoading}
                  />
                </div>

                {/* Row 3 - More Test Results */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">2.5%</label>
                  <input
                    type="number"
                    name="twoPointFive"
                    value={formData.twoPointFive}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.01"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Grade</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">UI</label>
                  <input
                    type="number"
                    name="ui"
                    value={formData.ui}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                {/* Row 4 - More Test Results */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">E Log</label>
                  <input
                    type="number"
                    name="eLog"
                    value={formData.eLog}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Strength</label>
                  <input
                    type="number"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Strength 1</label>
                  <input
                    type="number"
                    name="strength1"
                    value={formData.strength1}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                    placeholder=""
                    step="0.1"
                    disabled={true}
                    readOnly
                  />
                </div>

                {/* Row 5 - More Test Results */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">SFI</label>
                  <input
                    type="number"
                    name="sfi"
                    value={formData.sfi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Mic</label>
                  <input
                    type="number"
                    name="mic"
                    value={formData.mic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">ML 50%</label>
                  <input
                    type="number"
                    name="ml50"
                    value={formData.ml50}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="0.1"
                    disabled={modalLoading}
                  />
                </div>

                {/* Row 6 - Final Test Results */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Str. Mode</label>
                  <select
                    name="strMode"
                    value={formData.strMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={modalLoading}
                  >
                    {strModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">Con. Staple</label>
                  <input
                    type="text"
                    name="conStaple"
                    value={formData.conStaple}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    disabled={modalLoading}
                  />
                </div>

                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1">SCI</label>
                  <input
                    type="number"
                    name="sci"
                    value={formData.sci}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder=""
                    step="1"
                    disabled={modalLoading}
                  />
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
                  disabled={modalLoading}
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
      {openViewModal && viewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Lot Test Result Details</h3>
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
                <h4 className="text-base font-medium text-gray-700 mb-4">Lot Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Lot No.</p>
                    <p className="text-base font-medium text-gray-900">{viewEntry.lot?.lotNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Test Date</p>
                    <p className="text-base text-gray-900">{formatDate(viewEntry.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="text-base text-gray-900">
                      {viewEntry.lot?.InwardEntry?.purchaseOrder?.supplier?.accountName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variety</p>
                    <p className="text-base text-gray-900">
                      {viewEntry.lot?.InwardEntry?.purchaseOrder?.variety?.variety || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Station</p>
                    <p className="text-base text-gray-900">
                      {viewEntry.lot?.InwardEntry?.purchaseOrder?.station?.station || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bill No.</p>
                    <p className="text-base text-gray-900">
                      {viewEntry.lot?.InwardEntry?.billNo || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bill Date</p>
                    <p className="text-base text-gray-900">
                      {viewEntry.lot?.InwardEntry?.billDate ? formatDate(viewEntry.lot.InwardEntry.billDate) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Candy Rate</p>
                    <p className="text-base text-gray-900">
                      {viewEntry.lot?.InwardEntry?.purchaseOrder?.candyRate || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-700 mb-4">Test Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Permit No</p>
                    <p className="text-base font-semibold">{viewEntry.permitNo || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">RD</p>
                    <p className="text-base font-semibold">{viewEntry.rd || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Staple</p>
                    <p className="text-base font-semibold">{viewEntry.staple || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">+B</p>
                    <p className="text-base font-semibold">{viewEntry.plusB || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Moist</p>
                    <p className="text-base font-semibold">{viewEntry.moist || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">MR</p>
                    <p className="text-base font-semibold">{viewEntry.mr || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">2.5%</p>
                    <p className="text-base font-semibold">{viewEntry.twoPointFive || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Grade</p>
                    <p className="text-base font-semibold">{viewEntry.grade || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">UI</p>
                    <p className="text-base font-semibold">{viewEntry.ui || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">E Log</p>
                    <p className="text-base font-semibold">{viewEntry.eLog || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Strength</p>
                    <p className="text-base font-semibold">{viewEntry.strength || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Strength 1</p>
                    <p className="text-base font-semibold">{viewEntry.strength1 || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">SFI</p>
                    <p className="text-base font-semibold">{viewEntry.sfi || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Mic</p>
                    <p className="text-base font-semibold">{viewEntry.mic || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">ML 50%</p>
                    <p className="text-base font-semibold">{viewEntry.ml50 || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Str. Mode</p>
                    <p className="text-base font-semibold">{viewEntry.strMode || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Con. Staple</p>
                    <p className="text-base font-semibold">{viewEntry.conStaple || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">SCI</p>
                    <p className="text-base font-semibold">{viewEntry.sci || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <div>
                  <p>Created: {viewEntry.createdAt ? new Date(viewEntry.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p>Last Updated: {viewEntry.updatedAt ? new Date(viewEntry.updatedAt).toLocaleString() : 'N/A'}</p>
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

export default LotTestResultEntryPage;
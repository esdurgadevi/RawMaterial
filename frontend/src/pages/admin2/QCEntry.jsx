import React, { useState, useEffect } from 'react';
import qcEntryService from '../../services/admin2/transaction-qc/qcEntryService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import inwardEntryService from '../../services/admin1/transaction-cotton/inwardEntryService';
import purchaseOrderService from '../../services/admin1/transaction-cotton/purchaseOrderService';
import supplierService from '../../services/admin1/master/supplierService';
import varietyService from '../../services/admin1/master/varietyService';
import stationService from '../../services/admin1/master/stationService';

const QCEntryManagement = () => {
  // View states: 'list', 'view', 'edit', 'create'
  const [currentView, setCurrentView] = useState('list');
  const [selectedLotNo, setSelectedLotNo] = useState('');
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  // List view states
  const [qcEntries, setQcEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lotDetails, setLotDetails] = useState({});
  
  // Detail view states
  const [lots, setLots] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [strMode, setStrMode] = useState('HVI'); // Default as per model
  const [lotData, setLotData] = useState(null);
  const [inwardData, setInwardData] = useState(null);
  const [poData, setPoData] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [varietyData, setVarietyData] = useState(null);
  const [stationData, setStationData] = useState(null);
  
  // QC Form fields - matching model field names
  const [formData, setFormData] = useState({
    // Read-only fields from lot/inward
    candyRate: '',
    weight: '',
    permitNo: '',
    
    // Test fields (matching model)
    rd: '',
    staple: '',
    plusB: '',
    moist: '',
    mr: '',
    twoPointFiveMm: '', // 2.5mm in model
    grade: '',
    ui: '',
    eLog: '',
    strength: '',
    sfi: '', // This might be sfcStaple or something else in model
    mic: '',
    ml50: '',
    sfcn: '', // sfcN in model
    conStaple: '',
    tsfn: '', // tsfN in model
    sfcw: '', // sfcCW in model
    neps: '',
    tsfw: '', // tsfW in model
    sci: '',
    fqi: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchQCEntries = async () => {
    setLoading(true);
    try {
      // Fetch all QC entries directly from the API
      const entries = await qcEntryService.getAll();
      console.log("Fetched QC entries:", entries);
      
      // If entries is an array, set it directly
      if (Array.isArray(entries)) {
        setQcEntries(entries);
        
        // Also fetch lot details for each entry to get supplier info
        const tempLotDetails = {};
        for (const entry of entries) {
          try {
            const lotResponse = await inwardLotService.getByLotNo(entry.lotNo);
            if (lotResponse?.lot) {
              tempLotDetails[entry.lotNo] = lotResponse.lot;
            }
          } catch (error) {
            console.log(`Could not fetch lot details for ${entry.lotNo}`);
          }
        }
        setLotDetails(tempLotDetails);
      } else {
        console.error("Unexpected response format:", entries);
        setQcEntries([]);
      }
    } catch (error) {
      console.error('Error fetching QC entries:', error);
      setQcEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'list') {
      fetchQCEntries();
    } else if (currentView === 'create') {
      loadLotsForSelection();
    }
  }, [currentView]);

  const loadLotsForSelection = async () => {
    try {
      const response = await inwardLotService.getAllLotNumbers();
      const lotsList = response?.lots || response || [];
      setLots(lotsList);
    } catch (error) {
      console.error('Error loading lots:', error);
    }
  };

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadLotDetails = async (lotNo) => {
    if (!lotNo) return;
    
    setDetailLoading(true);
    try {
      // First, get all lots to find the one with matching lotNo
      const response = await inwardLotService.getAllLotNumbers();
      const lotsList = response?.lots || response || [];
      const foundLot = lotsList.find(l => l.lotNo === lotNo);
      
      if (!foundLot) {
        console.error("Lot not found with number:", lotNo);
        setDetailLoading(false);
        return;
      }

      setSelectedLotId(foundLot.id);
      setLotData(foundLot);

      // Fetch inward entry using the lot's inwardId
      if (foundLot.inwardId) {
        const inward = await inwardEntryService.getById(foundLot.inwardId);
        setInwardData(inward);
        
        setFormData(prev => ({
          ...prev,
          candyRate: foundLot.candyRate || '',
          weight: foundLot.nettWeight || '',
          permitNo: inward.permitNo || '',
        }));

        // Fetch purchase order using inward's purchaseOrderId
        if (inward?.purchaseOrderId) {
          const po = await purchaseOrderService.getById(inward.purchaseOrderId);
          setPoData(po);
          
          setFormData(prev => ({
            ...prev,
            rd: po.rd || '',
            staple: po.staple || '',
          }));

          // Fetch supplier using po's supplierId
          if (po?.supplierId) {
            const supplier = await supplierService.getById(po.supplierId);
            setSupplierData(supplier);
          }

          // Fetch variety using po's varietyId
          if (po?.varietyId) {
            const variety = await varietyService.getById(po.varietyId);
            setVarietyData(variety);
          }

          // Fetch station using po's stationId
          if (po?.stationId) {
            const station = await stationService.getById(po.stationId);
            setStationData(station);
          }
        }
      }

      // For view/edit mode, fetch the QC entry by its ID
      if ((currentView === 'view' || currentView === 'edit') && selectedEntryId) {
        try {
          console.log("Fetching QC entry by ID:", selectedEntryId);
          const qcEntry = await qcEntryService.getById(selectedEntryId);
          console.log("QC entry received:", qcEntry);
          
          if (qcEntry) {
            setFormData(prev => ({
              ...prev,
              // QC entry fields
              plusB: qcEntry.plusB || '',
              moist: qcEntry.moist || '',
              mr: qcEntry.mr || '',
              twoPointFiveMm: qcEntry.twoPointFiveMm || '',
              grade: qcEntry.grade || '',
              ui: qcEntry.ui || '',
              eLog: qcEntry.eLog || '',
              strength: qcEntry.strength || '',
              sfi: qcEntry.sfcStaple || '',
              mic: qcEntry.mic || '',
              ml50: qcEntry.ml50 || '',
              sfcn: qcEntry.sfcN || '',
              conStaple: qcEntry.conStaple || '',
              tsfn: qcEntry.tsfN || '',
              sfcw: qcEntry.sfcCW || '',
              neps: qcEntry.neps || '',
              tsfw: qcEntry.tsfW || '',
              sci: qcEntry.sci || '',
              fqi: qcEntry.fqi || '',
            }));
            
            setStrMode(qcEntry.strMode || 'HVI');
          }
        } catch (error) {
          console.error("Error fetching QC entry by ID:", error);
        }
      }
      // For create mode, check if there's an existing entry by lot number
      else if (currentView === 'create') {
        try {
          const qcEntry = await qcEntryService.getByLotId(lotNo);
          if (qcEntry) {
            // If entry exists, populate the form
            setFormData(prev => ({
              ...prev,
              plusB: qcEntry.plusB || '',
              moist: qcEntry.moist || '',
              mr: qcEntry.mr || '',
              twoPointFiveMm: qcEntry.twoPointFiveMm || '',
              grade: qcEntry.grade || '',
              ui: qcEntry.ui || '',
              eLog: qcEntry.eLog || '',
              strength: qcEntry.strength || '',
              sfi: qcEntry.sfcStaple || '',
              mic: qcEntry.mic || '',
              ml50: qcEntry.ml50 || '',
              sfcn: qcEntry.sfcN || '',
              conStaple: qcEntry.conStaple || '',
              tsfn: qcEntry.tsfN || '',
              sfcw: qcEntry.sfcCW || '',
              neps: qcEntry.neps || '',
              tsfw: qcEntry.tsfW || '',
              sci: qcEntry.sci || '',
              fqi: qcEntry.fqi || '',
            }));
            setStrMode(qcEntry.strMode || 'HVI');
          }
        } catch (error) {
          // No existing entry, that's fine
        }
      }
    } catch (error) {
      console.error('Error loading lot details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if ((currentView === 'view' || currentView === 'edit' || currentView === 'create') && selectedLotNo) {
      loadLotDetails(selectedLotNo);
    }
  }, [currentView, selectedLotNo, selectedEntryId]);

  // ============= CRUD OPERATIONS =============
  const handleView = (lotNo, entryId) => {
    setSelectedLotNo(lotNo);
    setSelectedEntryId(entryId);
    setCurrentView('view');
  };

  const handleEdit = (lotNo, entryId) => {
    setSelectedLotNo(lotNo);
    setSelectedEntryId(entryId);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setCurrentView('create');
    resetForm();
  };

  const handleDelete = async (id, lotNo) => {
    if (window.confirm(`Are you sure you want to delete QC entry for Lot ${lotNo}?`)) {
      try {
        await qcEntryService.delete(id);
        fetchQCEntries();
      } catch (error) {
        console.error('Error deleting QC entry:', error);
        alert('Error deleting QC entry');
      }
    }
  };

  const handleSave = async () => {
    try {
      // Get today's date for testDate
      const today = new Date().toISOString().split('T')[0];
      
      const payload = {
        inwardLotId: selectedLotId,
        lotNo: selectedLotNo,
        testDate: today,
        strMode: strMode,
        
        // Map form fields to model fields
        rd: parseFloat(formData.rd) || null,
        staple: parseFloat(formData.staple) || null,
        plusB: parseFloat(formData.plusB) || null,
        moist: parseFloat(formData.moist) || null,
        mr: parseFloat(formData.mr) || null,
        twoPointFiveMm: parseFloat(formData.twoPointFiveMm) || null,
        grade: formData.grade || null,
        ui: parseFloat(formData.ui) || null,
        eLog: parseFloat(formData.eLog) || null,
        strength: parseFloat(formData.strength) || null,
        sfcStaple: parseFloat(formData.sfi) || null, // SFI to sfcStaple
        mic: parseFloat(formData.mic) || null,
        ml50: parseFloat(formData.ml50) || null,
        sfcN: parseFloat(formData.sfcn) || null,
        conStaple: parseFloat(formData.conStaple) || null,
        tsfN: parseFloat(formData.tsfn) || null,
        sfcCW: parseFloat(formData.sfcw) || null,
        neps: parseInt(formData.neps) || null,
        tsfW: parseFloat(formData.tsfw) || null,
        sci: parseInt(formData.sci) || null,
        fqi: parseFloat(formData.fqi) || null,
      };

      if (selectedEntryId) {
        // Update existing
        await qcEntryService.update(selectedEntryId, payload);
        alert('QC Entry updated successfully!');
      } else {
        // Create new
        await qcEntryService.create(payload);
        alert('QC Entry created successfully!');
      }

      setCurrentView('list');
      fetchQCEntries();
      resetForm();
    } catch (error) {
      console.error('Error saving QC entry:', error);
      alert('Error saving QC entry');
    }
  };

  const resetForm = () => {
    setSelectedLotNo('');
    setSelectedLotId(null);
    setSelectedEntryId(null);
    setLotData(null);
    setInwardData(null);
    setPoData(null);
    setSupplierData(null);
    setVarietyData(null);
    setStationData(null);
    setStrMode('HVI');
    setFormData({
      candyRate: '',
      weight: '',
      permitNo: '',
      rd: '',
      staple: '',
      plusB: '',
      moist: '',
      mr: '',
      twoPointFiveMm: '',
      grade: '',
      ui: '',
      eLog: '',
      strength: '',
      sfi: '',
      mic: '',
      ml50: '',
      sfcn: '',
      conStaple: '',
      tsfn: '',
      sfcw: '',
      neps: '',
      tsfw: '',
      sci: '',
      fqi: '',
    });
  };

  const handleCancel = () => {
    setCurrentView('list');
    resetForm();
  };

  const handleLotSelect = (e) => {
    const lotNo = e.target.value;
    setSelectedLotNo(lotNo);
    if (lotNo) {
      loadLotDetails(lotNo);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ============= UTILITY FUNCTIONS =============
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).toUpperCase();
  };

  const formatInwardDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).toUpperCase();
  };

  // Filter entries for list view
  const filteredEntries = qcEntries.filter(entry => {
    const lotDetail = lotDetails[entry.lotNo] || {};
    const searchString = `${entry.lotNo} ${lotDetail.supplierName || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">QC Entry Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all QC test entries and their details</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search QC entries by lot number or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New QC Entry
          </button>
          <button
            onClick={fetchQCEntries}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">
            QC Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CODE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LOT & SUPPLIER</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KEY RESULTS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CREATED DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LAST UPDATED</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No QC entries found</td></tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{entry.id}</div>
                      <div className="text-xs text-gray-500">ID: {entry.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{entry.lotNo}</div>
                      <div className="text-xs text-gray-500">Supplier Info</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-x-2 text-xs">
                        <div><span className="text-gray-500">Staple:</span> {entry.staple || '-'}</div>
                        <div><span className="text-gray-500">Mic:</span> {entry.mic || '-'}</div>
                        <div><span className="text-gray-500">Strength:</span> {entry.strength || '-'}</div>
                        <div><span className="text-gray-500">SCI:</span> {entry.sci || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{formatDate(entry.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{formatDate(entry.updatedAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleView(entry.lotNo, entry.id)} 
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleEdit(entry.lotNo, entry.id)} 
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id, entry.lotNo)} 
                          className="text-red-600 hover:text-red-800 text-sm"
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

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">Showing {filteredEntries.length} of {qcEntries.length} QC entries</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="flex items-center px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );

  // ============= RENDER DETAIL VIEW (Create/Edit/View) =============
  const renderDetailView = () => {
    const isReadOnly = currentView === 'view';
    const isCreate = currentView === 'create';
    
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {isCreate ? 'Create New QC Entry' : isReadOnly ? `View QC Entry - Lot ${selectedLotNo}` : `Edit QC Entry - Lot ${selectedLotNo}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">To Add, Modify, Delete the Lot Test Result</p>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>

        {/* Lot Selection for Create */}
        {isCreate && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Lot No.</label>
            <select
              value={selectedLotNo}
              onChange={handleLotSelect}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            >
              <option value="">Choose a lot</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>
        )}

        {/* Main Content */}
        {selectedLotNo && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {detailLoading ? (
              <div className="text-center py-10">Loading lot details...</div>
            ) : (
              <>
                {/* Header Info with Dates */}
                <div className="grid grid-cols-6 gap-4 mb-6 pb-4 border-b">
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Lot No.</div>
                    <div className="text-sm font-medium">{selectedLotNo}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Lot Date</div>
                    <div className="text-sm font-medium">{lotData?.createdAt ? formatInwardDate(lotData.createdAt) : '-'}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Bill No.</div>
                    <div className="text-sm font-medium">{inwardData?.billNo || '-'}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Bill Date</div>
                    <div className="text-sm font-medium">{inwardData?.billDate ? formatInwardDate(inwardData.billDate) : '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Supplier</div>
                    <div className="text-sm font-medium">{supplierData?.accountName || '-'}</div>
                  </div>
                </div>

                {/* Second Row - Variety, Station */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500">Variety</div>
                    <div className="text-sm font-medium">{varietyData?.variety || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Station</div>
                    <div className="text-sm font-medium">{stationData?.station || '-'}</div>
                  </div>
                </div>

                {/* QC Test Results Grid - Two Column Layout */}
                <div className="grid grid-cols-2 gap-8 mt-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Candy Rate & Weight */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Candy Rate</label>
                        <input 
                          type="number" 
                          value={formData.candyRate} 
                          readOnly 
                          className="w-full px-2 py-1 border bg-gray-50 rounded text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Weight</label>
                        <input 
                          type="number" 
                          value={formData.weight} 
                          readOnly 
                          className="w-full px-2 py-1 border bg-gray-50 rounded text-sm" 
                        />
                      </div>
                    </div>

                    {/* Permit No & RD */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Permit No</label>
                        <input 
                          type="text" 
                          value={formData.permitNo} 
                          readOnly 
                          className="w-full px-2 py-1 border bg-gray-50 rounded text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">RD</label>
                        <input 
                          type="number" 
                          value={formData.rd} 
                          readOnly 
                          className="w-full px-2 py-1 border bg-gray-50 rounded text-sm" 
                        />
                      </div>
                    </div>

                    {/* Staple & +B */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Staple</label>
                        <input 
                          type="number" 
                          value={formData.staple} 
                          readOnly 
                          className="w-full px-2 py-1 border bg-gray-50 rounded text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">+B</label>
                        <input 
                          type="number" 
                          name="plusB" 
                          value={formData.plusB} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* Moist & MR */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Moist</label>
                        <input 
                          type="number" 
                          name="moist" 
                          value={formData.moist} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">MR</label>
                        <input 
                          type="number" 
                          name="mr" 
                          value={formData.mr} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* 2.5mm & Grade */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">2.5mm</label>
                        <input 
                          type="number" 
                          name="twoPointFiveMm" 
                          value={formData.twoPointFiveMm} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Grade</label>
                        <input 
                          type="text" 
                          name="grade" 
                          value={formData.grade} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* UI & E Log */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">UI</label>
                        <input 
                          type="number" 
                          name="ui" 
                          value={formData.ui} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">E Log</label>
                        <input 
                          type="number" 
                          name="eLog" 
                          value={formData.eLog} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Strength & SFI */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Strength</label>
                        <input 
                          type="number" 
                          name="strength" 
                          value={formData.strength} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SFI</label>
                        <input 
                          type="number" 
                          name="sfi" 
                          value={formData.sfi} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* Mic & ML 50% */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mic</label>
                        <input 
                          type="number" 
                          name="mic" 
                          value={formData.mic} 
                          onChange={handleInputChange} 
                          step="0.01" 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">ML 50%</label>
                        <input 
                          type="number" 
                          name="ml50" 
                          value={formData.ml50} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* SFCN & Con. Staple */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SFCN</label>
                        <input 
                          type="number" 
                          name="sfcn" 
                          value={formData.sfcn} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Con. Staple</label>
                        <input 
                          type="text" 
                          name="conStaple" 
                          value={formData.conStaple} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* TSFN & SFCW */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">TSFN</label>
                        <input 
                          type="number" 
                          name="tsfn" 
                          value={formData.tsfn} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SFCW</label>
                        <input 
                          type="number" 
                          name="sfcw" 
                          value={formData.sfcw} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* NEPS & TSFW */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">NEPS</label>
                        <input 
                          type="number" 
                          name="neps" 
                          value={formData.neps} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">TSFW</label>
                        <input 
                          type="number" 
                          name="tsfw" 
                          value={formData.tsfw} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* SCI & FQI */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SCI</label>
                        <input 
                          type="number" 
                          name="sci" 
                          value={formData.sci} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">FQI</label>
                        <input 
                          type="number" 
                          name="fqi" 
                          value={formData.fqi} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section with Radio and Buttons */}
                <div className="mt-8 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <span className="text-sm font-medium text-gray-700">Str. Mode</span>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="strMode" 
                        value="ICC" 
                        checked={strMode === 'ICC'} 
                        onChange={(e) => !isReadOnly && setStrMode(e.target.value)} 
                        disabled={isReadOnly} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-sm text-gray-700">ICC</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="strMode" 
                        value="HVI" 
                        checked={strMode === 'HVI'} 
                        onChange={(e) => !isReadOnly && setStrMode(e.target.value)} 
                        disabled={isReadOnly} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-sm text-gray-700">HVI</span>
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    {!isReadOnly && (
                      <button 
                        onClick={handleSave} 
                        className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        {isCreate ? 'Create' : 'Update'}
                      </button>
                    )}
                    <button 
                      onClick={handleCancel} 
                      className="px-6 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      {isReadOnly ? 'Close' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main render
  return currentView === 'list' ? renderListView() : renderDetailView();
};

export default QCEntryManagement;
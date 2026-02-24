import React, { useState, useEffect, useRef } from 'react';
import inwardEntryService from '../../services/admin1/transaction-cotton/inwardEntryService';
import purchaseOrderService from '../../services/admin1/transaction-cotton/purchaseOrderService';

import godownService from '../../services/admin1/master/godownService';
import supplierService from '../../services/admin1/master/supplierService';
import brokerService from '../../services/admin1/master/brokerService';
import varietyService from '../../services/admin1/master/varietyService';
import mixingGroupService from '../../services/admin1/master/mixingGroupService';
import stationService from '../../services/admin1/master/stationService';

const InwardEntryManagement = () => {
  // States
  const [inwardEntries, setInwardEntries] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [godowns, setGodowns] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [purchaseOrderLoading, setPurchaseOrderLoading] = useState(false);
  const [godownLoading, setGodownLoading] = useState(false);
  const [inwardNoLoading, setInwardNoLoading] = useState(false);
  const [fetchingOrderDetails, setFetchingOrderDetails] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    inwardNo: '',
    orderNo: '',
    orderId: '',
    purchaseOrderId: '',
    
    // Purchase Order details (read-only after selection)
    supplierName: '',
    brokerName: '',
    varietyName: '',
    mixingGroupName: '',
    stationName: '',
    paymentMode: '',
    orderType: '',
    
    // Inward specific fields
    lcNo: '',
    paymentDays: '',
    paymentDate: '',
    govtForm: false,
    companyBroker: '',
    type: 'Upcountry',
    
    // Inward details
    inwardDate: new Date().toISOString().split('T')[0],
    billNo: '',
    billDate: '',
    lotNo: '',
    lorryNo: '',
    date: '',
    candyRate: '',
    pMark: '',
    pressRunningNo: '',
    commisType: '',
    commisValue: '',
    
    // Godown
    godownId: '',
    godownName: '',
    
    // Weight and quantity
    balesQty: '',
    freight: '',
    cooly: '',
    bale: '',
    
    // Tax details (rates only - amounts will be calculated)
    sgst: '',
    cgst: '',
    igst: '',
    
    // Weight details
    grossWeight: '',
    tareWeight: '',
    nettWeight: '',
    
    // Other
    permitNo: '',
    comm: '',
    remarks: ''
  });

  // Autocomplete states
  const [showPurchaseOrderDropdown, setShowPurchaseOrderDropdown] = useState(false);
  const [showGodownDropdown, setShowGodownDropdown] = useState(false);
  
  // Search states
  const [purchaseOrderSearch, setPurchaseOrderSearch] = useState('');
  const [godownSearch, setGodownSearch] = useState('');
  
  // Refs for closing dropdowns
  const purchaseOrderRef = useRef(null);
  const godownRef = useRef(null);

  // Tax rates configuration
  const taxRates = {
    Upcountry: {
      sgst: 0,
      cgst: 0,
      igst: 5
    },
    Fought: {
      sgst: 2.5,
      cgst: 2.5,
      igst: 0
    }
  };

  // Apply tax rates based on type selection
  useEffect(() => {
    if (formData.type && taxRates[formData.type]) {
      const rates = taxRates[formData.type];
      setFormData(prev => ({
        ...prev,
        sgst: rates.sgst,
        cgst: rates.cgst,
        igst: rates.igst
      }));
    }
  }, [formData.type]);

  // Load all data on component mount
  useEffect(() => {
    fetchInwardEntries();
    fetchPurchaseOrders();
    fetchGodowns();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = [purchaseOrderRef, godownRef];
      
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          switch(ref) {
            case purchaseOrderRef: setShowPurchaseOrderDropdown(false); break;
            case godownRef: setShowGodownDropdown(false); break;
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch functions
  const fetchInwardEntries = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await inwardEntryService.getAll();
      const entriesData = Array.isArray(response) ? response : [];
      setInwardEntries(entriesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load inward entries');
      setInwardEntries([]);
      setLoading(false);
    }
  };
  
  // Calculate nett weight automatically
  useEffect(() => {
    const calculateNettWeight = () => {
      const gross = parseFloat(formData.grossWeight) || 0;
      const tare = parseFloat(formData.tareWeight) || 0;
      
      if (gross > 0 && tare >= 0) {
        const nett = gross - tare;
        return nett > 0 ? nett.toFixed(2) : '';
      }
      return '';
    };
    
    const nettWeight = calculateNettWeight();
    if (nettWeight !== formData.nettWeight) {
      setFormData(prev => ({
        ...prev,
        nettWeight: nettWeight
      }));
    }
  }, [formData.grossWeight, formData.tareWeight, formData.nettWeight]);

  // Calculate tax amounts
  const calculateTaxAmounts = () => {
    const candyRate = parseFloat(formData.candyRate) || 0;
    const sgstRate = parseFloat(formData.sgst) || 0;
    const cgstRate = parseFloat(formData.cgst) || 0;
    const igstRate = parseFloat(formData.igst) || 0;
    
    return {
      sgstAmount: candyRate * (sgstRate / 100),
      cgstAmount: candyRate * (cgstRate / 100),
      igstAmount: candyRate * (igstRate / 100)
    };
  };

  const fetchPurchaseOrders = async () => {
    setPurchaseOrderLoading(true);
    try {
      const response = await purchaseOrderService.getAll();
      const ordersData = Array.isArray(response) ? response : [];
      setPurchaseOrders(ordersData);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setPurchaseOrderLoading(false);
    }
  };

  const fetchGodowns = async () => {
    setGodownLoading(true);
    try {
      const response = await godownService.getAll();
      const godownsData = Array.isArray(response) ? response : [];
      setGodowns(godownsData);
    } catch (err) {
      console.error('Failed to load godowns:', err);
    } finally {
      setGodownLoading(false);
    }
  };

  // Fetch next inward number from API
  const fetchNextInwardNumber = async () => {
    try {
      setInwardNoLoading(true);
      const response = await inwardEntryService.getNextInwardNo();
      console.log(response);
      setFormData(prev => ({
        ...prev,
        inwardNo: response || ''
      }));
      
    } catch (err) {
      console.error('Error fetching next inward number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultInwardNo = `GI/${currentYear}-${nextYear}/0001`;
      
      setFormData(prev => ({
        ...prev,
        inwardNo: defaultInwardNo
      }));
      
      setError('Could not fetch next inward number. Using default pattern.');
    } finally {
      setInwardNoLoading(false);
    }
  };

  // Handle purchase order selection - with name fetching
  const handlePurchaseOrderSelect = async (order) => {
    try {
      setFetchingOrderDetails(true);
      
      // First set the basic form data
      setFormData(prev => ({
        ...prev,
        orderNo: order.orderNo,
        orderId: order.id,
        purchaseOrderId: order.id,
        candyRate: order.candyRate || ''
      }));
      
      setPurchaseOrderSearch(order.orderNo);
      setShowPurchaseOrderDropdown(false);
      
      // Then fetch all related data asynchronously
      const promises = [];
      
      // Fetch supplier name if supplierId exists
      if (order.supplierId) {
        promises.push(
          supplierService.getById(order.supplierId)
            .then(supplier => ({ type: 'supplier', data: supplier }))
            .catch(() => ({ type: 'supplier', data: null }))
        );
      }
      
      // Fetch broker name if brokerId exists
      if (order.brokerId) {
        promises.push(
          brokerService.getById(order.brokerId)
            .then(broker => ({ type: 'broker', data: broker }))
            .catch(() => ({ type: 'broker', data: null }))
        );
      }
      
      // Fetch variety name if varietyId exists
      if (order.varietyId) {
        promises.push(
          varietyService.getById(order.varietyId)
            .then(variety => ({ type: 'variety', data: variety }))
            .catch(() => ({ type: 'variety', data: null }))
        );
      }
      
      // Fetch mixing group name if mixingGroupId exists
      if (order.mixingGroupId) {
        promises.push(
          mixingGroupService.getById(order.mixingGroupId)
            .then(mixingGroup => ({ type: 'mixingGroup', data: mixingGroup }))
            .catch(() => ({ type: 'mixingGroup', data: null }))
        );
      }
      
      // Fetch station name if stationId exists
      if (order.stationId) {
        promises.push(
          stationService.getById(order.stationId)
            .then(station => ({ type: 'station', data: station }))
            .catch(() => ({ type: 'station', data: null }))
        );
      }
      
      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      
      // Update form data with fetched names
      const updates = {};
      
      results.forEach(result => {
        if (result.data) {
          switch (result.type) {
            case 'supplier':
              updates.supplierName = result.data.accountName || result.data.brokerName || 'N/A';
              break;
            case 'broker':
              updates.brokerName = result.data.brokerName || 'N/A';
              break;
            case 'variety':
              updates.varietyName = result.data.variety || 'N/A';
              break;
            case 'mixingGroup':
              updates.mixingGroupName = result.data.mixingName || 'N/A';
              break;
            case 'station':
              updates.stationName = result.data.station || 'N/A';
              break;
          }
        }
      });
      
      // Add payment mode and order type (these should be in the order object)
      updates.paymentMode = order.paymentMode || 'N/A';
      updates.orderType = order.orderType || 'N/A';
      
      // Update form data with all fetched values
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
      
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      // Still update with basic data even if fetching details fails
      setFormData(prev => ({
        ...prev,
        supplierName: 'Error loading',
        brokerName: 'Error loading',
        varietyName: 'Error loading',
        mixingGroupName: 'Error loading',
        stationName: 'Error loading',
        paymentMode: order.paymentMode || 'N/A',
        orderType: order.orderType || 'N/A'
      }));
      
      setError('Failed to load some purchase order details. Please check the related records exist.');
    } finally {
      setFetchingOrderDetails(false);
    }
  };

  // Filter based on search
  const filteredPurchaseOrders = purchaseOrders.filter(order => {
    if (!purchaseOrderSearch.trim()) return purchaseOrders;
    const searchLower = purchaseOrderSearch.toLowerCase();
    return (
      (order.orderNo && order.orderNo.toLowerCase().includes(searchLower)) ||
      (order.supplierName && order.supplierName.toLowerCase().includes(searchLower)) ||
      (order.varietyName && order.varietyName.toLowerCase().includes(searchLower))
    );
  });

  const filteredGodowns = godowns.filter(godown => {
    if (!godownSearch.trim()) return godowns;
    const searchLower = godownSearch.toLowerCase();
    return (
      (godown.godownName && godown.godownName.toLowerCase().includes(searchLower)) ||
      (godown.locationName && godown.locationName.toLowerCase().includes(searchLower)) ||
      (godown.code && godown.code.toString().includes(searchLower))
    );
  });

  // Filter inward entries based on search
  const filteredEntries = (() => {
    const entriesArray = Array.isArray(inwardEntries) ? inwardEntries : [];
    
    return entriesArray.filter(entry => {
      if (!entry || typeof entry !== 'object') return false;
      
      const inwardNo = entry.inwardNo || '';
      const orderNo = entry.orderNo || '';
      const supplierName = entry.supplierName || '';
      const varietyName = entry.varietyName || '';
      
      return searchTerm === '' || 
        inwardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        varietyName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Prevent inwardNo changes when creating new entry (editingEntry is null)
    if (name === 'inwardNo' && !editingEntry) {
      return; // Don't allow changes when creating
    }
    
    // Handle type change - tax rates will be updated via useEffect
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    // Prevent manual changes to tax fields
    if (name === 'sgst' || name === 'cgst' || name === 'igst') {
      return; // Disable manual editing
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'paymentDays' || name === 'candyRate' || name === 'commisValue' || 
               name === 'balesQty' || name === 'freight' || name === 'cooly' || name === 'bale' ||
               name === 'grossWeight' || name === 'tareWeight' || name === 'nettWeight' || 
               name === 'comm')
        ? (value === '' ? '' : parseFloat(value) || '')
        : value
    }));
  };

  // Handle godown selection
  const handleGodownSelect = (godown) => {
    setFormData(prev => ({
      ...prev,
      godownId: godown.id,
      godownName: godown.godownName
    }));
    setGodownSearch(godown.godownName);
    setShowGodownDropdown(false);
  };

  // Clear selection functions
  const clearPurchaseOrderSelection = () => {
    setFormData(prev => ({
      ...prev,
      orderNo: '',
      orderId: '',
      purchaseOrderId: '',
      supplierName: '',
      brokerName: '',
      varietyName: '',
      mixingGroupName: '',
      stationName: '',
      paymentMode: '',
      orderType: '',
      candyRate: ''
    }));
    setPurchaseOrderSearch('');
    setShowPurchaseOrderDropdown(false);
  };

  const clearGodownSelection = () => {
    setFormData(prev => ({
      ...prev,
      godownId: '',
      godownName: ''
    }));
    setGodownSearch('');
    setShowGodownDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.inwardDate) {
      setError('Inward date is required');
      return;
    }

    if (!formData.orderId) {
      setError('Please select a purchase order');
      return;
    }

    if (!formData.godownId) {
      setError('Please select a godown');
      return;
    }

    if (!formData.balesQty || parseFloat(formData.balesQty) <= 0) {
      setError('Please enter a valid bales quantity');
      return;
    }

    try {
      // Prepare payload according to service requirements
      const payload = {
        inwardNo: formData.inwardNo.trim(),
        inwardDate: formData.inwardDate,
        purchaseOrderId: parseInt(formData.purchaseOrderId, 10),
        orderNo: formData.orderNo || null,
        godownId: parseInt(formData.godownId, 10),
        
        lcNo: formData.lcNo || null,
        paymentDays: formData.paymentDays ? parseInt(formData.paymentDays, 10) : null,
        paymentDate: formData.paymentDate || null,
        govtForm: formData.govtForm,
        type: formData.type,
        
        billNo: formData.billNo || null,
        billDate: formData.billDate || null,
        lotNo: formData.lotNo || null,
        lorryNo: formData.lorryNo || null,
        
        candyRate: formData.candyRate ? parseFloat(formData.candyRate) : null,
        pMark: formData.pMark || null,
        pressRunningNo: formData.pressRunningNo || null,
        commisType: formData.commisType || null,
        commisValue: formData.commisValue ? parseFloat(formData.commisValue) : null,
        
        balesQty: parseFloat(formData.balesQty),
        freight: formData.freight ? parseFloat(formData.freight) : 0,
        
        // Split cooly/bale into two fields
        cooly: formData.cooly ? parseFloat(formData.cooly) : 0,
        bale: formData.bale ? parseFloat(formData.bale) : 0,
        
        // Tax rates only
        sgst: formData.sgst ? parseFloat(formData.sgst) : 0,
        cgst: formData.cgst ? parseFloat(formData.cgst) : 0,
        igst: formData.igst ? parseFloat(formData.igst) : 0,
        
        grossWeight: formData.grossWeight ? parseFloat(formData.grossWeight) : null,
        tareWeight: formData.tareWeight ? parseFloat(formData.tareWeight) : null,
        nettWeight: formData.nettWeight ? parseFloat(formData.nettWeight) : null,
        
        permitNo: formData.permitNo || null,
        comm: formData.comm ? parseFloat(formData.comm) : null,
        remarks: formData.remarks || null
      };
      
      if (editingEntry) {
        // Update existing entry
        await inwardEntryService.update(editingEntry.id, payload);
        setSuccess('Inward entry updated successfully!');
      } else {
        // Create new entry
        await inwardEntryService.create(payload);
        setSuccess('Inward entry created successfully!');
      }
      
      // Refresh entries list
      fetchInwardEntries();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save inward entry: ${errorMsg}`);
    }
  };

  const handleEdit = async (entry) => {
    if (!entry || !entry.id) {
      setError('Invalid inward entry data');
      return;
    }
    
    setEditingEntry(entry);
    
    // Set basic form data
    const basicFormData = {
      inwardNo: entry.inwardNo || '',
      orderNo: entry.orderNo || '',
      orderId: entry.orderId || entry.purchaseOrderId || '',
      purchaseOrderId: entry.purchaseOrderId || '',
      lcNo: entry.lcNo || '',
      paymentDays: entry.paymentDays || '',
      paymentDate: entry.paymentDate || '',
      govtForm: entry.govtForm || false,
      companyBroker: entry.companyBroker || '',
      type: entry.type || 'Upcountry',
      inwardDate: entry.inwardDate || new Date().toISOString().split('T')[0],
      billNo: entry.billNo || '',
      billDate: entry.billDate || '',
      lotNo: entry.lotNo || '',
      lorryNo: entry.lorryNo || '',
      date: entry.date || '',
      candyRate: entry.candyRate || '',
      pMark: entry.pMark || '',
      pressRunningNo: entry.pressRunningNo || '',
      commisType: entry.commisType || '',
      commisValue: entry.commisValue || '',
      godownId: entry.godownId || '',
      godownName: entry.godownName || '',
      balesQty: entry.balesQty || '',
      freight: entry.freight || '',
      cooly: entry.cooly || '',
      bale: entry.bale || '',
      sgst: entry.sgst || '',
      cgst: entry.cgst || '',
      igst: entry.igst || '',
      grossWeight: entry.grossWeight || '',
      tareWeight: entry.tareWeight || '',
      nettWeight: entry.nettWeight || '',
      permitNo: entry.permitNo || '',
      comm: entry.comm || '',
      remarks: entry.remarks || ''
    };
    
    setFormData(basicFormData);
    setPurchaseOrderSearch(entry.orderNo || '');
    setGodownSearch(entry.godownName || '');
    
    // If there's an purchaseOrderId, fetch the purchase order details
    if (entry.purchaseOrderId || entry.orderId) {
      try {
        const orderId = entry.purchaseOrderId || entry.orderId;
        const purchaseOrder = await purchaseOrderService.getById(orderId);
        // Then fetch all related names as we did in handlePurchaseOrderSelect
        const promises = [];
        
        if (purchaseOrder.supplierId) {
          promises.push(
            supplierService.getById(purchaseOrder.supplierId)
              .then(supplier => ({ type: 'supplier', data: supplier }))
              .catch(() => ({ type: 'supplier', data: null }))
          );
        }
        
        if (purchaseOrder.brokerId) {
          promises.push(
            brokerService.getById(purchaseOrder.brokerId)
              .then(broker => ({ type: 'broker', data: broker }))
              .catch(() => ({ type: 'broker', data: null }))
          );
        }
        
        if (purchaseOrder.varietyId) {
          promises.push(
            varietyService.getById(purchaseOrder.varietyId)
              .then(variety => ({ type: 'variety', data: variety }))
              .catch(() => ({ type: 'variety', data: null }))
          );
        }
        
        if (purchaseOrder.mixingGroupId) {
          promises.push(
            mixingGroupService.getById(purchaseOrder.mixingGroupId)
              .then(mixingGroup => ({ type: 'mixingGroup', data: mixingGroup }))
              .catch(() => ({ type: 'mixingGroup', data: null }))
          );
        }
        
        if (purchaseOrder.stationId) {
          promises.push(
            stationService.getById(purchaseOrder.stationId)
              .then(station => ({ type: 'station', data: station }))
              .catch(() => ({ type: 'station', data: null }))
          );
        }
        
        const results = await Promise.all(promises);
        
        const updates = {};
        results.forEach(result => {
          if (result.data) {
            switch (result.type) {
              case 'supplier':
                updates.supplierName = result.data.accountName || result.data.brokerName || 'N/A';
                break;
              case 'broker':
                updates.brokerName = result.data.brokerName || 'N/A';
                break;
              case 'variety':
                updates.varietyName = result.data.variety || 'N/A';
                break;
              case 'mixingGroup':
                updates.mixingGroupName = result.data.mixingName || 'N/A';
                break;
              case 'station':
                updates.stationName = result.data.station || 'N/A';
                break;
            }
          }
        });
        
        updates.paymentMode = purchaseOrder.paymentMode || 'N/A';
        updates.orderType = purchaseOrder.orderType || 'N/A';
        
        // Update form data with fetched names
        setFormData(prev => ({
          ...prev,
          ...updates
        }));
        
      } catch (error) {
        console.error('Error loading purchase order details for edit:', error);
        // If we can't fetch the details, at least show what we have in the entry
        setFormData(prev => ({
          ...prev,
          supplierName: entry.supplierName || 'N/A',
          brokerName: entry.brokerName || 'N/A',
          varietyName: entry.varietyName || 'N/A',
          mixingGroupName: entry.mixingGroupName || 'N/A',
          stationName: entry.stationName || 'N/A',
          paymentMode: entry.paymentMode || 'N/A',
          orderType: entry.orderType || 'N/A'
        }));
      }
    } else {
      // If no orderId, just set the names from the entry directly
      setFormData(prev => ({
        ...prev,
        supplierName: entry.supplierName || 'N/A',
        brokerName: entry.brokerName || 'N/A',
        varietyName: entry.varietyName || 'N/A',
        mixingGroupName: entry.mixingGroupName || 'N/A',
        stationName: entry.stationName || 'N/A',
        paymentMode: entry.paymentMode || 'N/A',
        orderType: entry.orderType || 'N/A'
      }));
    }
    
    setShowModal(true);
  };

  const handleView = (entry) => {
    if (!entry || !entry.id) {
      setError('Invalid inward entry data');
      return;
    }
    
    setViewingEntry(entry);
    setShowViewModal(true);
  };

  const handleDelete = async (id, inwardNo) => {
    if (!id || !inwardNo) {
      setError('Invalid inward entry data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete inward entry "${inwardNo}"?`)) {
      return;
    }

    try {
      await inwardEntryService.delete(id);
      setSuccess('Inward entry deleted successfully!');
      fetchInwardEntries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete inward entry');
    }
  };

  const resetForm = () => {
    setFormData({
      inwardNo: '',
      orderNo: '',
      orderId: '',
      purchaseOrderId: '',
      supplierName: '',
      brokerName: '',
      varietyName: '',
      mixingGroupName: '',
      stationName: '',
      paymentMode: '',
      orderType: '',
      lcNo: '',
      paymentDays: '',
      paymentDate: '',
      govtForm: false,
      companyBroker: '',
      type: 'Upcountry',
      inwardDate: new Date().toISOString().split('T')[0],
      billNo: '',
      billDate: '',
      lotNo: '',
      lorryNo: '',
      date: '',
      candyRate: '',
      pMark: '',
      pressRunningNo: '',
      commisType: '',
      commisValue: '',
      godownId: '',
      godownName: '',
      balesQty: '',
      freight: '',
      cooly: '',
      bale: '',
      sgst: taxRates.Upcountry.sgst,
      cgst: taxRates.Upcountry.cgst,
      igst: taxRates.Upcountry.igst,
      grossWeight: '',
      tareWeight: '',
      nettWeight: '',
      permitNo: '',
      comm: '',
      remarks: ''
    });
    
    setPurchaseOrderSearch('');
    setGodownSearch('');
    setShowPurchaseOrderDropdown(false);
    setShowGodownDropdown(false);
    setEditingEntry(null);
    setViewingEntry(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchNextInwardNumber(); // Fetch next inward number
    setShowModal(true);
  };

  const exportEntries = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Inward No,Order No,Inward Date,Supplier,Variety,Godown,Bales Qty,Gross Weight,Nett Weight,Type,Bill No,Lorry No,Created Date\n" +
        filteredEntries.map(entry => {
          return `"${entry.inwardNo}","${entry.orderNo}","${entry.inwardDate}","${entry.supplierName || ''}","${entry.varietyName || ''}","${entry.godownName || ''}","${entry.balesQty}","${entry.grossWeight || ''}","${entry.nettWeight || ''}","${entry.type}","${entry.billNo || ''}","${entry.lorryNo || ''}","${entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}"`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inward-entries-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Inward entries exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export inward entries');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
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

  // Get tax amounts for display
  const taxAmounts = calculateTaxAmounts();

  // Get tax description based on type
  const getTaxDescription = () => {
    if (formData.type === 'Upcountry') {
      return "IGST 5% (Upcountry Transaction)";
    } else if (formData.type === 'Fought') {
      return "SGST 2.5% + CGST 2.5% (Fought Transaction)";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Gate Inward Management</h1>
            <p className="text-gray-600">Add, modify and manage inward entry details</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Create New Inward
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by inward number, order number, supplier, or variety..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportEntries}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchInwardEntries();
                fetchPurchaseOrders();
                fetchGodowns();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Inward Entries Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Inward Entries ({filteredEntries.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredEntries.length} of {inwardEntries.length} entries
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading inward entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🚚</span>
            <p className="text-gray-600 mb-2">No inward entries found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first inward entry
              </button>
            )}
          </div>
        ) : (
          /* Entries Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INWARD DETAILS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WEIGHT & QUANTITY
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INWARD DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {entry.inwardNo}
                          </div>
                          <div className="text-xs mt-1">
                            <span className={`px-2 py-1 rounded-full ${entry.type === 'Upcountry' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {entry.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📦</span>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.balesQty} bales
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">⚖️</span>
                          <div className="text-sm text-gray-600">
                            Gross: {entry.grossWeight || 'N/A'} kg
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">⚖️</span>
                          <div className="text-sm text-gray-600">
                            Nett: {entry.nettWeight || 'N/A'} kg
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(entry.inwardDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.billNo && `Bill: ${entry.billNo}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.lorryNo && `Lorry: ${entry.lorryNo}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(entry)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.inwardNo)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                        >
                          <span className="mr-1">🗑️</span>
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

      {/* Create/Edit Inward Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingEntry ? 'Edit Inward Entry' : 'Create New Inward Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Inward and Purchase Details */}
                  <div className="space-y-6">
                    {/* Inward Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Inward Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Inward Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inward Number {!editingEntry && '(Auto-generated)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                            {inwardNoLoading ? (
                              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                <span className="w-4 h-4 animate-spin inline-block mr-2 text-gray-400">↻</span>
                                <span className="text-gray-500">Generating inward number...</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                name="inwardNo"
                                value={formData.inwardNo}
                                onChange={handleInputChange}
                                required
                                readOnly={!editingEntry}
                                className={`w-full pl-10 pr-4 py-2 border ${!editingEntry ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                placeholder={editingEntry ? "Edit inward number" : "Auto-generated"}
                              />
                            )}
                          </div>
                        </div>

                        {/* Purchase Order Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Number *
                          </label>
                          <div className="relative" ref={purchaseOrderRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📋</span>
                            <input
                              type="text"
                              value={purchaseOrderSearch}
                              onChange={(e) => {
                                setPurchaseOrderSearch(e.target.value);
                                setShowPurchaseOrderDropdown(true);
                              }}
                              onFocus={() => setShowPurchaseOrderDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search by order number..."
                              required
                            />
                            {formData.orderNo && (
                              <button
                                type="button"
                                onClick={clearPurchaseOrderSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Purchase Order Dropdown */}
                            {showPurchaseOrderDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {purchaseOrderLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading purchase orders...
                                  </div>
                                ) : filteredPurchaseOrders.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {purchaseOrderSearch ? 'No purchase orders found' : 'No purchase orders available'}
                                  </div>
                                ) : (
                                  filteredPurchaseOrders.map((order) => (
                                    <div
                                      key={order.id}
                                      onClick={() => handlePurchaseOrderSelect(order)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.orderId === order.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{order.orderNo}</div>
                                          <div className="text-xs text-gray-500">
                                            Supplier: {order.supplierName || 'N/A'} | Variety: {order.varietyName || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Quantity: {order.quantity} | Rate: ₹{order.candyRate || 'N/A'}/candy
                                          </div>
                                        </div>
                                        {formData.orderId === order.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {fetchingOrderDetails && (
                            <p className="mt-1 text-xs text-blue-600">
                              <span className="w-3 h-3 animate-spin inline-block mr-1">↻</span>
                              Loading order details...
                            </p>
                          )}
                          {!formData.orderId && purchaseOrderSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a purchase order from the list</p>
                          )}
                        </div>

                        {/* Inward Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inward Date *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="inwardDate"
                              value={formData.inwardDate}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Upcountry">Upcountry</option>
                            <option value="Fought">Fought</option>
                          </select>
                        </div>

                        {/* LC No */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            LC No.
                          </label>
                          <input
                            type="text"
                            name="lcNo"
                            value={formData.lcNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter LC number"
                          />
                        </div>

                        {/* Payment Days */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Days
                          </label>
                          <input
                            type="number"
                            name="paymentDays"
                            value={formData.paymentDays}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter payment days"
                          />
                        </div>

                        {/* Payment Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="paymentDate"
                              value={formData.paymentDate}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Govt Form Checkbox */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="govtForm"
                            name="govtForm"
                            checked={formData.govtForm}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="govtForm" className="ml-2 text-sm text-gray-700">
                            Govt. Form
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Details (Read-only after order selection) */}
                    {formData.orderId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Purchase Details (Read-only)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Supplier
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.supplierName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Broker
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.brokerName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Variety
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.varietyName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Mixing Group
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.mixingGroupName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Station
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.stationName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Payment Mode
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.paymentMode || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Order Type
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.orderType || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Candy Rate
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              ₹{formData.candyRate || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Godown Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Godown Details</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Godown *
                        </label>
                        <div className="relative" ref={godownRef}>
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🏢</span>
                          <input
                            type="text"
                            value={godownSearch}
                            onChange={(e) => {
                              setGodownSearch(e.target.value);
                              setShowGodownDropdown(true);
                            }}
                            onFocus={() => setShowGodownDropdown(true)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search godowns..."
                            required
                          />
                          {formData.godownId && (
                            <button
                              type="button"
                              onClick={clearGodownSelection}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          )}
                          
                          {/* Godown Dropdown */}
                          {showGodownDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {godownLoading ? (
                                <div className="p-3 text-center text-gray-500">
                                  <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                  Loading godowns...
                                </div>
                              ) : filteredGodowns.length === 0 ? (
                                <div className="p-3 text-center text-gray-500">
                                  {godownSearch ? 'No godowns found' : 'No godowns available'}
                                </div>
                              ) : (
                                filteredGodowns.map((godown) => (
                                  <div
                                    key={godown.id}
                                    onClick={() => handleGodownSelect(godown)}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                      formData.godownId === godown.id ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-gray-900">{godown.godownName}</div>
                                        <div className="text-xs text-gray-500">
                                          Location: {godown.locationName} | Type: {godown.type}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Code: #{godown.code}
                                        </div>
                                      </div>
                                      {formData.godownId === godown.id && (
                                        <span className="w-4 h-4 text-blue-600">✓</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        {!formData.godownId && godownSearch && (
                          <p className="mt-1 text-xs text-red-500">Please select a godown from the list</p>
                        )}
                      </div>
                    </div>

                    {/* Quantity and Weight */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Quantity & Weight</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bales Quantity *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📦</span>
                            <input
                              type="number"
                              name="balesQty"
                              value={formData.balesQty}
                              onChange={handleInputChange}
                              required
                              min="0"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter bales quantity"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Freight
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🚚</span>
                            <input
                              type="number"
                              name="freight"
                              value={formData.freight}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter freight amount"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cooly
                          </label>
                          <input
                            type="number"
                            name="cooly"
                            value={formData.cooly}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter cooly"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bale
                          </label>
                          <input
                            type="number"
                            name="bale"
                            value={formData.bale}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter bale"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gross Weight (kg)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="number"
                              name="grossWeight"
                              value={formData.grossWeight}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter gross weight"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tare Weight (kg)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="number"
                              name="tareWeight"
                              value={formData.tareWeight}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter tare weight"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nett Weight (kg)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="number"
                              name="nettWeight"
                              value={formData.nettWeight}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter nett weight"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Inward and Tax Details */}
                  <div className="space-y-6">
                    {/* Inward Document Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bill No.
                          </label>
                          <input
                            type="text"
                            name="billNo"
                            value={formData.billNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter bill number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bill Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="billDate"
                              value={formData.billDate}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lot No.
                          </label>
                          <input
                            type="text"
                            name="lotNo"
                            value={formData.lotNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter lot number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lorry No.
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🚚</span>
                            <input
                              type="text"
                              name="lorryNo"
                              value={formData.lorryNo}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter lorry number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Candy Rate
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                            <input
                              type="number"
                              name="candyRate"
                              value={formData.candyRate}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter candy rate"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            P. Mark
                          </label>
                          <input
                            type="text"
                            name="pMark"
                            value={formData.pMark}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter P mark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Press Running No.
                          </label>
                          <input
                            type="text"
                            name="pressRunningNo"
                            value={formData.pressRunningNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter press running number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commis. Type
                          </label>
                          <input
                            type="text"
                            name="commisType"
                            value={formData.commisType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter commission type"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commis. Value
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                            <input
                              type="number"
                              name="commisValue"
                              value={formData.commisValue}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter commission value"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tax Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Tax Details</h4>
                        <div className="text-sm font-medium text-blue-600">
                          {getTaxDescription()}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {/* SGST - Only shown for Fought */}
                        {formData.type === 'Fought' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                SGST %
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                <input
                                  type="number"
                                  name="sgst"
                                  value={formData.sgst}
                                  readOnly
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                                  placeholder="SGST %"
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Fixed rate for Fought transactions
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                SGST Amount
                              </label>
                              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                <div className="text-gray-700">
                                  ₹{taxAmounts.sgstAmount.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  (Candy Rate × {formData.sgst || 0}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CGST - Only shown for Fought */}
                        {formData.type === 'Fought' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CGST %
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                <input
                                  type="number"
                                  name="cgst"
                                  value={formData.cgst}
                                  readOnly
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                                  placeholder="CGST %"
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Fixed rate for Fought transactions
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CGST Amount
                              </label>
                              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                <div className="text-gray-700">
                                  ₹{taxAmounts.cgstAmount.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  (Candy Rate × {formData.cgst || 0}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* IGST - Only shown for Upcountry */}
                        {formData.type === 'Upcountry' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                IGST %
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                <input
                                  type="number"
                                  name="igst"
                                  value={formData.igst}
                                  readOnly
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                                  placeholder="IGST %"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                IGST Amount
                              </label>
                              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                <div className="text-gray-700">
                                  ₹{taxAmounts.igstAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Other Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Other Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Permit No.
                          </label>
                          <input
                            type="text"
                            name="permitNo"
                            value={formData.permitNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter permit number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commission
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                            <input
                              type="number"
                              name="comm"
                              value={formData.comm}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter commission"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h4>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">📝</span>
                        <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add any remarks or special instructions..."
                        />
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.inwardNo || !formData.inwardDate || !formData.orderId || 
                             !formData.godownId || !formData.balesQty || fetchingOrderDetails}
                  >
                    {editingEntry ? 'Update Inward' : 'Create Inward'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Inward Entry Details Modal */}
      {showViewModal && viewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Inward Entry Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              {/* Entry Details */}
              <div className="space-y-6">
                {/* Entry Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">#</span>
                      <h4 className="text-2xl font-bold text-gray-900">{viewingEntry.inwardNo}</h4>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📋</span>
                        <span className="text-sm text-gray-600">Order: {viewingEntry.orderNo}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📅</span>
                        <span className="text-sm text-gray-600">Inward Date: {formatDate(viewingEntry.inwardDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewingEntry.type === 'Upcountry' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {viewingEntry.type}
                    </span>
                    {viewingEntry.govtForm && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <span className="w-3 h-3 inline mr-1">✓</span>
                        Govt. Form
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Purchase Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Purchase Details</h5>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Supplier</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.purchaseOrderId || 'N/A'}
                              {console.log(purchaseOrderService.getById(viewingEntry.purchaseOrderId))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Broker</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.brokerName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Variety</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.varietyName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Mixing Group</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.mixingGroupName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Station</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.stationName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Payment Mode</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.paymentMode || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Godown Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Godown Details</h5>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-500">Godown Name</div>
                          <div className="font-medium text-gray-900">
                            {viewingEntry.godownName || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Location</div>
                          <div className="text-gray-700">
                            {viewingEntry.godownLocation || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Quantity & Weight Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Quantity & Weight</h5>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Bales Quantity</div>
                            <div className="font-bold text-gray-900 text-xl">
                              {viewingEntry.balesQty} bales
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Candy Rate</div>
                            <div className="font-bold text-green-700 text-xl">
                              ₹{viewingEntry.candyRate || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Gross Weight</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.grossWeight || 'N/A'} kg
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Tare Weight</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.tareWeight || 'N/A'} kg
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Nett Weight</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.nettWeight || 'N/A'} kg
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Freight</div>
                            <div className="font-medium text-gray-900">
                              {viewingEntry.freight ? `₹${viewingEntry.freight}` : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tax Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Tax Details ({viewingEntry.type})</h5>
                      <div className="space-y-3">
                        {viewingEntry.type === 'Upcountry' ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">IGST %</div>
                              <div className="font-medium text-gray-900">
                                {viewingEntry.igst || 5}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">IGST Amount</div>
                              <div className="font-medium text-gray-900">
                                ₹{((viewingEntry.candyRate || 0) * ((viewingEntry.igst || 5) / 100)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">SGST %</div>
                              <div className="font-medium text-gray-900">
                                {viewingEntry.sgst || 2.5}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">SGST Amount</div>
                              <div className="font-medium text-gray-900">
                                ₹{((viewingEntry.candyRate || 0) * ((viewingEntry.sgst || 2.5) / 100)).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">CGST %</div>
                              <div className="font-medium text-gray-900">
                                {viewingEntry.cgst || 2.5}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">CGST Amount</div>
                              <div className="font-medium text-gray-900">
                                ₹{((viewingEntry.candyRate || 0) * ((viewingEntry.cgst || 2.5) / 100)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">
                            {viewingEntry.type === 'Upcountry' ? 
                              `Total IGST: ₹${((viewingEntry.candyRate || 0) * ((viewingEntry.igst || 5) / 100)).toFixed(2)}` :
                              `Combined GST: ₹${((viewingEntry.candyRate || 0) * (((viewingEntry.sgst || 2.5) + (viewingEntry.cgst || 2.5)) / 100)).toFixed(2)}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Document Details</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Bill No.</div>
                          <div className="font-medium text-gray-900">{viewingEntry.billNo || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Bill Date</div>
                          <div className="font-medium text-gray-900">
                            {viewingEntry.billDate ? formatDate(viewingEntry.billDate) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Lot No.</div>
                          <div className="font-medium text-gray-900">{viewingEntry.lotNo || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Lorry No.</div>
                          <div className="font-medium text-gray-900">{viewingEntry.lorryNo || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">LC No.</div>
                          <div className="font-medium text-gray-900">{viewingEntry.lcNo || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Permit No.</div>
                          <div className="font-medium text-gray-900">{viewingEntry.permitNo || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Timestamps</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created Date</div>
                          <div className="font-medium text-gray-900">
                            {viewingEntry.createdAt ? new Date(viewingEntry.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingEntry.createdAt ? new Date(viewingEntry.createdAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Updated</div>
                          <div className="font-medium text-gray-900">
                            {viewingEntry.updatedAt ? new Date(viewingEntry.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingEntry.updatedAt ? new Date(viewingEntry.updatedAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {viewingEntry.remarks && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">Remarks</h5>
                    <div className="text-gray-700">
                      {viewingEntry.remarks}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingEntry);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Inward
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

export default InwardEntryManagement;
// frontend/src/pages/admin/transaction-cotton/InwardLotPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import inwardEntryService from '../../services/admin1/transaction-cotton/inwardEntryService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import godownService from '../../services/admin1/master/godownService';

const InwardLotPage = () => {
  const navigate = useNavigate();
  
  // States for list view
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightmentModal, setShowWeightmentModal] = useState(false);
  
  // Data states
  const [selectedLot, setSelectedLot] = useState(null);
  const [inwardEntries, setInwardEntries] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [selectedInward, setSelectedInward] = useState(null);
  const [selectedGodown, setSelectedGodown] = useState(null);
  
  // Loading states
  const [inwardLoading, setInwardLoading] = useState(false);
  const [godownLoading, setGodownLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lotNoLoading, setLotNoLoading] = useState(false);
  
  // Dropdown visibility states
  const [showInwardDropdown, setShowInwardDropdown] = useState(false);
  const [showGodownDropdown, setShowGodownDropdown] = useState(false);
  
  // Search states
  const [inwardSearch, setInwardSearch] = useState('');
  const [godownSearch, setGodownSearch] = useState('');
  
  // Refs for dropdowns
  const inwardRef = useRef(null);
  const godownRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Header
    inwardId: '',
    inwardNo: '',
    lotNo: '',
    lotDate: new Date().toISOString().split('T')[0],
    
    // Purchase details (from inward)
    supplier: '',
    broker: '',
    variety: '',
    mixingGroup: '',
    station: '',
    companyBroker: '',
    rateType: '',
    
    // Party details (from inward)
    billNo: '',
    billDate: '',
    lotNoParty: '',
    lorryNo: '',
    date: '',
    candyRate: '',
    pMark: '',
    pressRunningNo: '',
    commisType: '',
    commisValue: '',
    permitNo: '',
    comm: '',
    cooly: '',
    bale: '',
    
    // Tax details (from inward)
    gst: '',
    sgst: '',
    cgst: '',
    igst: '',
    sgstAmount: '',
    cgstAmount: '',
    igstAmount: '',
    Tax: '',
    TaxRs: '',
    
    // Per Qty values (from inward)
    grossPerQty: '',
    tarePerQty: '',
    freightPerQty: '',
    
    // User inputs
    godownId: '',
    godownName: '',
    qty: '',
    paymentDays: '',
    lcNo: '',
    setNo: '',
    cess: '0',
    type: '',
    
    // Calculated fields
    grossWeight: '',
    tareWeight: '',
    nettWeight: '',
    freight: '',
    candyRateWithTax: '',
    ratePerKg: '',
    quintalRate: '',
    assessValue: ''
  });

  // Weightment state
  const [weightments, setWeightments] = useState([]);
  const [weightmentTotals, setWeightmentTotals] = useState({
    grossWeight: 0,
    tareWeight: 0,
    baleWeight: 0,
    baleValue: 0
  });

  // Refs for keyboard navigation
  const inputRefs = useRef({});

  // Load data on mount
  useEffect(() => {
    fetchLots();
    fetchInwardEntries();
    fetchGodowns();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inwardRef.current && !inwardRef.current.contains(event.target)) {
        setShowInwardDropdown(false);
      }
      if (godownRef.current && !godownRef.current.contains(event.target)) {
        setShowGodownDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate payment date when lotDate and paymentDays change
  useEffect(() => {
    if (formData.lotDate && formData.paymentDays) {
      const lotDate = new Date(formData.lotDate);
      const days = parseInt(formData.paymentDays);
      
      if (!isNaN(days) && days > 0) {
        const paymentDate = new Date(lotDate);
        paymentDate.setDate(lotDate.getDate() + days);
        // You can set this somewhere if needed
      }
    }
  }, [formData.lotDate, formData.paymentDays]);

  // Calculate all values when qty changes
  useEffect(() => {
    if (formData.qty && selectedInward) {
      const qty = parseFloat(formData.qty) || 0;
      
      // Get per qty values from inward
      const grossPerQty = parseFloat(selectedInward.grossPerQty) || 0;
      const tarePerQty = parseFloat(selectedInward.tarePerQty) || 0;
      const freightPerQty = parseFloat(selectedInward.freightPerQty) || 0;
      
      // Calculate weights with rounding for gross and tare
      const grossWeight = Math.floor(grossPerQty * qty);
      const tareWeight = Math.floor(tarePerQty * qty);
      const nettWeight = grossWeight - tareWeight;
      const freight = freightPerQty * qty;

      // Get base candy rate
      const baseCandyRate = parseFloat(selectedInward.candyRate) || 0;
      
      // NEW CALCULATION METHOD: Freight-based adjustment
      // Step 1: Calculate freight per KG
      const freightPerKg = nettWeight > 0 ? freight / nettWeight : 0;
      
      // Step 2: Calculate freight adjustment in candy rate terms
      const freightAdjustment = freightPerKg * 355.62;
      
      // Step 3: Adjusted candy rate = base rate + freight adjustment
      const candyRateWithTax = Math.floor(baseCandyRate + freightAdjustment);
      
      // Step 4: Calculate rates
      let ratePerKg = candyRateWithTax / 355.62;
      // Round ratePerKg to 2 decimals
      ratePerKg = Math.round(ratePerKg * 100) / 100;
      const quintalRate = ratePerKg * 100;
      
      // Step 5: Assess Value = Rate/Kg × Net Weight
      let assessValue = nettWeight * ratePerKg;
      
      setFormData(prev => ({
        ...prev,
        grossWeight: grossWeight.toString(),
        tareWeight: tareWeight.toString(),
        nettWeight: nettWeight.toString(),
        freight: freight.toFixed(2),
        candyRateWithTax: Math.round(candyRateWithTax).toString(),
        ratePerKg: ratePerKg.toFixed(2),
        quintalRate: quintalRate.toFixed(2),
        assessValue: Math.round(assessValue).toString()
      }));
    }
  }, [formData.qty, selectedInward]);

  // Fetch next lot number
  const fetchNextLotNo = async () => {
    try {
      setLotNoLoading(true);
      const response = await inwardLotService.getNextLotNo();
      console.log('Next lot number:', response);
      setFormData(prev => ({
        ...prev,
        lotNo: response || ''
      }));
    } catch (err) {
      console.error('Error fetching next lot number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultLotNo = `UC/${currentYear}-${nextYear}/${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
      setFormData(prev => ({
        ...prev,
        lotNo: defaultLotNo
      }));
    } finally {
      setLotNoLoading(false);
    }
  };

  // Fetch lots
  const fetchLots = async () => {
    setLoading(true);
    try {
      const response = await inwardLotService.getAll();
      const lotsData = Array.isArray(response) ? response : [];
      setLots(lotsData);
    } catch (err) {
      console.error('Failed to load lots:', err);
      setError('Failed to load inward lots');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inward entries
  const fetchInwardEntries = async () => {
    setInwardLoading(true);
    try {
      const response = await inwardEntryService.getAll();
      const entriesData = response?.inwardEntries || (Array.isArray(response) ? response : []);
      setInwardEntries(entriesData);
    } catch (err) {
      console.error('Failed to load inward entries:', err);
    } finally {
      setInwardLoading(false);
    }
  };

  // Fetch godowns
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

  // Handle inward selection
  const handleInwardSelect = async (inwardId) => {
    try {
      setLoading(true);
      console.log('Fetching inward with ID:', inwardId);
      
      const response = await inwardEntryService.getById(inwardId);
      console.log('Inward response:', response);
      
      const inward = response.inwardEntry || response;
      
      setSelectedInward(inward);
      setInwardSearch(inward.inwardNo || '');
      
      // Populate form with inward data - exactly as received
      setFormData(prev => ({
        ...prev,
        inwardId: inward.id,
        inwardNo: inward.inwardNo || '',
        
        // Purchase details
        supplier: inward.supplier || '',
        broker: inward.broker || '',
        variety: inward.variety || '',
        mixingGroup: inward.mixingGroup || '',
        station: inward.station || '',
        companyBroker: inward.companyBroker || '',
        rateType: inward.rateType || '',
        
        // Party details
        billNo: inward.billNo || '',
        billDate: inward.billDate || '',
        lotNoParty: inward.lotNo || '',
        lorryNo: inward.lorryNo || '',
        date: inward.date || '',
        candyRate: inward.candyRate || '',
        pMark: inward.pMark || '',
        pressRunningNo: inward.pressRunningNo || '',
        commisType: inward.commisType || '',
        commisValue: inward.commisValue || '',
        permitNo: inward.permitNo || '',
        comm: inward.comm || '',
        cooly: inward.cooly || '',
        bale: inward.bale || '',
        
        // Tax details
        gst: inward.gst || '',
        sgst: inward.sgst || '',
        cgst: inward.cgst || '',
        igst: inward.igst || '',
        sgstAmount: inward.sgstAmount || '',
        cgstAmount: inward.cgstAmount || '',
        igstAmount: inward.igstAmount || '',
        Tax: inward.Tax || '',
        TaxRs: inward.TaxRs || '',
        
        // Per Qty values
        grossPerQty: inward.grossPerQty || '',
        tarePerQty: inward.tarePerQty || '',
        freightPerQty: inward.freightPerQty || '',
        
        // Type from inward
        type: inward.type || ''
      }));
      
      setShowInwardDropdown(false);
      
    } catch (error) {
      console.error('Error fetching inward details:', error);
      setError('Failed to load inward entry details');
    } finally {
      setLoading(false);
    }
  };

  // Handle godown selection
  const handleGodownSelect = (godown) => {
    console.log('Selected godown:', godown);
    setFormData(prev => ({
      ...prev,
      godownId: godown.id,
      godownName: godown.godownName
    }));
    setSelectedGodown(godown);
    setGodownSearch(godown.godownName);
    setShowGodownDropdown(false);
  };

  // Clear selections
  const clearInwardSelection = () => {
    setSelectedInward(null);
    setInwardSearch('');
    setFormData(prev => ({
      ...prev,
      inwardId: '',
      inwardNo: '',
      supplier: '',
      broker: '',
      variety: '',
      mixingGroup: '',
      station: '',
      companyBroker: '',
      rateType: '',
      billNo: '',
      billDate: '',
      lotNoParty: '',
      lorryNo: '',
      date: '',
      candyRate: '',
      pMark: '',
      pressRunningNo: '',
      commisType: '',
      commisValue: '',
      permitNo: '',
      comm: '',
      cooly: '',
      bale: '',
      gst: '',
      sgst: '',
      cgst: '',
      igst: '',
      sgstAmount: '',
      cgstAmount: '',
      igstAmount: '',
      Tax: '',
      TaxRs: '',
      grossPerQty: '',
      tarePerQty: '',
      freightPerQty: '',
      type: '',
      grossWeight: '',
      tareWeight: '',
      nettWeight: '',
      freight: '',
      candyRateWithTax: '',
      ratePerKg: '',
      quintalRate: '',
      assessValue: ''
    }));
  };

  const clearGodownSelection = () => {
    setFormData(prev => ({
      ...prev,
      godownId: '',
      godownName: ''
    }));
    setSelectedGodown(null);
    setGodownSearch('');
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open weightment modal
  const handleOpenWeightment = () => {
    if (!formData.qty || parseInt(formData.qty) <= 0) {
      setError('Please enter valid quantity first');
      return;
    }
    
    const qty = parseInt(formData.qty);
    const grossPerBale = parseFloat(formData.grossWeight) / qty;
    const tarePerBale = parseFloat(formData.tareWeight) / qty;
    const ratePerKg = parseFloat(formData.ratePerKg) || 0;
    
    // Generate weightment rows
    const newWeightments = Array.from({ length: qty }, (_, index) => ({
      id: index + 1,
      slNo: index + 1,
      baleNo: generateBaleNumber(index + 1),
      grossWeight: grossPerBale.toFixed(3),
      tareWeight: tarePerBale.toFixed(3),
      baleWeight: (grossPerBale - tarePerBale).toFixed(3),
      baleValue: ((grossPerBale - tarePerBale) * ratePerKg).toFixed(2),
      isEdited: false
    }));
    
    setWeightments(newWeightments);
    
    // Calculate totals
    const totals = newWeightments.reduce(
      (acc, w) => {
        acc.grossWeight += parseFloat(w.grossWeight) || 0;
        acc.tareWeight += parseFloat(w.tareWeight) || 0;
        acc.baleWeight += parseFloat(w.baleWeight) || 0;
        acc.baleValue += parseFloat(w.baleValue) || 0;
        return acc;
      },
      { grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 }
    );
    
    setWeightmentTotals(totals);
    setShowWeightmentModal(true);
  };

  // Generate bale number
  const generateBaleNumber = (index) => {
    const prefix = "BL";
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const lotCode = formData.lotNo.slice(-4);
    return `${prefix}-${dateCode}-${lotCode}-${index.toString().padStart(3, '0')}`;
  };

  // Handle weightment change
  const handleWeightmentChange = (index, field, value) => {
    const updatedWeightments = [...weightments];
    const numValue = value === '' ? '' : parseFloat(value) || 0;
    
    updatedWeightments[index][field] = numValue;
    updatedWeightments[index].isEdited = true;
    
    // Recalculate bale weight if gross or tare changes
    if (field === 'grossWeight' || field === 'tareWeight') {
      const gross = parseFloat(updatedWeightments[index].grossWeight) || 0;
      const tare = parseFloat(updatedWeightments[index].tareWeight) || 0;
      const baleWeight = gross - tare;
      updatedWeightments[index].baleWeight = baleWeight.toFixed(3);
      
      // Recalculate bale value
      const ratePerKg = parseFloat(formData.ratePerKg) || 0;
      updatedWeightments[index].baleValue = (baleWeight * ratePerKg).toFixed(2);
    }
    
    // Recalculate bale value if bale weight changes
    if (field === 'baleWeight') {
      const ratePerKg = parseFloat(formData.ratePerKg) || 0;
      updatedWeightments[index].baleValue = (numValue * ratePerKg).toFixed(2);
    }
    
    setWeightments(updatedWeightments);
    
    // Recalculate totals
    const totals = updatedWeightments.reduce(
      (acc, w) => {
        acc.grossWeight += parseFloat(w.grossWeight) || 0;
        acc.tareWeight += parseFloat(w.tareWeight) || 0;
        acc.baleWeight += parseFloat(w.baleWeight) || 0;
        acc.baleValue += parseFloat(w.baleValue) || 0;
        return acc;
      },
      { grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 }
    );
    
    setWeightmentTotals(totals);
  };

  // Validate weightments before submit
  const validateWeightments = () => {
    // Check if totals match header values
    const headerGross = parseFloat(formData.grossWeight) || 0;
    const headerTare = parseFloat(formData.tareWeight) || 0;
    const headerNet = parseFloat(formData.nettWeight) || 0;
    
    const weightmentGross = weightmentTotals.grossWeight;
    const weightmentTare = weightmentTotals.tareWeight;
    const weightmentNet = weightmentTotals.baleWeight;
    
    // Allow small rounding differences (within 0.1 kg)
    const tolerance = 0.1;
    
    const grossMatch = Math.abs(headerGross - weightmentGross) <= tolerance;
    const tareMatch = Math.abs(headerTare - weightmentTare) <= tolerance;
    const netMatch = Math.abs(headerNet - weightmentNet) <= tolerance;
    
    if (!grossMatch || !tareMatch || !netMatch) {
      setError(`Weightment totals must match header values. 
        Gross: ${headerGross.toFixed(3)} vs ${weightmentGross.toFixed(3)}
        Tare: ${headerTare.toFixed(3)} vs ${weightmentTare.toFixed(3)}
        Net: ${headerNet.toFixed(3)} vs ${weightmentNet.toFixed(3)}`);
      return false;
    }
    
    return true;
  };

  // Handle key down for navigation
  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const fields = ['grossWeight', 'tareWeight'];
      const currentFieldIndex = fields.indexOf(field);
      
      if (currentFieldIndex < fields.length - 1) {
        // Move to next field in same row
        const nextField = fields[currentFieldIndex + 1];
        const nextInputId = `weightment-${index}-${nextField}`;
        const nextInput = inputRefs.current[nextInputId];
        if (nextInput) nextInput.focus();
      } else {
        // Move to next row's first field
        const nextIndex = index + 1;
        if (nextIndex < weightments.length) {
          const nextInputId = `weightment-${nextIndex}-grossWeight`;
          const nextInput = inputRefs.current[nextInputId];
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  // Handle create submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!selectedInward) {
      setError('Please select an inward entry');
      return;
    }

    if (!formData.godownId) {
      setError('Please select a godown');
      return;
    }

    if (!formData.qty || parseInt(formData.qty) <= 0) {
      setError('Please enter valid quantity');
      return;
    }

    if (weightments.length === 0) {
      setError('Please add weightments first');
      return;
    }

    // Validate weightments
    if (!validateWeightments()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare lot header
      const lotHeader = {
        inwardId: selectedInward.id,
        lotNo: formData.lotNo,
        lotDate: formData.lotDate,
        qty: parseInt(formData.qty) || 0,
        freight: parseFloat(formData.freight) || 0,
        grossWeight: parseFloat(formData.grossWeight) || 0,
        tareWeight: parseFloat(formData.tareWeight) || 0,
        nettWeight: parseFloat(formData.nettWeight) || 0,
        candyRate: parseFloat(formData.candyRateWithTax) || 0,
        quintalRate: parseFloat(formData.quintalRate) || 0,
        ratePerKg: parseFloat(formData.ratePerKg) || 0,
        assessValue: parseFloat(formData.assessValue) || 0,
        godownId: parseInt(formData.godownId),
        lcNo: formData.lcNo || null,
        paymentDays: formData.paymentDays ? parseInt(formData.paymentDays) : null,
        paymentDate: formData.paymentDate || null,
        setNo: formData.setNo || null,
        cess: parseFloat(formData.cess) || 0,
        type: formData.type || null
      };

      // Prepare weightments
      const weightmentsData = weightments.map(w => ({
        baleNo: w.baleNo,
        grossWeight: parseFloat(w.grossWeight) || 0,
        tareWeight: parseFloat(w.tareWeight) || 0,
        baleWeight: parseFloat(w.baleWeight) || 0,
        baleValue: parseFloat(w.baleValue) || 0,
      }));

      // Create lot with weightments
      await inwardLotService.create(lotHeader, weightmentsData);
      
      setSuccess('Lot created successfully!');
      
      // Reset form and close modal
      setTimeout(() => {
        resetForm();
        setShowCreateModal(false);
        fetchLots();
      }, 2000);
      
    } catch (err) {
      console.error('Error creating lot:', err);
      setError(err.response?.data?.message || 'Failed to create lot');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view
  const handleView = async (id) => {
    try {
      const response = await inwardLotService.getById(id);
      setSelectedLot(response);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching lot details:', error);
      setError('Failed to load lot details');
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      setError(''); // Clear any previous errors
      
      console.log('Editing lot with ID:', id);
      
      // First, get the lot details
      const lotResponse = await inwardLotService.getById(id);
      console.log('Lot response:', lotResponse);
      
      // Check if response has data property or is direct
      const lot = lotResponse.data || lotResponse;
      
      if (!lot || !lot.id) {
        setError('Invalid lot data received');
        return;
      }
      
      setSelectedLot(lot); // Set selectedLot FIRST
      
      let godown = null; // DECLARE GODOWN HERE
      
      try {
        // Find the inward entry
        if (lot.inwardId) {
          console.log('Fetching inward entry with ID:', lot.inwardId);
          const inwardResponse = await inwardEntryService.getById(lot.inwardId);
          const inwardData = inwardResponse.inwardEntry || inwardResponse;
          setSelectedInward(inwardData);
          setInwardSearch(inwardData.inwardNo || '');
        } else {
          console.log('No inwardId found in lot data');
          setSelectedInward(null);
          setInwardSearch('');
        }
      } catch (inwardErr) {
        console.error('Error fetching inward entry:', inwardErr);
        setSelectedInward(null);
      }
      
      try {
        // Find the godown
        const godownResponse = await godownService.getAll();
        const godownsData = Array.isArray(godownResponse) ? godownResponse : [];
        godown = godownsData.find(g => g.id === lot.godownId);
        setSelectedGodown(godown);
        setGodownSearch(godown?.godownName || '');
      } catch (godownErr) {
        console.error('Error fetching godowns:', godownErr);
        setSelectedGodown(null);
      }
      
      // Populate form with lot data
      setFormData({
        // Header
        inwardId: lot.inwardId || '',
        inwardNo: lot.inwardNo || '',
        lotNo: lot.lotNo || '',
        lotDate: lot.lotDate ? lot.lotDate.split('T')[0] : new Date().toISOString().split('T')[0],
        
        // Purchase details
        supplier: lot.supplier || '',
        broker: lot.broker || '',
        variety: lot.variety || '',
        mixingGroup: lot.mixingGroup || '',
        station: lot.station || '',
        companyBroker: lot.companyBroker || '',
        rateType: lot.rateType || '',
        
        // Party details
        billNo: lot.billNo || '',
        billDate: lot.billDate || '',
        lotNoParty: lot.inwardLotNo || '',
        lorryNo: lot.lorryNo || '',
        date: lot.inwardDate || '',
        candyRate: lot.inwardCandyRate || '',
        pMark: lot.pMark || '',
        pressRunningNo: lot.pressRunningNo || '',
        commisType: lot.commisType || '',
        commisValue: lot.commisValue || '',
        permitNo: lot.permitNo || '',
        comm: lot.comm || '',
        cooly: lot.cooly || '',
        bale: lot.bale || '',
        
        // Tax details
        gst: lot.gst || '',
        sgst: lot.sgst || '',
        cgst: lot.cgst || '',
        igst: lot.igst || '',
        sgstAmount: lot.sgstAmount || '',
        cgstAmount: lot.cgstAmount || '',
        igstAmount: lot.igstAmount || '',
        Tax: lot.Tax || '',
        TaxRs: lot.TaxRs || '',
        
        // Per Qty values
        grossPerQty: lot.grossWeight && lot.qty ? (parseFloat(lot.grossWeight) / lot.qty).toFixed(3) : '',
        tarePerQty: lot.tareWeight && lot.qty ? (parseFloat(lot.tareWeight) / lot.qty).toFixed(3) : '',
        freightPerQty: lot.freight && lot.qty ? (parseFloat(lot.freight) / lot.qty).toFixed(2) : '',
        
        // User inputs
        godownId: lot.godownId || '',
        godownName: godown?.godownName || '',
        qty: lot.qty || '',
        paymentDays: lot.paymentDays || '',
        lcNo: lot.lcNo || '',
        setNo: lot.setNo || '',
        cess: lot.cess || '0',
        type: lot.type || '',
        
        // Calculated fields
        grossWeight: lot.grossWeight || '',
        tareWeight: lot.tareWeight || '',
        nettWeight: lot.nettWeight || '',
        freight: lot.freight || '0',
        candyRateWithTax: lot.candyRate || '',
        ratePerKg: lot.ratePerKg || '',
        quintalRate: lot.quintalRate || '',
        assessValue: lot.assessValue || ''
      });
      
      // Set weightments
      if (lot.weightments && lot.weightments.length > 0) {
        const formattedWeightments = lot.weightments.map((w, index) => ({
          id: w.id || index + 1,
          slNo: index + 1,
          baleNo: w.baleNo,
          grossWeight: w.grossWeight,
          tareWeight: w.tareWeight,
          baleWeight: w.baleWeight,
          baleValue: w.baleValue,
          isEdited: false
        }));
        
        setWeightments(formattedWeightments);
        
        // Calculate totals
        const totals = formattedWeightments.reduce(
          (acc, w) => {
            acc.grossWeight += parseFloat(w.grossWeight) || 0;
            acc.tareWeight += parseFloat(w.tareWeight) || 0;
            acc.baleWeight += parseFloat(w.baleWeight) || 0;
            acc.baleValue += parseFloat(w.baleValue) || 0;
            return acc;
          },
          { grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 }
        );
        
        setWeightmentTotals(totals);
      }
      
      // Open the edit modal
      setShowEditModal(true);
      
    } catch (error) {
      console.error('Error loading lot for edit:', error);
      setError('Failed to load lot details for editing');
    }
  };

  // Handle update submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Selected lot in update:', selectedLot);
    console.log('Selected lot ID:', selectedLot?.id);
    
    if (!selectedLot) {
      setError('No lot selected for update');
      return;
    }

    if (!selectedLot.id) {
      setError('Invalid lot data: missing ID');
      return;
    }

    if (weightments.length === 0) {
      setError('Please add weightments first');
      return;
    }

    // Validate weightments
    if (!validateWeightments()) {
      return;
    }
    
    setSubmitting(true);
    try {
      // Prepare lot header
      const lotHeader = {
        inwardId: selectedInward?.id || selectedLot.inwardId,
        lotNo: formData.lotNo,
        lotDate: formData.lotDate,
        qty: parseInt(formData.qty) || 0,
        freight: parseFloat(formData.freight) || 0,
        grossWeight: parseFloat(formData.grossWeight) || 0,
        tareWeight: parseFloat(formData.tareWeight) || 0,
        nettWeight: parseFloat(formData.nettWeight) || 0,
        candyRate: parseFloat(formData.candyRateWithTax) || 0,
        quintalRate: parseFloat(formData.quintalRate) || 0,
        ratePerKg: parseFloat(formData.ratePerKg) || 0,
        assessValue: parseFloat(formData.assessValue) || 0,
        godownId: parseInt(formData.godownId),
        lcNo: formData.lcNo || null,
        paymentDays: formData.paymentDays ? parseInt(formData.paymentDays) : null,
        paymentDate: formData.paymentDate || null,
        setNo: formData.setNo || null,
        cess: parseFloat(formData.cess) || 0,
        type: formData.type || null
      };

      // Prepare weightments
      const weightmentsData = weightments.map(w => ({
        id: w.id, // Include ID if it exists (for updating existing weightments)
        baleNo: w.baleNo,
        grossWeight: parseFloat(w.grossWeight) || 0,
        tareWeight: parseFloat(w.tareWeight) || 0,
        baleWeight: parseFloat(w.baleWeight) || 0,
        baleValue: parseFloat(w.baleValue) || 0,
      }));
      
      console.log('Updating lot with ID:', selectedLot.id);
      console.log('Lot header:', lotHeader);
      console.log('Weightments:', weightmentsData);
      
      // Update lot with weightments
      await inwardLotService.update(selectedLot.id, lotHeader, weightmentsData);
      
      setSuccess('Lot updated successfully!');
      
      // Reset and close
      setTimeout(() => {
        setShowEditModal(false);
        fetchLots();
        resetForm();
      }, 2000);
      
    } catch (err) {
      console.error('Error updating lot:', err);
      setError(err.response?.data?.message || 'Failed to update lot');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id, lotNo) => {
    if (!window.confirm(`Are you sure you want to delete lot "${lotNo}"?`)) {
      return;
    }

    try {
      await inwardLotService.delete(id);
      setSuccess('Lot deleted successfully!');
      fetchLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete lot');
    }
  };

  // Export lots
  const exportLots = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Lot No',
        'Lot Date',
        'Quantity',
        'Gross Weight',
        'Tare Weight',
        'Nett Weight',
        'Candy Rate',
        'Quintal Rate',
        'Rate/Kg',
        'Assess Value',
        'Freight',
        'Created Date'
      ];
      
      // Create CSV content
      const csvContent = "data:text/csv;charset=utf-8," +
        headers.join(',') + '\n' +
        filteredLots.map(lot => {
          return [
            `"${lot.lotNo || ''}"`,
            `"${lot.lotDate || ''}"`,
            lot.qty || 0,
            lot.grossWeight || 0,
            lot.tareWeight || 0,
            lot.nettWeight || 0,
            lot.candyRate || 0,
            lot.quintalRate || 0,
            lot.ratePerKg || 0,
            lot.assessValue || 0,
            lot.freight || 0,
            `"${lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('en-IN') : ''}"`
          ].join(',');
        }).join('\n');
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inward-lots-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Lots exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export lots');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      inwardId: '',
      inwardNo: '',
      lotNo: '',
      lotDate: new Date().toISOString().split('T')[0],
      supplier: '',
      broker: '',
      variety: '',
      mixingGroup: '',
      station: '',
      companyBroker: '',
      rateType: '',
      billNo: '',
      billDate: '',
      lotNoParty: '',
      lorryNo: '',
      date: '',
      candyRate: '',
      pMark: '',
      pressRunningNo: '',
      commisType: '',
      commisValue: '',
      permitNo: '',
      comm: '',
      cooly: '',
      bale: '',
      gst: '',
      sgst: '',
      cgst: '',
      igst: '',
      sgstAmount: '',
      cgstAmount: '',
      igstAmount: '',
      Tax: '',
      TaxRs: '',
      grossPerQty: '',
      tarePerQty: '',
      freightPerQty: '',
      godownId: '',
      godownName: '',
      qty: '',
      paymentDays: '',
      lcNo: '',
      setNo: '',
      cess: '0',
      type: '',
      grossWeight: '',
      tareWeight: '',
      nettWeight: '',
      freight: '',
      candyRateWithTax: '',
      ratePerKg: '',
      quintalRate: '',
      assessValue: ''
    });
    setSelectedInward(null);
    setSelectedGodown(null);
    setWeightments([]);
    setWeightmentTotals({ grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 });
    setInwardSearch('');
    setGodownSearch('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format number with 3 decimals
  const formatNumber = (value, decimals = 3) => {
    if (value === undefined || value === null || value === '') return '0';
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toFixed(decimals);
  };

  // Filter lots based on search
  const filteredLots = lots.filter(lot => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (lot.lotNo && lot.lotNo.toLowerCase().includes(searchLower))
    );
  });

  // Filter inward entries
  const filteredInwardEntries = inwardEntries.filter(entry => {
    if (!inwardSearch.trim()) return true;
    const searchLower = inwardSearch.toLowerCase();
    return (
      (entry.inwardNo && entry.inwardNo.toLowerCase().includes(searchLower))
    );
  });

  // Filter godowns
  const filteredGodowns = godowns.filter(godown => {
    if (!godownSearch.trim()) return true;
    const searchLower = godownSearch.toLowerCase();
    return (
      (godown.godownName && godown.godownName.toLowerCase().includes(searchLower))
    );
  });

  // Open create modal with auto-generated lot number
  const openCreateModal = () => {
    resetForm();
    fetchNextLotNo();
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Inward Lot Management</h1>
            <p className="text-gray-600">Manage all inward lots and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
          >
            <span className="mr-2">+</span>
            Add New Lot
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">✕</button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">✕</button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search lots by lot number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportLots}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchLots}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lots ({filteredLots.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading lots...</p>
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
            <p className="text-gray-600 mb-2">No lots found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first lot
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CODE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOT NO (QTY, FREIGHT)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PURCHASE ORDER NO (CANDY RATE)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INWARD NO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLots.map((lot, index) => (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{String(index + 1).padStart(4, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lot.lotNo || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {lot.qty || 0} bales | Freight: ₹{lot.freight || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lot.InwardEntry?.purchaseOrder?.orderNo || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Candy Rate: ₹{lot.candyRate || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lot.InwardEntry?.inwardNo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(lot.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(lot.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lot.id, lot.lotNo)}
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

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredLots.length} of {lots.length} lots
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Inward Lot</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Inward Number Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inward Number *
                    </label>
                    <div className="relative" ref={inwardRef}>
                      <input
                        type="text"
                        value={inwardSearch}
                        onChange={(e) => {
                          setInwardSearch(e.target.value);
                          setShowInwardDropdown(true);
                        }}
                        onFocus={() => setShowInwardDropdown(true)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type to search inward number..."
                        required
                      />
                      {selectedInward && (
                        <button
                          type="button"
                          onClick={clearInwardSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                      
                      {showInwardDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {inwardLoading ? (
                            <div className="p-4 text-center">
                              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              <p className="mt-2 text-sm text-gray-500">Loading inward entries...</p>
                            </div>
                          ) : filteredInwardEntries.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {inwardSearch ? 'No inward entries found' : 'No inward entries available'}
                            </div>
                          ) : (
                            filteredInwardEntries.slice(0, 10).map((entry) => (
                              <div
                                key={entry.id}
                                onClick={() => handleInwardSelect(entry.id)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                  selectedInward?.id === entry.id ? 'bg-blue-100' : ''
                                }`}
                              >
                                <div className="font-medium text-gray-900">{entry.inwardNo}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Date: {formatDate(entry.inwardDate)} | Qty: {entry.noOfBales || 0} bales
                                </div>
                              </div>
                            ))
                          )}
                          {filteredInwardEntries.length > 10 && (
                            <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                              Showing 10 of {filteredInwardEntries.length} results. Type to search more.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lot No - Auto-generated */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot No. *
                    </label>
                    {lotNoLoading ? (
                      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <span className="w-4 h-4 animate-spin inline-block mr-2 text-gray-400 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                        <span className="text-gray-500">Generating lot number...</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="lotNo"
                        value={formData.lotNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono"
                        placeholder="Auto-generated"
                        readOnly
                        required
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">Auto-generated lot number</p>
                  </div>

                  {/* Lot Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot Date *
                    </label>
                    <input
                      type="date"
                      name="lotDate"
                      value={formData.lotDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {selectedInward && (
                  <>
                    {/* Purchase Details */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Supplier</label>
                          <div className="font-medium">{formData.supplier || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Broker</label>
                          <div className="font-medium">{formData.broker || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Variety</label>
                          <div className="font-medium">{formData.variety || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Mixing</label>
                          <div className="font-medium">{formData.mixingGroup || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Station</label>
                          <div className="font-medium">{formData.station || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Company Broker</label>
                          <div className="font-medium">{formData.companyBroker || 'NONE'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Rate Type</label>
                          <div className="font-medium">{formData.rateType || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Party Details */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Party details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Bill No.</label>
                          <div className="font-medium">{formData.billNo || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Bill Date</label>
                          <div className="font-medium">{formatDate(formData.billDate)}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Lot No.</label>
                          <div className="font-medium">{formData.lotNoParty || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Lorry No.</label>
                          <div className="font-medium">{formData.lorryNo || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Date</label>
                          <div className="font-medium">{formatDate(formData.date)}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Candy Rate</label>
                          <div className="font-medium">₹{formData.candyRate || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">P. Mark</label>
                          <div className="font-medium">{formData.pMark || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Press Running No.</label>
                          <div className="font-medium">{formData.pressRunningNo || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Commis. Type</label>
                          <div className="font-medium">{formData.commisType || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Commis. Value</label>
                          <div className="font-medium">₹{formData.commisValue || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Permit No.</label>
                          <div className="font-medium">{formData.permitNo || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Commission</label>
                          <div className="font-medium">₹{formData.comm || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Cooly</label>
                          <div className="font-medium">₹{formData.cooly || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Bale</label>
                          <div className="font-medium">₹{formData.bale || '0'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tax Details */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">GST %</label>
                          <div className="font-medium">{formData.gst || '0'}%</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">SGST %</label>
                          <div className="font-medium">{formData.sgst || '0'}%</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">CGST %</label>
                          <div className="font-medium">{formData.cgst || '0'}%</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">IGST %</label>
                          <div className="font-medium">{formData.igst || '0'}%</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">SGST Amt</label>
                          <div className="font-medium">₹{formData.sgstAmount || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">CGST Amt</label>
                          <div className="font-medium">₹{formData.cgstAmount || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">IGST Amt</label>
                          <div className="font-medium">₹{formData.igstAmount || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Total Tax</label>
                          <div className="font-medium">₹{formData.TaxRs || '0'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Per Qty Values */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Per Quantity Values</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Gross Per Qty</label>
                          <div className="font-medium">{formData.grossPerQty || '0'} kg</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Tare Per Qty</label>
                          <div className="font-medium">{formData.tarePerQty || '0'} kg</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Freight Per Qty</label>
                          <div className="font-medium">₹{formData.freightPerQty || '0'}</div>
                        </div>
                      </div>
                    </div>

                    {/* User Input Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lot Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Godown *
                          </label>
                          <div className="relative" ref={godownRef}>
                            <input
                              type="text"
                              value={godownSearch}
                              onChange={(e) => {
                                setGodownSearch(e.target.value);
                                setShowGodownDropdown(true);
                              }}
                              onFocus={() => setShowGodownDropdown(true)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Type to search godown..."
                              required
                            />
                            {selectedGodown && (
                              <button
                                type="button"
                                onClick={clearGodownSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {showGodownDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {godownLoading ? (
                                  <div className="p-4 text-center">
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading godowns...</p>
                                  </div>
                                ) : filteredGodowns.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    {godownSearch ? 'No godowns found' : 'No godowns available'}
                                  </div>
                                ) : (
                                  filteredGodowns.slice(0, 10).map((godown) => (
                                    <div
                                      key={godown.id}
                                      onClick={() => handleGodownSelect(godown)}
                                      className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                        selectedGodown?.id === godown.id ? 'bg-blue-100' : ''
                                      }`}
                                    >
                                      <div className="font-medium text-gray-900">{godown.godownName}</div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {godown.locationName || 'N/A'} | Code: #{godown.code || 'N/A'}
                                      </div>
                                    </div>
                                  ))
                                )}
                                {filteredGodowns.length > 10 && (
                                  <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                                    Showing 10 of {filteredGodowns.length} results. Type to search more.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity (Bales) *
                          </label>
                          <input
                            type="number"
                            name="qty"
                            value={formData.qty}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter quantity"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            LC No.
                          </label>
                          <input
                            type="text"
                            name="lcNo"
                            value={formData.lcNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter LC number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Days
                          </label>
                          <input
                            type="number"
                            name="paymentDays"
                            value={formData.paymentDays}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter payment days"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Set No.
                          </label>
                          <input
                            type="text"
                            name="setNo"
                            value={formData.setNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter set number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cess
                          </label>
                          <input
                            type="number"
                            name="cess"
                            value={formData.cess}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter cess"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter type"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calculated Values */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Calculated Values</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Gross Weight</label>
                          <div className="font-medium text-blue-600">{formData.grossWeight || '0'} kg</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Tare Weight</label>
                          <div className="font-medium text-blue-600">{formData.tareWeight || '0'} kg</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Nett Weight</label>
                          <div className="font-medium text-blue-600">{formData.nettWeight || '0'} kg</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Freight</label>
                          <div className="font-medium text-blue-600">₹{formData.freight || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Candy Rate (with tax)</label>
                          <div className="font-medium text-green-600">₹{formData.candyRateWithTax || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Rate/Kg</label>
                          <div className="font-medium text-green-600">₹{formData.ratePerKg || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Quintal Rate</label>
                          <div className="font-medium text-green-600">₹{formData.quintalRate || '0'}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Assess Value</label>
                          <div className="font-medium text-green-600">₹{formData.assessValue || '0'}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleOpenWeightment}
                    disabled={!selectedInward || !formData.qty}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Weighment
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting || !selectedInward || !formData.godownId || !formData.qty || weightments.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Lot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Weightment Modal */}
      {showWeightmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Bale Weightment Details</h3>
                <button
                  onClick={() => setShowWeightmentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Header Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="text-xs text-gray-500">Header Gross</label>
                  <div className="font-semibold">{parseFloat(formData.grossWeight || 0).toFixed(3)} kg</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Header Tare</label>
                  <div className="font-semibold">{parseFloat(formData.tareWeight || 0).toFixed(3)} kg</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Header Net</label>
                  <div className="font-semibold">{parseFloat(formData.nettWeight || 0).toFixed(3)} kg</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rate/Kg</label>
                  <div className="font-semibold">₹{parseFloat(formData.ratePerKg || 0).toFixed(2)}</div>
                </div>
              </div>

              {/* Weightment Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BALE NO</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GROSS WEIGHT (KG)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TARE WEIGHT (KG)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BALE WEIGHT (KG)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BALE VALUE (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weightments.map((weightment, index) => (
                      <tr key={weightment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-mono">{weightment.baleNo}</td>
                        <td className="px-4 py-2">
                          <input
                            ref={el => inputRefs.current[`weightment-${index}-grossWeight`] = el}
                            type="number"
                            value={weightment.grossWeight}
                            onChange={(e) => handleWeightmentChange(index, 'grossWeight', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'grossWeight')}
                            onWheel={(e) => e.target.blur()}
                            step="0.001"
                            className={`w-32 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              weightment.isEdited ? 'border-yellow-500' : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            ref={el => inputRefs.current[`weightment-${index}-tareWeight`] = el}
                            type="number"
                            value={weightment.tareWeight}
                            onChange={(e) => handleWeightmentChange(index, 'tareWeight', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'tareWeight')}
                            onWheel={(e) => e.target.blur()}
                            step="0.001"
                            className={`w-32 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              weightment.isEdited ? 'border-yellow-500' : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {parseFloat(weightment.baleWeight || 0).toFixed(3)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          ₹{parseFloat(weightment.baleValue || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-4 py-2 text-sm">Totals</td>
                      <td className="px-4 py-2 text-sm">{weightmentTotals.grossWeight.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm">{weightmentTotals.tareWeight.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm">{weightmentTotals.baleWeight.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm">₹{weightmentTotals.baleValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowWeightmentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowWeightmentModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save Weightments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Lot Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Lot No</p>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedLot.lotNo}</h4>
                    <p className="text-sm text-gray-600">Date: {formatDate(selectedLot.lotDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Rate Type</p>
                    <p className="text-lg font-semibold">{selectedLot.rateType || 'CANDY'}</p>
                  </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Purchase Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Purchase Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Supplier</p>
                          <p className="font-medium">{selectedLot.supplier || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Broker</p>
                          <p className="font-medium">{selectedLot.broker || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Variety</p>
                          <p className="font-medium">{selectedLot.variety || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Mixing Group</p>
                          <p className="font-medium">{selectedLot.mixingGroup || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Station</p>
                          <p className="font-medium">{selectedLot.station || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Company Broker</p>
                          <p className="font-medium">{selectedLot.companyBroker || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Party Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Party Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Bill No.</p>
                          <p className="font-medium">{selectedLot.billNo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bill Date</p>
                          <p className="font-medium">{formatDate(selectedLot.billDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Inward Lot No.</p>
                          <p className="font-medium">{selectedLot.inwardLotNo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">P. Mark</p>
                          <p className="font-medium">{selectedLot.pMark || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Press Running No.</p>
                          <p className="font-medium">{selectedLot.pressRunningNo || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Weight */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Quantity & Weight</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Quantity (Bales)</p>
                          <p className="font-bold text-xl">{selectedLot.qty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gross Weight</p>
                          <p className="font-medium">{formatNumber(selectedLot.grossWeight)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tare Weight</p>
                          <p className="font-medium">{formatNumber(selectedLot.tareWeight)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nett Weight</p>
                          <p className="font-semibold text-blue-600">{formatNumber(selectedLot.nettWeight)} kg</p>
                        </div>
                      </div>
                    </div>

                    {/* Godown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Godown</h5>
                      <p className="font-medium">{selectedLot.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Rate Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-green-800">Rate Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Candy Rate</p>
                          <p className="font-bold text-green-600">₹{formatNumber(selectedLot.candyRate, 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Inward Candy Rate</p>
                          <p className="font-medium">₹{formatNumber(selectedLot.inwardCandyRate, 2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rate/Kg</p>
                          <p className="font-medium">₹{formatNumber(selectedLot.ratePerKg, 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quintal Rate</p>
                          <p className="font-medium">₹{formatNumber(selectedLot.quintalRate, 2)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Assess Value</p>
                          <p className="font-semibold text-green-600">₹{formatNumber(selectedLot.assessValue, 0)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tax Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-purple-800">Tax Details</h5>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">GST</p>
                          <p className="font-medium">{formatNumber(selectedLot.gst, 2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">SGST</p>
                          <p className="font-medium">{formatNumber(selectedLot.sgst, 2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">CGST</p>
                          <p className="font-medium">{formatNumber(selectedLot.cgst, 2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">IGST</p>
                          <p className="font-medium">{formatNumber(selectedLot.igst, 2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">SGST Amt</p>
                          <p className="text-sm">₹{formatNumber(selectedLot.sgstAmount, 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">CGST Amt</p>
                          <p className="text-sm">₹{formatNumber(selectedLot.cgstAmount, 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">IGST Amt</p>
                          <p className="text-sm">₹{formatNumber(selectedLot.igstAmount, 2)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Total Tax</p>
                          <p className="font-semibold text-purple-600">₹{formatNumber(selectedLot.TaxRs, 2)} ({formatNumber(selectedLot.Tax, 2)}%)</p>
                        </div>
                      </div>
                    </div>

                    {/* Freight & Other Charges */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-orange-800">Freight & Other Charges</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Freight</p>
                          <p className="font-medium">₹{formatNumber(selectedLot.freight, 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cess</p>
                          <p className="font-medium">₹{formatNumber(selectedLot.cess, 2) || '0'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    {(selectedLot.lcNo || selectedLot.paymentDays || selectedLot.paymentDate) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-3 text-gray-800">Payment Details</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedLot.lcNo && (
                            <div>
                              <p className="text-xs text-gray-500">LC No.</p>
                              <p className="font-medium">{selectedLot.lcNo}</p>
                            </div>
                          )}
                          {selectedLot.paymentDays && (
                            <div>
                              <p className="text-xs text-gray-500">Payment Days</p>
                              <p className="font-medium">{selectedLot.paymentDays}</p>
                            </div>
                          )}
                          {selectedLot.paymentDate && (
                            <div>
                              <p className="text-xs text-gray-500">Payment Date</p>
                              <p className="font-medium">{formatDate(selectedLot.paymentDate)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Set No & Type */}
                    {(selectedLot.setNo || selectedLot.type) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-3 text-gray-800">Additional Info</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedLot.setNo && (
                            <div>
                              <p className="text-xs text-gray-500">Set No.</p>
                              <p className="font-medium">{selectedLot.setNo}</p>
                            </div>
                          )}
                          {selectedLot.type && (
                            <div>
                              <p className="text-xs text-gray-500">Type</p>
                              <p className="font-medium">{selectedLot.type}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weightments Table */}
                {selectedLot.weightments && selectedLot.weightments.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-lg font-semibold mb-4 text-gray-800">Bale Details</h5>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross (kg)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tare (kg)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale Wt (kg)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale Value (₹)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedLot.weightments.map((w, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{idx + 1}</td>
                              <td className="px-4 py-2 text-sm font-mono">{w.baleNo}</td>
                              <td className="px-4 py-2 text-sm">{formatNumber(w.grossWeight)}</td>
                              <td className="px-4 py-2 text-sm">{formatNumber(w.tareWeight)}</td>
                              <td className="px-4 py-2 text-sm font-medium">{formatNumber(w.baleWeight)}</td>
                              <td className="px-4 py-2 text-sm">₹{formatNumber(w.baleValue, 2)}</td>
                              <td className="px-4 py-2 text-sm">
                                {w.isIssued ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Issued</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Available</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          
                          {/* Totals Row */}
                          <tr className="bg-gray-100 font-semibold">
                            <td className="px-4 py-2 text-sm" colSpan="2">Totals</td>
                            <td className="px-4 py-2 text-sm">
                              {formatNumber(selectedLot.weightments.reduce((sum, w) => sum + parseFloat(w.grossWeight || 0), 0))}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {formatNumber(selectedLot.weightments.reduce((sum, w) => sum + parseFloat(w.tareWeight || 0), 0))}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {formatNumber(selectedLot.weightments.reduce((sum, w) => sum + parseFloat(w.baleWeight || 0), 0))}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              ₹{formatNumber(selectedLot.weightments.reduce((sum, w) => sum + parseFloat(w.baleValue || 0), 0), 2)}
                            </td>
                            <td className="px-4 py-2 text-sm"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm">{formatDate(selectedLot.createdAt)}</p>
                    <p className="text-xs text-gray-500">
                      {selectedLot.createdAt ? new Date(selectedLot.createdAt).toLocaleTimeString() : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm">{formatDate(selectedLot.updatedAt)}</p>
                    <p className="text-xs text-gray-500">
                      {selectedLot.updatedAt ? new Date(selectedLot.updatedAt).toLocaleTimeString() : ''}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedLot.id);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Lot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Edit Inward Lot</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inward Number
                    </label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {formData.inwardNo || 'N/A'}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot Date *
                    </label>
                    <input
                      type="date"
                      name="lotDate"
                      value={formData.lotDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Purchase Details - Read-only */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Supplier</label>
                      <div className="font-medium">{formData.supplier || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Broker</label>
                      <div className="font-medium">{formData.broker || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Variety</label>
                      <div className="font-medium">{formData.variety || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Mixing</label>
                      <div className="font-medium">{formData.mixingGroup || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Station</label>
                      <div className="font-medium">{formData.station || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Company Broker</label>
                      <div className="font-medium">{formData.companyBroker || 'NONE'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Rate Type</label>
                      <div className="font-medium">{formData.rateType || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Party Details - Read-only */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Party Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Bill No.</label>
                      <div className="font-medium">{formData.billNo || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Bill Date</label>
                      <div className="font-medium">{formatDate(formData.billDate)}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Lot No.</label>
                      <div className="font-medium">{formData.lotNoParty || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Lorry No.</label>
                      <div className="font-medium">{formData.lorryNo || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Date</label>
                      <div className="font-medium">{formatDate(formData.date)}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Candy Rate</label>
                      <div className="font-medium">₹{formData.candyRate || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">P. Mark</label>
                      <div className="font-medium">{formData.pMark || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Press Running No.</label>
                      <div className="font-medium">{formData.pressRunningNo || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Tax Details - Read-only */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">GST %</label>
                      <div className="font-medium">{formData.gst || '0'}%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">SGST %</label>
                      <div className="font-medium">{formData.sgst || '0'}%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">CGST %</label>
                      <div className="font-medium">{formData.cgst || '0'}%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">IGST %</label>
                      <div className="font-medium">{formData.igst || '0'}%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">SGST Amt</label>
                      <div className="font-medium">₹{formData.sgstAmount || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">CGST Amt</label>
                      <div className="font-medium">₹{formData.cgstAmount || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">IGST Amt</label>
                      <div className="font-medium">₹{formData.igstAmount || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Total Tax</label>
                      <div className="font-medium">₹{formData.TaxRs || '0'}</div>
                    </div>
                  </div>
                </div>

                {/* Per Qty Values - Read-only */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Per Quantity Values</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Gross Per Qty</label>
                      <div className="font-medium">{formData.grossPerQty || '0'} kg</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Tare Per Qty</label>
                      <div className="font-medium">{formData.tarePerQty || '0'} kg</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Freight Per Qty</label>
                      <div className="font-medium">₹{formData.freightPerQty || '0'}</div>
                    </div>
                  </div>
                </div>

                {/* User Input Section - Editable */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Lot Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Godown *
                      </label>
                      <div className="relative" ref={godownRef}>
                        <input
                          type="text"
                          value={godownSearch}
                          onChange={(e) => {
                            setGodownSearch(e.target.value);
                            setShowGodownDropdown(true);
                          }}
                          onFocus={() => setShowGodownDropdown(true)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type to search godown..."
                          required
                        />
                        {selectedGodown && (
                          <button
                            type="button"
                            onClick={clearGodownSelection}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                        
                        {showGodownDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {godownLoading ? (
                              <div className="p-4 text-center">
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading godowns...</p>
                              </div>
                            ) : filteredGodowns.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                {godownSearch ? 'No godowns found' : 'No godowns available'}
                              </div>
                            ) : (
                              filteredGodowns.slice(0, 10).map((godown) => (
                                <div
                                  key={godown.id}
                                  onClick={() => handleGodownSelect(godown)}
                                  className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                    selectedGodown?.id === godown.id ? 'bg-blue-100' : ''
                                  }`}
                                >
                                  <div className="font-medium text-gray-900">{godown.godownName}</div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {godown.locationName || 'N/A'} | Code: #{godown.code || 'N/A'}
                                  </div>
                                </div>
                              ))
                            )}
                            {filteredGodowns.length > 10 && (
                              <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                                Showing 10 of {filteredGodowns.length} results. Type to search more.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity (Bales) *
                      </label>
                      <input
                        type="number"
                        name="qty"
                        value={formData.qty}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter quantity"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LC No.
                      </label>
                      <input
                        type="text"
                        name="lcNo"
                        value={formData.lcNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter LC number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Days
                      </label>
                      <input
                        type="number"
                        name="paymentDays"
                        value={formData.paymentDays}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter payment days"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Set No.
                      </label>
                      <input
                        type="text"
                        name="setNo"
                        value={formData.setNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter set number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cess
                      </label>
                      <input
                        type="number"
                        name="cess"
                        value={formData.cess}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter cess"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter type"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Values - Read-only */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Calculated Values</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Gross Weight</label>
                      <div className="font-medium text-blue-600">{formData.grossWeight || '0'} kg</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Tare Weight</label>
                      <div className="font-medium text-blue-600">{formData.tareWeight || '0'} kg</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Nett Weight</label>
                      <div className="font-medium text-blue-600">{formData.nettWeight || '0'} kg</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Freight</label>
                      <div className="font-medium text-blue-600">₹{formData.freight || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Candy Rate (with tax)</label>
                      <div className="font-medium text-green-600">₹{formData.candyRateWithTax || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Rate/Kg</label>
                      <div className="font-medium text-green-600">₹{formData.ratePerKg || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Quintal Rate</label>
                      <div className="font-medium text-green-600">₹{formData.quintalRate || '0'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Assess Value</label>
                      <div className="font-medium text-green-600">₹{formData.assessValue || '0'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleOpenWeightment}
                    disabled={!formData.qty}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Weighment
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting || !formData.godownId || !formData.qty || weightments.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Lot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InwardLotPage;
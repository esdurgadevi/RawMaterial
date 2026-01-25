import React, { useState, useEffect } from 'react';
import inwardEntryService from '../../services/inwardEntryService';
import inwardLotService from '../../services/inwardLotService';

const InwardLot = () => {
  const [step, setStep] = useState(1);
  const [inwardEntries, setInwardEntries] = useState([]);
  const [selectedInward, setSelectedInward] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [partyDetails, setPartyDetails] = useState(null);
  const [selectedInwardId, setSelectedInwardId] = useState(null);
  const [formData, setFormData] = useState({
    inwardNo: '',
    lotNo: '',
    setNo: '',
    balesQty: '',
    cessPaidAmount: '',
    grossWeight: '',
    tareWeight: '',
    candyRate: '',
    quintalRate: '',
    remarks: ''
  });
  const [calculatedValues, setCalculatedValues] = useState({
    nettWeight: 0,
    ratePerKg: 0,
    invoiceValue: 0
  });
  const [weightmentRows, setWeightmentRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lotNoLoading, setLotNoLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch inward entries on component mount
  useEffect(() => {
    fetchInwardEntries();
  }, []);

  // Calculate derived values when dependent fields change
  useEffect(() => {
    const gross = parseFloat(formData.grossWeight) || 0;
    const tare = parseFloat(formData.tareWeight) || 0;
    const quintalRate = parseFloat(formData.quintalRate) || 0;
    
    const nettWeight = gross - tare;
    const ratePerKg = quintalRate / 100;
    const invoiceValue = ratePerKg * nettWeight;
    
    setCalculatedValues({
      nettWeight: nettWeight.toFixed(2),
      ratePerKg: ratePerKg.toFixed(2),
      invoiceValue: invoiceValue.toFixed(2)
    });
  }, [formData.grossWeight, formData.tareWeight, formData.quintalRate]);

  // Generate weightment rows when bale quantity changes
  useEffect(() => {
    if (formData.balesQty && formData.grossWeight && formData.tareWeight) {
      generateWeightmentRows();
    }
  }, [formData.balesQty, formData.grossWeight, formData.tareWeight, calculatedValues.ratePerKg]);

  const fetchInwardEntries = async () => {
    try {
      setLoading(true);
      const entries = await inwardEntryService.getAll();
      setInwardEntries(entries);
    } catch (error) {
      console.error('Error fetching inward entries:', error);
      alert('Failed to fetch inward entries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch next lot number
  const fetchNextLotNumber = async () => {
    try {
      setLotNoLoading(true);
      const response = await inwardLotService.getNextLotNo();
      setFormData(prev => ({ ...prev, lotNo: response || '' }));
    } catch (err) {
      console.error('Error fetching next lot number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultLotNo = `UC/${currentYear}-${nextYear}/0001`;
      setFormData(prev => ({ ...prev, lotNo: defaultLotNo }));
      setError('Could not fetch next lot number. Using default pattern.');
    } finally {
      setLotNoLoading(false);
    }
  };

  const handleInwardSelect = async (inwardId) => {
    try {
      setLoading(true);
      setError('');
      
      // Clear previous data
      setSelectedInward(null);
      setPurchaseDetails(null);
      setPartyDetails(null);
      setWeightmentRows([]);
      
      // Get inward entry details
      const inwardEntry = await inwardEntryService.getById(inwardId);
      setSelectedInward(inwardEntry);
      setSelectedInwardId(inwardId)
      // Set inward number in form
      setFormData(prev => ({ 
        ...prev, 
        inwardNo: inwardEntry.inwardNo || '',
        setNo: '',
        balesQty: '',
        cessPaidAmount: '',
        grossWeight: '',
        tareWeight: '',
        candyRate: '',
        quintalRate: '',
        remarks: ''
      }));
      
      // Fetch next lot number
      await fetchNextLotNumber();
      
      // Set purchase details from purchase order
      if (inwardEntry.purchaseOrder) {
        setPurchaseDetails({
          supplier: inwardEntry.purchaseOrder.supplier?.name || 'N/A',
          broker: inwardEntry.purchaseOrder.broker?.name || 'N/A',
          variety: inwardEntry.purchaseOrder.variety?.name || 'N/A',
          mixing: inwardEntry.purchaseOrder.mixingGroup?.name || 'N/A',
          station: inwardEntry.purchaseOrder.station?.name || 'N/A',
          orderType: inwardEntry.purchaseOrder.orderType || 'N/A',
          paymentMode: inwardEntry.purchaseOrder.paymentMode || 'N/A',
          currency: inwardEntry.purchaseOrder.currency || 'N/A',
          paymentDays: inwardEntry.purchaseOrder.paymentDays || 'N/A',
          paymentDate: inwardEntry.purchaseOrder.paymentDate || 'N/A'
        });
      } else {
        setPurchaseDetails(null);
      }
      
      // Set party details from inward entry
      setPartyDetails({
        billNo: inwardEntry.billNo || 'N/A',
        billDate: inwardEntry.billDate || 'N/A',
        lotNo: inwardEntry.lotNo || 'N/A',
        lorryNo: inwardEntry.lorryNo || 'N/A',
        date: inwardEntry.inwardDate || 'N/A',
        pMark: inwardEntry.pMark || '-',
        pressRunningNo: inwardEntry.pressRunningNo || '-',
        commisType: inwardEntry.commisType || 'N/A',
        commisValue: inwardEntry.commisValue || 0,
        gst: inwardEntry.gst || 0,
        sgst: inwardEntry.sgst || 0,
        cgst: inwardEntry.cgst || 0,
        igst: inwardEntry.igst || 0,
        tax: inwardEntry.tax || 0,
        taxAmount: inwardEntry.taxAmount || 0
      });
      
    } catch (error) {
      console.error('Error fetching inward details:', error);
      setError('Failed to fetch inward details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateWeightmentRows = () => {
    const balesQty = parseInt(formData.balesQty) || 0;
    const grossWeight = parseFloat(formData.grossWeight) || 0;
    const tareWeight = parseFloat(formData.tareWeight) || 0;
    
    if (balesQty <= 0) return;
    
    const grossPerBale = (grossWeight / balesQty).toFixed(2);
    const tarePerBale = (tareWeight / balesQty).toFixed(2);
    const baleWeight = (grossPerBale - tarePerBale).toFixed(2);
    const ratePerKg = parseFloat(calculatedValues.ratePerKg) || 0;
    const baleValue = (parseFloat(grossPerBale) * ratePerKg).toFixed(2);
    
    const rows = [];
    for (let i = 1; i <= balesQty; i++) {
      rows.push({
        baleNo: i,
        grossWeight: grossPerBale,
        tareWeight: tarePerBale,
        baleWeight: baleWeight,
        baleValue: baleValue
      });
    }
    
    setWeightmentRows(rows);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWeightmentChange = (index, field, value) => {
    const updatedRows = [...weightmentRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    
    // Recalculate bale weight and value
    const gross = parseFloat(updatedRows[index].grossWeight) || 0;
    const tare = parseFloat(updatedRows[index].tareWeight) || 0;
    const baleWeight = (gross - tare).toFixed(2);
    const ratePerKg = parseFloat(calculatedValues.ratePerKg) || 0;
    const baleValue = (gross * ratePerKg).toFixed(2);
    
    updatedRows[index] = {
      ...updatedRows[index],
      baleWeight,
      baleValue
    };
    
    setWeightmentRows(updatedRows);
  };

  const validateWeightment = () => {
    if (weightmentRows.length === 0) return false;
    
    let totalGross = 0;
    let totalTare = 0;
    
    weightmentRows.forEach(row => {
      totalGross += parseFloat(row.grossWeight) || 0;
      totalTare += parseFloat(row.tareWeight) || 0;
    });
    
    const originalGross = parseFloat(formData.grossWeight) || 0;
    const originalTare = parseFloat(formData.tareWeight) || 0;
    
    return Math.abs(totalGross - originalGross) < 0.01 && 
           Math.abs(totalTare - originalTare) < 0.01;
  };

  const validateStep1 = () => {
    if (!formData.balesQty || parseInt(formData.balesQty) <= 0) {
      return 'Bales Quantity is required and must be greater than 0';
    }
    if (!formData.grossWeight || parseFloat(formData.grossWeight) <= 0) {
      return 'Gross Weight is required and must be greater than 0';
    }
    if (!formData.tareWeight || parseFloat(formData.tareWeight) < 0) {
      return 'Tare Weight is required';
    }
    if (parseFloat(formData.grossWeight) <= parseFloat(formData.tareWeight)) {
      return 'Gross Weight must be greater than Tare Weight';
    }
    if (!formData.lotNo) {
      return 'Lot Number is required';
    }
    return '';
  };

  const handleNextStep = () => {
    if (step === 1) {
      const validationError = validateStep1();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    if (step === 2) {
      if (!validateWeightment()) {
        setError('Weightment totals do not match original weights. Please adjust.');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate final data
      if (!formData.inwardNo || !formData.lotNo) {
        setError('Missing required data');
        return;
      }
      
      // Prepare lot data
      const lotData = {
        inwardId: Number(selectedInwardId) || 0,
        lotNo: formData.lotNo,
        setNo: formData.setNo || null,
        balesQty: Number(formData.balesQty),
        cessPaidAmount: formData.cessPaidAmount ? Number(formData.cessPaidAmount) : 0,
        grossWeight: Number(formData.grossWeight),
        tareWeight: Number(formData.tareWeight),
        nettWeight: Number(calculatedValues.nettWeight),
        candyRate: formData.candyRate ? Number(formData.candyRate) : 0,
        quintalRate: formData.quintalRate ? Number(formData.quintalRate) : 0,
        ratePerKg: Number(calculatedValues.ratePerKg),
        invoiceValue: Number(calculatedValues.invoiceValue),
        remarks: formData.remarks || null
      };
      
      // Prepare weightments data - remove id field since it's not needed
      const weightmentsData = weightmentRows.map(row => ({
        baleNo: row.baleNo,
        grossWeight: Number(row.grossWeight),
        tareWeight: Number(row.tareWeight),
        baleWeight: Number(row.baleWeight),
        baleValue: Number(row.baleValue)
      }));
      
      // Create lot with weightments in a single transaction
      const createdLot = await inwardLotService.createLotWithWeightments(lotData, weightmentsData);
      console.log('Created lot with weightments:', createdLot);
      
      alert('Inward Lot created successfully!');
      
      // Reset form
      setStep(1);
      setSelectedInward(null);
      setPurchaseDetails(null);
      setPartyDetails(null);
      setFormData({
        inwardNo: '',
        lotNo: '',
        setNo: '',
        balesQty: '',
        cessPaidAmount: '',
        grossWeight: '',
        tareWeight: '',
        candyRate: '',
        quintalRate: '',
        remarks: ''
      });
      setCalculatedValues({
        nettWeight: 0,
        ratePerKg: 0,
        invoiceValue: 0
      });
      setWeightmentRows([]);
      
      // Refresh inward entries list
      fetchInwardEntries();
      
    } catch (error) {
      console.error('Error submitting:', error);
      setError(`Failed to create inward lot: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select Inward and show details
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select Inward Entry</h2>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => handleInwardSelect(e.target.value)}
          value={selectedInward?.id || ''}
          disabled={loading}
        >
          <option value="">Select Inward Number</option>
          {inwardEntries.map(entry => (
            <option key={entry.id} value={entry.id}>
              {entry.inwardNo} - {new Date(entry.inwardDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {selectedInward && (
        <>
          {/* Purchase Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Purchase Details</h2>
            {purchaseDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Supplier:</span>
                    <span>{purchaseDetails.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Broker:</span>
                    <span>{purchaseDetails.broker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Variety:</span>
                    <span>{purchaseDetails.variety}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mixing:</span>
                    <span>{purchaseDetails.mixing}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Station:</span>
                    <span>{purchaseDetails.station}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Order Type:</span>
                    <span>{purchaseDetails.orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Payment Mode:</span>
                    <span>{purchaseDetails.paymentMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Payment Days:</span>
                    <span>{purchaseDetails.paymentDays}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No purchase order linked to this inward entry</p>
            )}
          </div>

          {/* Party Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Party Details</h2>
            {partyDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Bill No:</span>
                    <span>{partyDetails.billNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Bill Date:</span>
                    <span>{partyDetails.billDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Lot No:</span>
                    <span>{partyDetails.lotNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Lorry No:</span>
                    <span>{partyDetails.lorryNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span>{partyDetails.date}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">P. Mark:</span>
                    <span>{partyDetails.pMark}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Press Running No:</span>
                    <span>{partyDetails.pressRunningNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Commis Type:</span>
                    <span>{partyDetails.commisType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Commis Value:</span>
                    <span>₹ {partyDetails.commisValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">IGST %:</span>
                    <span>{partyDetails.igst}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lot Creation Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Create Lot</h2>
            
            {/* Lot Information */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Inward No</label>
                <input
                  type="text"
                  value={formData.inwardNo}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Lot No *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lotNo"
                    value={formData.lotNo}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                  />
                  {lotNoLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Set No</label>
                <input
                  type="text"
                  name="setNo"
                  value={formData.setNo}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter set number"
                />
              </div>
            </div>

            {/* Weight and Rate Information */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Bales Qty *</label>
                <input
                  type="number"
                  name="balesQty"
                  value={formData.balesQty}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bales quantity"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Gross Weight *</label>
                <input
                  type="number"
                  name="grossWeight"
                  value={formData.grossWeight}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tare Weight *</label>
                <input
                  type="number"
                  name="tareWeight"
                  value={formData.tareWeight}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Rate and Amount Information */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Cess Paid Amount</label>
                <input
                  type="number"
                  name="cessPaidAmount"
                  value={formData.cessPaidAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Candy Rate</label>
                <input
                  type="number"
                  name="candyRate"
                  value={formData.candyRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Quintal Rate</label>
                <input
                  type="number"
                  name="quintalRate"
                  value={formData.quintalRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Calculated Values Display */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-800">Calculated Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700">Nett Weight</label>
                  <input
                    type="text"
                    value={calculatedValues.nettWeight}
                    readOnly
                    className="w-full p-3 border border-blue-300 rounded-md bg-blue-100 font-semibold text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Gross - Tare</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">Rate/Kg</label>
                  <input
                    type="text"
                    value={calculatedValues.ratePerKg}
                    readOnly
                    className="w-full p-3 border border-blue-300 rounded-md bg-blue-100 font-semibold text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Quintal Rate ÷ 100</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">Invoice Value</label>
                  <input
                    type="text"
                    value={`₹ ${calculatedValues.invoiceValue}`}
                    readOnly
                    className="w-full p-3 border border-blue-300 rounded-md bg-blue-100 font-semibold text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Rate/Kg × Nett Weight</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextStep}
              disabled={lotNoLoading || !formData.lotNo}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium flex items-center"
            >
              {lotNoLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Lot No...
                </>
              ) : (
                'Proceed to Weightment →'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Step 2: Weightment
  const renderStep2 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Weightment Details</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span><strong>Inward No:</strong> {formData.inwardNo}</span>
          <span><strong>Lot No:</strong> {formData.lotNo}</span>
          <span><strong>Total Bales:</strong> {formData.balesQty}</span>
          <span><strong>Gross Weight:</strong> {formData.grossWeight}</span>
          <span><strong>Tare Weight:</strong> {formData.tareWeight}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Bale No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Gross Weight</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Tare Weight</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Bale Weight</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bale Value (₹)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weightmentRows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap border-r">
                  <div className="text-center font-medium">{row.baleNo}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap border-r">
                  <input
                    type="number"
                    value={row.grossWeight}
                    onChange={(e) => handleWeightmentChange(index, 'grossWeight', e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap border-r">
                  <input
                    type="number"
                    value={row.tareWeight}
                    onChange={(e) => handleWeightmentChange(index, 'tareWeight', e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap border-r">
                  <div className="text-center font-medium bg-gray-50 p-2 rounded">
                    {row.baleWeight}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-center font-medium bg-gray-50 p-2 rounded">
                    ₹ {row.baleValue}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-4 py-3 font-semibold text-right" colSpan="2">
                Totals:
              </td>
              <td className="px-4 py-3 font-semibold text-center">
                {weightmentRows.reduce((sum, row) => sum + parseFloat(row.grossWeight || 0), 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 font-semibold text-center">
                {weightmentRows.reduce((sum, row) => sum + parseFloat(row.tareWeight || 0), 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 font-semibold text-center">
                ₹ {weightmentRows.reduce((sum, row) => sum + parseFloat(row.baleValue || 0), 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> You can edit individual bale weights. The system will automatically recalculate bale weight and value.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Original Gross: <strong>{formData.grossWeight}</strong>, 
              Current Total: <strong>{weightmentRows.reduce((sum, row) => sum + parseFloat(row.grossWeight || 0), 0).toFixed(2)}</strong>
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePreviousStep}
          className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
        >
          ← Back to Lot Details
        </button>
        <button
          onClick={handleNextStep}
          disabled={!validateWeightment()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          Next: Remarks →
        </button>
      </div>
    </div>
  );

  // Step 3: Remarks
  const renderStep3 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-6 border-b pb-3">Final Review & Remarks</h2>
      
      <div className="mb-8">
        <label className="block mb-3 text-sm font-medium text-gray-700">Remarks (Optional)</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleInputChange}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any additional remarks, notes, or special instructions here..."
        />
      </div>
      
      <div className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg">Lot Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Inward No:</span>
              <span className="font-semibold">{formData.inwardNo}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Lot No:</span>
              <span className="font-semibold text-blue-600">{formData.lotNo}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Set No:</span>
              <span>{formData.setNo || 'Not specified'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Bales Qty:</span>
              <span className="font-semibold">{formData.balesQty}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Gross Weight:</span>
              <span className="font-semibold">{formData.grossWeight} kg</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Tare Weight:</span>
              <span className="font-semibold">{formData.tareWeight} kg</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Nett Weight:</span>
              <span className="font-semibold text-blue-600">{calculatedValues.nettWeight} kg</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Rate/Kg:</span>
              <span className="font-semibold">₹ {calculatedValues.ratePerKg}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Invoice Value:</span>
              <span className="font-semibold text-green-600">₹ {calculatedValues.invoiceValue}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Cess Paid Amount:</span>
              <span>₹ {formData.cessPaidAmount || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weightment Summary */}
      {weightmentRows.length > 0 && (
        <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-4 text-lg text-blue-800">Weightment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Bales</div>
              <div className="text-2xl font-bold text-blue-700">{weightmentRows.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg Gross/Bale</div>
              <div className="text-xl font-semibold">
                {(weightmentRows.reduce((sum, row) => sum + parseFloat(row.grossWeight || 0), 0) / weightmentRows.length).toFixed(2)} kg
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg Tare/Bale</div>
              <div className="text-xl font-semibold">
                {(weightmentRows.reduce((sum, row) => sum + parseFloat(row.tareWeight || 0), 0) / weightmentRows.length).toFixed(2)} kg
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-2xl font-bold text-green-700">
                ₹ {weightmentRows.reduce((sum, row) => sum + parseFloat(row.baleValue || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          onClick={handlePreviousStep}
          className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
        >
          ← Back to Weightment
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition duration-200 font-medium flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Inward Lot'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Inward & Lot Management</h1>
        <p className="text-gray-600 mt-2">Create and manage inward lots with weightment tracking</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <span className="font-semibold">1</span>
            </div>
            <span className="text-sm mt-2 font-medium">Select Inward</span>
          </div>
          <div className={`flex-1 h-2 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <span className="font-semibold">2</span>
            </div>
            <span className="text-sm mt-2 font-medium">Weightment</span>
          </div>
          <div className={`flex-1 h-2 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <span className="font-semibold">3</span>
            </div>
            <span className="text-sm mt-2 font-medium">Remarks</span>
          </div>
        </div>
      </div>
      
      {loading && !lotNoLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading data, please wait...</p>
        </div>
      ) : (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </>
      )}
    </div>
  );
};

export default InwardLot;
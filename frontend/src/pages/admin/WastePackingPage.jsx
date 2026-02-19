// frontend/src/pages/admin/WastePackingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import wasteLotService from "../../services/admin1/master/wasteLotService";
import wasteMasterService from "../../services/admin1/master/wasteMasterService";
import packingTypeService from "../../services/admin1/master/packingTypeService";
import wastePackingService from "../../services/wastePackingService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash/debounce";

const WastePackingPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  
  // Form state for create
  const [formData, setFormData] = useState({
    wasteType: "",
    date: new Date().toISOString().split("T")[0],
    lotNo: "",
    stock: 0,
    packingType: "BALE",
    noOfBales: 0,
    totalWeight: 0,
    totalBales: 0,
    // Auto-populated fields
    wasteName: "",
    packingTypeName: "",
    packingTypeId: "",
    packingCode: "",
    tareWeight: 0,
    rate: 0,
    remarks: "",
  });

  // States for lot suggestions
  const [lotSuggestions, setLotSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  // States for bale details
  const [bales, setBales] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totals, setTotals] = useState({
    grossWeight: 0,
    netWeight: 0,
    tareWeight: 0,
  });

  // States for existing entries
  const [packings, setPackings] = useState([]);
  const [filteredPackings, setFilteredPackings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packingToDelete, setPackingToDelete] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debounced function to fetch lot suggestions
  const fetchLotSuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setLotSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const lots = await wasteLotService.getAll();
        const filteredLots = lots.filter(lot => 
          lot.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) && lot.active === true
        );
        setLotSuggestions(filteredLots);
      } catch (error) {
        console.error("Error fetching lots:", error);
        toast.error("Failed to fetch lot numbers");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle lot number input change
  const handleLotNoChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, lotNo: value }));
    fetchLotSuggestions(value);
    setShowSuggestions(true);
  };

  // Handle lot selection from suggestions
  const handleLotSelect = async (lot) => {
    setSelectedLot(lot);
    setFormData(prev => ({ ...prev, lotNo: lot.lotNo }));
    setShowSuggestions(false);
    
    try {
      setLoading(true);
      
      // Fetch waste master details
      const wasteMaster = await wasteMasterService.getById(lot.wasteMasterId);
      
      // Fetch packing type details
      const packingType = await packingTypeService.getById(wasteMaster.packingTypeId);
      
      // Update form with fetched data
      setFormData(prev => ({
        ...prev,
        wasteType: wasteMaster.waste,
        wasteName: wasteMaster.waste,
        packingTypeName: packingType.name,
        packingTypeId: packingType.id,
        packingCode: packingType.code,
        tareWeight: packingType.tareWeight || 0,
        rate: packingType.rate || 0,
        stock: wasteMaster.wasteKg || 0,
      }));
      
      toast.success("Lot details loaded successfully");
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to fetch waste or packing details");
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate bales when totalBales changes
  useEffect(() => {
    if (formData.totalBales > 0 && formData.totalWeight > 0) {
      const avgGross = formData.totalWeight / formData.totalBales;
      
      const newBales = Array.from({ length: formData.totalBales }, (_, index) => ({
        id: index + 1,
        slNo: index + 1,
        baleNo: generateBaleNumber(index + 1),
        grossWeight: avgGross.toFixed(3),
        tareWeight: formData.tareWeight || 0,
        netWeight: (avgGross - (formData.tareWeight || 0)).toFixed(3),
      }));

      setBales(newBales);
      setIsGenerating(false);
    }
  }, [formData.totalBales, formData.totalWeight, formData.tareWeight]);

  // Update totals whenever bales change
  useEffect(() => {
    const totals = bales.reduce(
      (acc, bale) => {
        acc.grossWeight += parseFloat(bale.grossWeight) || 0;
        acc.tareWeight += parseFloat(bale.tareWeight) || 0;
        acc.netWeight += parseFloat(bale.netWeight) || 0;
        return acc;
      },
      { grossWeight: 0, tareWeight: 0, netWeight: 0 }
    );

    setTotals(totals);
  }, [bales]);

  const generateBaleNumber = (index) => {
    const prefix = "WC";
    const dateCode = formData.date ? formData.date.replace(/-/g, "").slice(2, 6) : "3090";
    const lotCode = formData.lotNo ? formData.lotNo.slice(-2) : "00";
    return `${prefix}-${dateCode}-${lotCode}-${index.toString().padStart(3, "0")}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newValue = name.includes("Weight") || name.includes("Bales") || name === "stock" || name.includes("tare") 
      ? parseFloat(value) || 0 
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === "totalBales" && value > 0) {
      setIsGenerating(true);
    }
  };

  const handleBaleChange = (index, field, value) => {
    const updatedBales = [...bales];
    const numValue = parseFloat(value) || 0;
    
    updatedBales[index][field] = numValue;
    
    // Auto-calculate net weight
    if (field === "grossWeight" || field === "tareWeight") {
      const gross = parseFloat(updatedBales[index].grossWeight) || 0;
      const tare = parseFloat(updatedBales[index].tareWeight) || 0;
      updatedBales[index].netWeight = (gross - tare).toFixed(3);
    }
    
    setBales(updatedBales);
  };

  const validateForm = () => {
    if (!selectedLot) {
      toast.error("Please select a valid lot number");
      return false;
    }
    
    if (!formData.wasteType.trim()) {
      toast.error("Waste Type is required");
      return false;
    }
    
    if (formData.totalBales <= 0) {
      toast.error("Total Bales must be greater than 0");
      return false;
    }
    
    if (bales.length !== formData.totalBales) {
      toast.error("Number of bales doesn't match total bales");
      return false;
    }
    
    // Check if sum of gross weights equals total weight
    const totalGross = bales.reduce((sum, bale) => sum + (parseFloat(bale.grossWeight) || 0), 0);
    if (Math.abs(totalGross - formData.totalWeight) > 0.001) {
      toast.error(`Sum of gross weights (${totalGross.toFixed(3)}) must equal Total Weight (${formData.totalWeight.toFixed(3)})`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const payload = {
        lotId: selectedLot.id,
        lotNo: formData.lotNo,
        wasteMasterId: selectedLot.wasteMasterId,
        wasteType: formData.wasteType,
        date: formData.date,
        stock: formData.stock,
        packingType: formData.packingType,
        packingTypeId: formData.packingTypeId,
        tareWeight: formData.tareWeight,
        rate: formData.rate,
        noOfBales: formData.totalBales,
        totalWeight: formData.totalWeight,
        remarks: formData.remarks,
        details: bales.map(bale => ({
          baleNo: bale.baleNo,
          grossWeight: parseFloat(bale.grossWeight),
          tareWeight: parseFloat(bale.tareWeight),
          netWeight: parseFloat(bale.netWeight),
        })),
      };
      
      const result = await wastePackingService.create(payload);
      toast.success("Waste Packing created successfully!");
      
      // Reset form
      resetForm();
      
      // Refresh existing entries if on view tab
      if (activeTab === "view") {
        fetchPackings();
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create waste packing");
    }
  };

  const resetForm = () => {
    setFormData({
      wasteType: "",
      date: new Date().toISOString().split("T")[0],
      lotNo: "",
      stock: 0,
      packingType: "BALE",
      noOfBales: 0,
      totalWeight: 0,
      totalBales: 0,
      wasteName: "",
      packingTypeName: "",
      packingTypeId: "",
      packingCode: "",
      tareWeight: 0,
      rate: 0,
      remarks: "",
    });
    setSelectedLot(null);
    setLotSuggestions([]);
    setBales([]);
  };

  // Fetch existing packings
  const fetchPackings = async () => {
    try {
      setLoading(true);
      const data = await wastePackingService.getAll();
      const processedData = Array.isArray(data) ? data.map(packing => ({
        ...packing,
        totalWeight: parseFloat(packing.totalWeight) || 0,
        noOfBales: parseInt(packing.noOfBales) || 0,
        stock: parseFloat(packing.stock) || 0,
        tareWeight: parseFloat(packing.tareWeight) || 0,
        rate: parseFloat(packing.rate) || 0,
        details: Array.isArray(packing.details) ? packing.details.map(detail => ({
          ...detail,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0
        })) : []
      })) : [];
      setPackings(processedData);
      setFilteredPackings(processedData);
    } catch (error) {
      toast.error("Failed to fetch waste packings");
      console.error("Error fetching packings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load existing entries when switching to view tab
  useEffect(() => {
    if (activeTab === "view") {
      fetchPackings();
    }
  }, [activeTab]);

  // Filter entries based on search and date
  useEffect(() => {
    let filtered = packings;
    
    if (searchTerm) {
      filtered = filtered.filter(packing => 
        (packing.lotNo && packing.lotNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (packing.wasteType && packing.wasteType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (packing.packingType && packing.packingType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(packing => packing.date === dateFilter);
    }
    
    setFilteredPackings(filtered);
  }, [searchTerm, dateFilter, packings]);

  const handleViewDetails = async (id) => {
    try {
      const packing = await wastePackingService.getById(id);
      const processedPacking = {
        ...packing,
        totalWeight: parseFloat(packing.totalWeight) || 0,
        noOfBales: parseInt(packing.noOfBales) || 0,
        stock: parseFloat(packing.stock) || 0,
        tareWeight: parseFloat(packing.tareWeight) || 0,
        rate: parseFloat(packing.rate) || 0,
        details: Array.isArray(packing.details) ? packing.details.map(detail => ({
          ...detail,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0
        })) : []
      };
      setSelectedPacking(processedPacking);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to fetch packing details");
      console.error("Error fetching packing details:", error);
    }
  };

  const handleEdit = (packing) => {
    setEditingEntry(packing);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedEntry) => {
    try {
      await wastePackingService.update(updatedEntry.id, updatedEntry);
      toast.success("Entry updated successfully");
      setShowEditModal(false);
      fetchPackings();
    } catch (error) {
      toast.error("Failed to update entry");
    }
  };

  const handleDelete = async (id) => {
    try {
      await wastePackingService.delete(id);
      toast.success("Waste packing deleted successfully");
      fetchPackings();
      setShowDeleteModal(false);
      setPackingToDelete(null);
    } catch (error) {
      toast.error("Failed to delete waste packing");
    }
  };

  const confirmDelete = (id, wasteType, lotNo) => {
    setPackingToDelete({ id, wasteType, lotNo });
    setShowDeleteModal(true);
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatNumber = (value, decimals = 3) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.000";
    return num.toFixed(decimals);
  };

  const sumNumbers = (array, key) => {
    if (!array || !Array.isArray(array)) return 0;
    return array.reduce((sum, item) => {
      const val = parseFloat(item[key]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Waste Packing</h1>
              <p className="text-gray-600 mt-1">Add, modify and manage waste packing entries</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setActiveTab("view");
                  fetchPackings();
                }}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "view"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                View Existing
              </button>
              <button
                onClick={() => {
                  setActiveTab("create");
                  resetForm();
                }}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "create"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                + Create New
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "create"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Create New Entry
              </button>
              <button
                onClick={() => {
                  setActiveTab("view");
                  fetchPackings();
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "view"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                View/Edit Existing
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "create" ? (
          /* Create Tab Content */
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Lot Number with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lot Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lotNo}
                  onChange={handleLotNoChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type lot number to search..."
                  required
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && lotSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {lotSuggestions.map((lot) => (
                      <li
                        key={lot.id}
                        onClick={() => handleLotSelect(lot)}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                      >
                        {lot.lotNo}
                      </li>
                    ))}
                  </ul>
                )}
                
                {loading && <p className="text-sm text-gray-500 mt-1">Loading...</p>}
              </div>

              {/* Waste Type - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waste Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wasteType"
                  value={formData.wasteType}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Packing Type - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Packing Type
                </label>
                <input
                  type="text"
                  value={formData.packingTypeName}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Tare Weight - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tare Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.tareWeight}
                  readOnly
                  step="0.001"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Rate - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate (₹)
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  readOnly
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Stock - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Available
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  readOnly
                  step="0.001"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Total Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalWeight"
                  value={formData.totalWeight}
                  onChange={handleFormChange}
                  step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Total Bales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Bales <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalBales"
                  value={formData.totalBales}
                  onChange={handleFormChange}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Remarks */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional remarks"
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Bales</p>
                <p className="text-xl font-semibold">{formData.totalBales}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="text-xl font-semibold">{formData.totalWeight.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sum of Gross Weight</p>
                <p className={`text-xl font-semibold ${Math.abs(totals.grossWeight - formData.totalWeight) > 0.001 ? 'text-red-600' : 'text-green-600'}`}>
                  {totals.grossWeight.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average per Bale</p>
                <p className="text-xl font-semibold">
                  {formData.totalBales > 0 ? (formData.totalWeight / formData.totalBales).toFixed(3) : "0.000"}
                </p>
              </div>
            </div>

            {/* Bales Table */}
            {bales.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Bale Details</h3>
                  <span className="text-sm text-gray-600">
                    Showing {bales.length} bales
                  </span>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sl. No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bale No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross wt. (kg)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tare wt. (kg)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net wt. (kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bales.map((bale, index) => (
                        <tr key={bale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bale.slNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bale.baleNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={bale.grossWeight}
                              onChange={(e) => handleBaleChange(index, "grossWeight", e.target.value)}
                              step="0.001"
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={bale.tareWeight}
                              onChange={(e) => handleBaleChange(index, "tareWeight", e.target.value)}
                              step="0.001"
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bale.netWeight}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Totals Row */}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan="2">
                          Totals
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totals.grossWeight.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totals.tareWeight.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totals.netWeight.toFixed(3)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Validation Message */}
                {Math.abs(totals.grossWeight - formData.totalWeight) > 0.001 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Sum of gross weights ({totals.grossWeight.toFixed(3)}) does not match Total Weight ({formData.totalWeight.toFixed(3)}). 
                      Please adjust the individual bale weights.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={bales.length === 0}
                className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  bales.length === 0
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Save Packing Entry
              </button>
            </div>
          </div>
        ) : (
          /* View Tab Content - Matching the UI from image */
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Waste Packing Entries ({filteredPackings.length})</h2>
                <div className="flex gap-3">
                  <button
                    onClick={fetchPackings}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("create");
                      resetForm();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                  </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by lot number, waste type, packing type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Packings Table - Matching the image style */}
            {filteredPackings.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No waste packings found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new waste packing entry.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Packing Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight & Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPackings.map((packing) => (
                      <React.Fragment key={packing._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleRowExpand(packing._id)}
                                className="mr-3 text-gray-500 hover:text-gray-700"
                              >
                                <svg
                                  className={`w-5 h-5 transform ${expandedRow === packing._id ? 'rotate-90' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {packing.lotNo || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {packing.wasteType || 'Unknown'} | {packing.packingType || 'N/A'}
                                </div>
                                {packing.remarks && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {packing.remarks}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">{packing.noOfBales || 0}</span> bales
                            </div>
                            <div className="text-sm text-gray-500">
                              Gross: {formatNumber(packing.totalWeight)} kg
                            </div>
                            <div className="text-sm text-gray-500">
                              Tare: {formatNumber(packing.tareWeight * (packing.noOfBales || 0))} kg
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              Net: {formatNumber(packing.totalWeight - (packing.tareWeight * (packing.noOfBales || 0)))} kg
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {packing.date ? new Date(packing.date).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                            {packing.rate > 0 && (
                              <div className="text-sm text-gray-500">
                                Rate: ₹{formatNumber(packing.rate, 2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleViewDetails(packing._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEdit(packing)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(packing._id, packing.wasteType, packing.lotNo)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row for Bale Details */}
                        {expandedRow === packing._id && packing.details && packing.details.length > 0 && (
                          <tr className="bg-gray-50">
                            <td colSpan="4" className="px-6 py-4">
                              <div className="ml-8">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bale Details</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gross (kg)</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tare (kg)</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net (kg)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {packing.details.slice(0, 5).map((detail, idx) => (
                                        <tr key={idx}>
                                          <td className="px-3 py-2 text-sm text-gray-500">{detail.baleNo || 'N/A'}</td>
                                          <td className="px-3 py-2 text-sm text-gray-500">{formatNumber(detail.grossWeight)}</td>
                                          <td className="px-3 py-2 text-sm text-gray-500">{formatNumber(detail.tareWeight)}</td>
                                          <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatNumber(detail.netWeight)}</td>
                                        </tr>
                                      ))}
                                      {packing.details.length > 5 && (
                                        <tr>
                                          <td colSpan="4" className="px-3 py-2 text-sm text-gray-500 text-center">
                                            ... and {packing.details.length - 5} more bales
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedPacking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Waste Packing Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lot Number</label>
                  <p className="text-lg font-semibold">{selectedPacking.lotNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Waste Type</label>
                  <p className="text-lg">{selectedPacking.wasteType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Packing Type</label>
                  <p className="text-lg">{selectedPacking.packingType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rate</label>
                  <p className="text-lg">₹ {formatNumber(selectedPacking.rate, 2)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg">{selectedPacking.date ? new Date(selectedPacking.date).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">No. of Bales</label>
                  <p className="text-lg font-semibold">{selectedPacking.noOfBales || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Weight</label>
                  <p className="text-lg font-semibold text-blue-600">{formatNumber(selectedPacking.totalWeight)} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Remarks</label>
                  <p className="text-lg">{selectedPacking.remarks || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Bale Details Table in Modal */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Bale Details</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross wt. (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tare wt. (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net wt. (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedPacking.details || []).map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{detail.baleNo || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.grossWeight)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.tareWeight)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatNumber(detail.netWeight)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-sm text-gray-900">Totals</td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'grossWeight'))}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'tareWeight'))}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'netWeight'))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedPacking);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit This Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && packingToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Waste Packing</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center">
                  Are you sure you want to delete this waste packing entry?
                </p>
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Lot: {packingToDelete.lotNo} - {packingToDelete.wasteType}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone. All bale details will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPackingToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(packingToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WastePackingPage;
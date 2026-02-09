// frontend/src/pages/admin/CreateWastePacking.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import wastePackingService from "../../services/wastePackingService";

const CreateWastePacking = () => {
  const [formData, setFormData] = useState({
    wasteType: "",
    date: new Date().toISOString().split("T")[0], // Today's date
    lotNo: "",
    stock: 0,
    packingType: "BALE",
    noOfBales: 0,
    totalWeight: 0,
    totalBales: 0, // This will trigger row generation
  });

  const [bales, setBales] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totals, setTotals] = useState({
    grossWeight: 0,
    netWeight: 0,
    tareWeight: 0,
  });

  // Auto-calculate initial gross weight when totalBales changes
  useEffect(() => {
    if (formData.totalBales > 0 && formData.totalWeight > 0) {
      const avgGross = formData.totalWeight / formData.totalBales;
      
      const newBales = Array.from({ length: formData.totalBales }, (_, index) => ({
        id: index + 1,
        slNo: index + 1,
        baleNo: generateBaleNumber(index + 1),
        grossWeight: avgGross.toFixed(3),
        tareWeight: 0,
        netWeight: avgGross.toFixed(3),
      }));

      setBales(newBales);
      setIsGenerating(false);
    }
  }, [formData.totalBales, formData.totalWeight]);

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
    const lotCode = formData.lotNo ? formData.lotNo.padStart(2, "0") : "00";
    return `${prefix}-${dateCode}-${lotCode}-${index.toString().padStart(3, "0")}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newValue = name.includes("Weight") || name.includes("Bales") || name === "stock" 
      ? parseFloat(value) || 0 
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // If totalBales changes, set generating state
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
      updatedBales[index].netWeight = (gross + tare).toFixed(3);
    }
    
    setBales(updatedBales);
  };

  const validateForm = () => {
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
        wasteType: formData.wasteType,
        date: formData.date,
        lotNo: formData.lotNo,
        stock: formData.stock,
        packingType: formData.packingType,
        noOfBales: formData.noOfBales || formData.totalBales,
        totalWeight: formData.totalWeight,
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
      setFormData({
        wasteType: "",
        date: new Date().toISOString().split("T")[0],
        lotNo: "",
        stock: 0,
        packingType: "BALE",
        noOfBales: 0,
        totalWeight: 0,
        totalBales: 0,
      });
      setBales([]);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create waste packing");
    }
  };

  const handleReset = () => {
    setFormData({
      wasteType: "",
      date: new Date().toISOString().split("T")[0],
      lotNo: "",
      stock: 0,
      packingType: "BALE",
      noOfBales: 0,
      totalWeight: 0,
      totalBales: 0,
    });
    setBales([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Packing</h1>
          <p className="text-gray-600 mt-2">To Modify the Packing Entry Details</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Waste Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waste Type <span className="text-red-500">*</span>
              </label>
              <select
                name="wasteType"
                value={formData.wasteType}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Waste Type</option>
                <option value="COMBER NOILS">COMBER NOILS</option>
                <option value="RF">RF</option>
                <option value="CARD">CARD</option>
                <option value="OTHER">OTHER</option>
              </select>
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

            {/* Lot No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot No
              </label>
              <input
                type="text"
                name="lotNo"
                value={formData.lotNo}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Lot Number"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleFormChange}
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Packing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Packing Type
              </label>
              <select
                name="packingType"
                value={formData.packingType}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BALE">BALE</option>
                <option value="BAG">BAG</option>
                <option value="BOX">BOX</option>
                <option value="BORAH">BORAH</option>
              </select>
            </div>

            {/* No. of Bales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. of Bales
              </label>
              <input
                type="number"
                name="noOfBales"
                value={formData.noOfBales}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight <span className="text-red-500">*</span>
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

            {/* Total Bales (triggers row generation) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Bales (Rows) <span className="text-red-500">*</span>
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
              {isGenerating && (
                <p className="text-sm text-blue-600 mt-1">Generating {formData.totalBales} bales...</p>
              )}
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
                        Gross wt.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tare wt.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net wt.
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
              onClick={handleReset}
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
      </div>
    </div>
  );
};

export default CreateWastePacking;
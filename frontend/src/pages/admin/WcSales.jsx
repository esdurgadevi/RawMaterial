// src/pages/WasteInvoiceTypeMaster.jsx
import { useState, useEffect } from "react";
import wasteInvoiceTypeService from "../../services/wasteInvoiceTypeService";

const WasteInvoiceTypeMaster = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state - all fields from screenshot
  const [formData, setFormData] = useState({
    code: "",
    invoiceType: "",
    roundOffDigits: 0,
    assessValueFormula: "[Total Kgs]*([Rate / kg]/[Rate Per])",
    charityBale: 0,
    charityFormula: "[Total Kgs]*[CharityRs]",
    taxVat: 0,
    taxVatFormula: "-",
    gst: 5,
    cgstFormula: "Round(([X]*[CGST %])/100)",
    sgstFormula: "Round(([X]*[SGST %])/100)",
    igst: 0,
    igstFormula: "-",
    duty: 0,
    dutyFormula: "-",
    cess: 1,
    cessFormula: "([X]*[ChessRs])/100",
    hrSecCess: 0,
    hrSecCessFormula: "-",
    tcs: 0.75,
    tcsFormula: "([X]*[TCSRs])/100",
    cst: 0,
    cstFormula: "-",
    cenvat: 0,
    cenvatFormula: "-",
    subTotalFormula: "[X]+[D]+[F]",
    totalValueFormula: "[H]+[GstAmt]+[IGstAmt]",
    roundOffFormula: "ROUND OFF",
    packingForwardingFormula: "-",
    accPosting: true,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Allowed variables (exact from your screenshot + your list)
  const allowedVariables = [
    "[X]", "[A]", "[B]", "[C]", "[D]", "[E]", "[F]", "[G]", "[H]", "[I]", "[J]",
    "[Total Kgs]", "[Rate / kg]", "[Rate Per]", "[CharityRs]", "[ChessRs]",
    "[TCSRs]", "[CGST %]", "[SGST %]", "[IGST %]", "[DutyRs]", "[HSCessRs]",
    "[Qty]", "[Round Off]", "[CenvatRs]", "[OthersRs]", "[TaxRs]"
  ];

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await wasteInvoiceTypeService.getAll();
      setTypes(data);
    } catch (err) {
      setError("Failed to load waste invoice types");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      invoiceType: "",
      roundOffDigits: 0,
      assessValueFormula: "[Total Kgs]*([Rate / kg]/[Rate Per])",
      charityBale: 0,
      charityFormula: "[Total Kgs]*[CharityRs]",
      taxVat: 0,
      taxVatFormula: "-",
      gst: 5,
      cgstFormula: "Round(([X]*[CGST %])/100)",
      sgstFormula: "Round(([X]*[SGST %])/100)",
      igst: 0,
      igstFormula: "-",
      duty: 0,
      dutyFormula: "-",
      cess: 1,
      cessFormula: "([X]*[ChessRs])/100",
      hrSecCess: 0,
      hrSecCessFormula: "-",
      tcs: 0.75,
      tcsFormula: "([X]*[TCSRs])/100",
      cst: 0,
      cstFormula: "-",
      cenvat: 0,
      cenvatFormula: "-",
      subTotalFormula: "[X]+[D]+[F]",
      totalValueFormula: "[H]+[GstAmt]+[IGstAmt]",
      roundOffFormula: "ROUND OFF",
      packingForwardingFormula: "-",
      accPosting: true,
    });
    setEditingId(null);
    setFormError(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = async (id) => {
    try {
      const typeData = await wasteInvoiceTypeService.getById(id);
      setFormData(typeData);
      setEditingId(id);
      setIsFormOpen(true);
    } catch (err) {
      alert("Failed to load invoice type for editing");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice type?")) return;
    try {
      await wasteInvoiceTypeService.delete(id);
      setTypes(types.filter((t) => t.id !== id));
      alert("Deleted successfully");
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Strict validation: only allow variables from the list
  const validateFormulas = () => {
    const formulas = [
      { field: "Assess value", value: formData.assessValueFormula },
      { field: "Charity Formula", value: formData.charityFormula },
      { field: "Tax [VAT] Formula", value: formData.taxVatFormula },
      { field: "CGST Formula", value: formData.cgstFormula },
      { field: "SGST Formula", value: formData.sgstFormula },
      { field: "IGST Formula", value: formData.igstFormula },
      { field: "Duty Formula", value: formData.dutyFormula },
      { field: "Cess Formula", value: formData.cessFormula },
      { field: "Hr.Sec.Cess Formula", value: formData.hrSecCessFormula },
      { field: "T.C.S Formula", value: formData.tcsFormula },
      { field: "CST Formula", value: formData.cstFormula },
      { field: "CENVAT Formula", value: formData.cenvatFormula },
      { field: "Sub Total Formula", value: formData.subTotalFormula },
      { field: "Total value Formula", value: formData.totalValueFormula },
      { field: "Round off Formula", value: formData.roundOffFormula },
      { field: "Packing & Forwarding Formula", value: formData.packingForwardingFormula },
    ];

    for (const { field, value } of formulas) {
      if (!value || value.trim() === "-" || value.trim() === "") continue;

      const matches = value.match(/\[(.*?)\]/g) || [];
      for (const match of matches) {
        if (!allowedVariables.includes(match)) {
          return `Invalid variable "${match}" used in "${field}" formula.\n\nOnly these are allowed:\n${allowedVariables.join(", ")}`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Run validation
    const validationError = validateFormulas();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormLoading(true);

    try {
      if (editingId) {
        await wasteInvoiceTypeService.update(editingId, formData);
        alert("Updated successfully!");
      } else {
        await wasteInvoiceTypeService.create(formData);
        alert("Created successfully!");
      }
      resetForm();
      setIsFormOpen(false);
      fetchTypes(); // Refresh list
    } catch (err) {
      setFormError(err.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-screen-2xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-orange-400 text-white px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Waste Cotton Sales Invoice Type Master</h1>
            <p className="text-sm mt-1">To Add, Modify Waste Cotton Sales Invoice Type details.</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={openCreateForm}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition"
            >
              + Add New
            </button>
          )}
        </div>

        {/* List View */}
        {!isFormOpen && (
          <div className="p-8">
            {loading ? (
              <p className="text-center py-12 text-gray-600 text-lg">Loading...</p>
            ) : error ? (
              <p className="text-red-600 text-center py-12 text-lg">{error}</p>
            ) : types.length === 0 ? (
              <p className="text-center py-12 text-gray-600 text-lg">
                No invoice types found. Click "+ Add New" to create.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Invoice Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Round Off</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Assess Formula</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Charity Formula</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">GST %</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {types.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.invoiceType}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{type.roundOffDigits}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{type.assessValueFormula}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{type.charityFormula}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.gst}%</td>
                        <td className="px-6 py-4 text-sm font-medium space-x-4">
                          <button
                            onClick={() => openEditForm(type.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Form View */}
        {isFormOpen && (
          <div className="p-8 bg-blue-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-blue-900">
                {editingId ? "Edit Waste Cotton Sales Invoice Type" : "Add New Waste Cotton Sales Invoice Type"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="mb-8 p-5 bg-red-50 border border-red-300 text-red-800 rounded-xl whitespace-pre-wrap font-medium">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left: Details Legend */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>[X] Assess Value</div>
                    <div>[A] Charity</div>
                    <div>[B] Tax</div>
                    <div>[C] Duty</div>
                    <div>[D] Chess</div>
                    <div>[E] H.S.Cess</div>
                    <div>[F] TCS</div>
                    <div>[G] Others</div>
                    <div>[H] Sub Total</div>
                    <div>[I] Total Value</div>
                    <div>[J] Cenvat</div>
                    <div className="mt-4 font-medium">[Total Kgs] [Rate / Kg] [Qty] [Round Off] [CenvatRs]</div>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="lg:col-span-3">
                {/* Warning */}
                <div className="mb-8 p-5 bg-yellow-50 border border-yellow-300 rounded-xl">
                  <p className="text-base font-semibold text-yellow-800 mb-3">
                    Important: Use only these exact variable names in formulas (case-sensitive):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-sm">
                    {allowedVariables.map(v => (
                      <div key={v} className="bg-white px-3 py-1.5 rounded border border-yellow-200 text-center font-mono shadow-sm">
                        {v}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium text-red-700">
                    If you use any other name (e.g. [Charity] instead of [CharityRs]), calculation will fail!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Code */}
                  <div className="flex items-center gap-3">
                    <label className="w-28 font-medium text-gray-700">Code</label>
                    <input
                      type="number"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      disabled={editingId}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>

                  {/* Invoice Type */}
                  <div className="flex items-center gap-3">
                    <label className="w-28 font-medium text-gray-700">Invoice Type</label>
                    <input
                      type="text"
                      name="invoiceType"
                      value={formData.invoiceType}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>

                  {/* Round off digits */}
                  <div className="flex items-center gap-3">
                    <label className="w-28 font-medium text-gray-700">Round off digits</label>
                    <input
                      type="number"
                      name="roundOffDigits"
                      value={formData.roundOffDigits}
                      onChange={handleChange}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Assess value */}
                  <div className="col-span-2 flex items-start gap-3">
                    <label className="w-28 font-medium text-gray-700 pt-2">Assess value</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="assessValueFormula"
                        value={formData.assessValueFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">COTTON WASTE SALES GST</p>
                    </div>
                  </div>

                  {/* Charity */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">Charity / Bale</label>
                      <input
                        type="number"
                        step="0.01"
                        name="charityBale"
                        value={formData.charityBale}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Charity Formula</label>
                      <input
                        type="text"
                        name="charityFormula"
                        value={formData.charityFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Tax [VAT] */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">Tax [VAT]</label>
                      <input
                        type="number"
                        step="0.01"
                        name="taxVat"
                        value={formData.taxVat}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Tax VAT Formula</label>
                      <input
                        type="text"
                        name="taxVatFormula"
                        value={formData.taxVatFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* GST */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">GST</label>
                      <input
                        type="number"
                        step="0.01"
                        name="gst"
                        value={formData.gst}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="cgstFormula"
                        value={formData.cgstFormula}
                        onChange={handleChange}
                        placeholder="CGST Formula"
                        className="w-full px-3 py-2 border border-pink-300 rounded-md bg-pink-50 text-sm"
                      />
                      <input
                        type="text"
                        name="sgstFormula"
                        value={formData.sgstFormula}
                        onChange={handleChange}
                        placeholder="SGST Formula"
                        className="w-full px-3 py-2 border border-pink-300 rounded-md bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* IGST */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">IGST</label>
                      <input
                        type="number"
                        step="0.01"
                        name="igst"
                        value={formData.igst}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">IGST Formula</label>
                      <input
                        type="text"
                        name="igstFormula"
                        value={formData.igstFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Duty */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">Duty</label>
                      <input
                        type="number"
                        step="0.01"
                        name="duty"
                        value={formData.duty}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Duty Formula</label>
                      <input
                        type="text"
                        name="dutyFormula"
                        value={formData.dutyFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Cess */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">Cess</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cess"
                        value={formData.cess}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Cess Formula</label>
                      <input
                        type="text"
                        name="cessFormula"
                        value={formData.cessFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Hr.Sec.Cess */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">Hr.Sec.Cess</label>
                      <input
                        type="number"
                        step="0.01"
                        name="hrSecCess"
                        value={formData.hrSecCess}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Hr.Sec.Cess Formula</label>
                      <input
                        type="text"
                        name="hrSecCessFormula"
                        value={formData.hrSecCessFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* T.C.S */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">T.C.S</label>
                      <input
                        type="number"
                        step="0.001"
                        name="tcs"
                        value={formData.tcs}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">T.C.S Formula</label>
                      <input
                        type="text"
                        name="tcsFormula"
                        value={formData.tcsFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* CST */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">CST</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cst"
                        value={formData.cst}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">CST Formula</label>
                      <input
                        type="text"
                        name="cstFormula"
                        value={formData.cstFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* CENVAT */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-28 font-medium text-gray-700">CENVAT</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cenvat"
                        value={formData.cenvat}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">CENVAT Formula</label>
                      <input
                        type="text"
                        name="cenvatFormula"
                        value={formData.cenvatFormula}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Sub Total */}
                  <div className="col-span-2">
                    <label className="block font-medium text-gray-700 mb-2">Sub Total</label>
                    <input
                      type="text"
                      name="subTotalFormula"
                      value={formData.subTotalFormula}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                    />
                  </div>

                  {/* Total value */}
                  <div className="col-span-2">
                    <label className="block font-medium text-gray-700 mb-2">Total value</label>
                    <input
                      type="text"
                      name="totalValueFormula"
                      value={formData.totalValueFormula}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                    />
                  </div>

                  {/* Round off */}
                  <div className="col-span-2">
                    <label className="block font-medium text-gray-700 mb-2">Round off</label>
                    <input
                      type="text"
                      name="roundOffFormula"
                      value={formData.roundOffFormula}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                    />
                  </div>

                  {/* Packing & Forwarding Charges */}
                  <div className="col-span-2">
                    <label className="block font-medium text-gray-700 mb-2">Packing & Forwarding Charges</label>
                    <input
                      type="text"
                      name="packingForwardingFormula"
                      value={formData.packingForwardingFormula}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50 text-sm"
                    />
                  </div>

                  {/* Acc Posting */}
                  <div className="col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="accPosting"
                      checked={formData.accPosting}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-gray-700 font-medium">Acc Posting</label>
                  </div>

                  {/* Buttons */}
                  <div className="col-span-2 flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className={`px-6 py-3 text-white rounded-md transition ${
                        formLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {formLoading ? "Saving..." : editingId ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteInvoiceTypeMaster;
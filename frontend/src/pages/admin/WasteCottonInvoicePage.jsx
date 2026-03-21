// frontend/src/pages/admin/WasteCottonInvoicePage.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import invoiceService from "../../services/admin1/transaction-waste/invoiceService";
import salesOrderService from "../../services/admin1/transaction-waste/salesOrderService";
import wcInvoiceTypeService from "../../services/admin1/master/wcInvoiceService";
import wasteLotService from "../../services/admin1/master/wasteLotService";
import supplierService from "../../services/admin1/master/supplierService";
import formulaEvaluator from "../../utils/formulaEvaluator";

// ─── Hardcoded Seller (always same) ────────────────────────────────────────────
const SELLER_DETAILS = {
  Gstin: "33AAACK4468M1ZA",
  LglNm: "KAYAAR EXPORTS PRIVATE LIMITED",
  TrdNm: "KAYAAR EXPORTS PRIVATE LIMITED",
  Addr1: "D.No. 43/5, Railway Feeder Road,K.R.Nagar - 628503",
  Addr2: null,
  Loc: "Kovilpatti -Taluk",
  Pin: 628503,
  Stcd: "33",
  Ph: null,
  Em: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toFixed(decimals);
};

const formatDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split("T")[0];
  return dateString.split("T")[0];
};

// Convert "YYYY-MM-DD" → "DD/MM/YYYY" for JSON
const toJsonDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleDateString("en-GB").replace(/\//g, "/");
  const d = (dateStr.split("T")[0]).split("-");
  if (d.length === 3) return `${d[2]}/${d[1]}/${d[0]}`;
  return dateStr;
};

// Derive state code from first 2 chars of GSTIN
const stateCodeFromGstin = (gstin) => {
  if (!gstin || gstin.length < 2) return "33";
  return gstin.substring(0, 2);
};

// ─── JSON Generator ────────────────────────────────────────────────────────────
const generateEInvoiceJSON = (invoice, supplier) => {
  const buyerStcd = supplier?.gstNo
    ? stateCodeFromGstin(supplier.gstNo)
    : "33";

  // Build buyer address
  const buyerAddr1 = supplier?.address || supplier?.deliveryAddress || "";
  const buyerAddr2 = supplier?.place || "";

  const buyerPin = parseInt(supplier?.pincode) || 0;

  // Sum all bale net weights → total KGS
  const totalKgs = (invoice.details || []).reduce(
    (sum, b) => sum + (parseFloat(b.netWt) || 0),
    0
  );

  const assVal   = parseFloat(invoice.assessableValue) || 0;
  const cgstVal  = parseFloat(invoice.gst) / 2 || 0;   // total GST split 50/50 → CGST & SGST
  const sgstVal  = cgstVal;
  const igstVal  = parseFloat(invoice.igst) || 0;
  // OthChrg = 1% of Assessable Value (auto-calculated, not stored in form)
  const othChrg  = parseFloat((assVal * 0.01).toFixed(2));
  const totInvVal = parseFloat(invoice.invoiceValue) || 0;

  // GST rate — derive from cgst/assessable or default 5
  const gstRt =
    assVal > 0 ? parseFloat(((cgstVal / assVal) * 100 * 2).toFixed(2)) : 5;

  // Determine supply type — if buyer state == seller state → B2B intra, else inter
  const isInter = buyerStcd !== SELLER_DETAILS.Stcd;
  const supTyp = "B2B";

  const json = [
    {
      Version: "1.1",
      TranDtls: {
        TaxSch: "GST",
        SupTyp: supTyp,
        IgstOnIntra: "N",
        RegRev: "N",
        EcmGstin: null,
      },
      DocDtls: {
        Typ: "INV",
        No: invoice.invoiceNo,
        Dt: toJsonDate(invoice.date),
      },
      SellerDtls: { ...SELLER_DETAILS },
      BuyerDtls: {
        Gstin: supplier?.gstNo || "",
        LglNm: supplier?.accountName || invoice.partyName || "",
        TrdNm: supplier?.accountName || invoice.partyName || "",
        Pos: buyerStcd,
        Addr1: buyerAddr1,
        Addr2: buyerAddr2 || null,
        Loc: supplier?.place || "",
        Pin: buyerPin,
        Stcd: buyerStcd,
        Ph: supplier?.phoneNo || supplier?.cellNo || null,
        Em: supplier?.email || null,
      },
      ValDtls: {
        AssVal: assVal,
        IgstVal: igstVal,
        CgstVal: cgstVal,
        SgstVal: sgstVal,
        CesVal: parseFloat(invoice.cess) || 0,
        StCesVal: parseFloat(invoice.hsCess) || 0,
        Discount: 0.0,
        OthChrg: othChrg,
        RndOffAmt: parseFloat(invoice.roundOff) || 0,
        TotInvVal: totInvVal,
        TotInvValFc: 0.0,
      },
      ExpDtls: {
        ShipBNo: null,
        ShipBDt: null,
        Port: null,
        RefClm: null,
        ForCur: null,
        CntCode: null,
        ExpDuty: null,
      },
      EwbDtls: {},
      Itemlist: [
        {
          SlNo: "1",
          PrdDesc: "COMBER NOILS",
          IsServc: "N",
          HsnCd: "52021000",
          Barcde: null,
          Qty: parseFloat(totalKgs.toFixed(3)),
          FreeQty: 0.0,
          Unit: "KGS",
          UnitPrice: parseFloat(invoice.ratePerKg) || 0,
          TotAmt: assVal,
          Discount: 0.0,
          PreTaxVal: 0.0,
          AssAmt: assVal,
          GstRt: gstRt,
          IgstAmt: igstVal,
          CgstAmt: cgstVal,
          SgstAmt: sgstVal,
          CesRt: 0.0,
          CesAmt: parseFloat(invoice.cess) || 0,
          CesNonAdvlAmt: 0.0,
          StateCesRt: 0.0,
          StateCesAmt: parseFloat(invoice.hsCess) || 0,
          StateCesNonAdvlAmt: 0.0,
          OthChrg: 0.0,
          TotItemVal:
            assVal + cgstVal + sgstVal + igstVal,
          BchDtls: null,
        },
      ],
    },
  ];

  return json;
};

// Download JSON file
const downloadJSON = (invoice, supplier) => {
  const json = generateEInvoiceJSON(invoice, supplier);
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `W-${invoice.invoiceNo}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Main Component ────────────────────────────────────────────────────────────
const WasteCottonInvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [invoiceTypes, setInvoiceTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showJsonPreviewModal, setShowJsonPreviewModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [jsonPreviewData, setJsonPreviewData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableBales, setAvailableBales] = useState([]);
  const [selectedInvoiceType, setSelectedInvoiceType] = useState(null);
  const [ratePerKg, setRatePerKg] = useState(119.6);

  const emptyForm = () => ({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    invoiceType: "GST WASTE SALE INVOICE",
    partyName: "",
    supplierId: "",
    address: "",
    creditDays: 0,
    transport: "OWN VEHICLE",
    lrNo: "-",
    lrDate: new Date().toISOString().split("T")[0],
    vehicleNo: "-",
    removalTime: "",
    eBill: "",
    exportTo: "",
    assessableValue: 0,
    charity: 0,
    vatTax: 0,
    cenvat: 0,
    duty: 0,
    cess: 0,
    hsCess: 0,
    tcs: 0,
    pfCharges: 0,
    subTotal: 0,
    roundOff: 0,
    invoiceValue: 0,
    gst: 0,
    igst: 0,
    approve: false,
    salesOrderId: "",
    details: [],
  });

  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
    fetchInvoiceTypes();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedInvoiceType && formData.details.length > 0) {
      calculateInvoiceValues();
    }
  }, [formData.details, ratePerKg, selectedInvoiceType]);

  // ── Fetchers ──────────────────────────────────────────────────────────────────
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await salesOrderService.getAll();
      setSalesOrders(Array.isArray(data) ? data : []);
    } catch {
      console.error("Error fetching sales orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchInvoiceTypes = async () => {
    try {
      const data = await wcInvoiceTypeService.getAll();
      setInvoiceTypes(Array.isArray(data) ? data : []);
      const def = data.find((t) => t.name === "GST WASTE SALE INVOICE");
      if (def) {
        setSelectedInvoiceType(def);
        setFormData((prev) => ({ ...prev, invoiceType: def.name }));
      }
    } catch {
      toast.error("Failed to load invoice types");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAll();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load suppliers");
    }
  };

  // ── Calculations ──────────────────────────────────────────────────────────────
  const calculateInvoiceValues = () => {
    if (!selectedInvoiceType?.details) return;

    const totalKgs = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.netWt) || 0),
      0
    );

    const baseVariables = {
      totalKgs,
      ratePerKg,
      ratePer: 1,
      charityRs: 0,
      chessRs: 0,
      tcsRs: 0,
      gstAmt: 0,
      igstAmt: 0,
    };

    const calculated = formulaEvaluator.calculateAllFields(
      selectedInvoiceType.details,
      baseVariables
    );

    setFormData((prev) => ({
      ...prev,
      assessableValue: calculated["Assess Value"] || calculated["X"] || 0,
      charity: calculated["Charity"] || calculated["A"] || 0,
      vatTax: calculated["Tax [VAT]"] || calculated["B"] || 0,
      duty: calculated["Duty"] || calculated["C"] || 0,
      cess: calculated["Chess"] || calculated["D"] || 0,
      hsCess: calculated["H.S.Cess"] || calculated["E"] || 0,
      tcs: calculated["TCS"] || calculated["F"] || 0,
      pfCharges: calculated["Others"] || calculated["G"] || 0,
      subTotal: calculated["Sub Total"] || calculated["H"] || 0,
      cenvat: calculated["Cenvat"] || calculated["J"] || 0,
      invoiceValue: calculated["Total Value"] || calculated["I"] || 0,
    }));
  };

  const calculateTotals = () => {
    const totalGross = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.grossWt) || 0),
      0
    );
    const totalTare = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.tareWt) || 0),
      0
    );
    const totalNet = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.netWt) || 0),
      0
    );
    return { totalGross, totalTare, totalNet };
  };

  // ── Supplier helper ───────────────────────────────────────────────────────────
  const getSupplierById = (supplierId) =>
    suppliers.find((s) => String(s.id) === String(supplierId)) || null;

  const getSupplierName = (supplierId) => {
    if (!supplierId) return "N/A";
    const s = getSupplierById(supplierId);
    return s ? s.accountName : String(supplierId);
  };

  const handleSupplierChange = (supplierId) => {
    const s = getSupplierById(supplierId);
    if (s) {
      setFormData((prev) => ({
        ...prev,
        supplierId,
        partyName: s.accountName,
        address: s.address || s.place || "",
      }));
    }
  };

  // ── Order / Bale helpers ──────────────────────────────────────────────────────
  const handleOrderSelect = async (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      setAvailableBales([]);
      setFormData((prev) => ({ ...prev, details: [], salesOrderId: "" }));
      return;
    }

    try {
      const order = await salesOrderService.getById(orderId);
      setSelectedOrder(order);

      if (order.supplierId) handleSupplierChange(order.supplierId);

      setFormData((prev) => ({ ...prev, salesOrderId: orderId }));

      if (order.details?.length > 0) {
        const generatedBales = [];
        for (const detail of order.details) {
          const totalBales = detail.qty || 0;
          const totalWeight = detail.totalWt || 0;
          const avgWeight = totalBales > 0 ? totalWeight / totalBales : 0;
          const wasteName = detail.product || "COMBER NOILS";

          let lotNo = "4";
          try {
            const lots = await wasteLotService.getByWasteName(wasteName);
            if (lots?.length > 0) {
              const active = lots.find((l) => l.active === true) || lots[0];
              lotNo = active.lotNo;
            }
          } catch {
            /* keep default */
          }

          for (let i = 1; i <= totalBales; i++) {
            generatedBales.push({
              wasteName,
              lotNo,
              baleNo: `WC-3090-${lotNo}-${i.toString().padStart(3, "0")}`,
              grossWt: parseFloat(avgWeight.toFixed(3)),
              tareWt: 0,
              netWt: parseFloat(avgWeight.toFixed(3)),
              id: `${orderId}-${detail.id || i}-${i}`,
            });
          }
        }
        setAvailableBales(generatedBales);
      }
    } catch {
      toast.error("Failed to load order details");
    }
  };

  const addBaleToInvoice = (bale) => {
    if (formData.details.some((b) => b.baleNo === bale.baleNo)) {
      toast.warning("This bale is already added");
      return;
    }
    setFormData((prev) => ({ ...prev, details: [...prev.details, { ...bale }] }));
    setAvailableBales((prev) => prev.filter((b) => b.baleNo !== bale.baleNo));
    toast.success("Bale added to invoice");
  };

  const removeBaleFromInvoice = (index) => {
    const removed = formData.details[index];
    const updated = formData.details.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, details: updated }));
    setAvailableBales((prev) => [...prev, removed]);
    toast.info("Bale removed from invoice");
  };

  const handleDetailChange = (index, field, value) => {
    const updated = [...formData.details];
    updated[index][field] = parseFloat(value) || 0;
    if (field === "grossWt" || field === "tareWt") {
      updated[index].netWt = parseFloat(
        ((updated[index].grossWt || 0) - (updated[index].tareWt || 0)).toFixed(3)
      );
    }
    setFormData((prev) => ({ ...prev, details: updated }));
  };

  // ── Form handlers ─────────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "ratePerKg") setRatePerKg(parseFloat(value) || 0);

    if (name === "invoiceType") {
      const sel = invoiceTypes.find((t) => t.name === value);
      setSelectedInvoiceType(sel || null);
    }
  };

  const validateForm = () => {
    if (!formData.invoiceNo.trim()) { toast.error("Invoice No. is required"); return false; }
    if (!formData.date) { toast.error("Date is required"); return false; }
    if (!formData.supplierId) { toast.error("Supplier is required"); return false; }
    if (formData.details.length === 0) { toast.error("At least one bale detail is required"); return false; }
    return true;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const { totalNet } = calculateTotals();
      await invoiceService.create({ ...formData, totalNetWeight: totalNet.toFixed(3), ratePerKg });
      toast.success("Invoice created successfully!");
      resetForm();
      fetchInvoices();
      setShowCreateModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedInvoice) return;
    try {
      const { totalNet } = calculateTotals();
      await invoiceService.update(selectedInvoice.id, { ...formData, totalNetWeight: totalNet.toFixed(3), ratePerKg });
      toast.success("Invoice updated successfully!");
      resetForm();
      fetchInvoices();
      setShowEditModal(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update invoice");
    }
  };

  const handleDelete = async (id) => {
    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted successfully!");
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    const sel = invoiceTypes.find((t) => t.name === invoice.invoiceType);
    setSelectedInvoiceType(sel || null);
    setFormData({
      invoiceNo: invoice.invoiceNo || "",
      date: invoice.date ? invoice.date.split("T")[0] : new Date().toISOString().split("T")[0],
      invoiceType: invoice.invoiceType || "GST WASTE SALE INVOICE",
      partyName: invoice.partyName || "",
      supplierId: invoice.supplierId || "",
      address: invoice.address || "",
      creditDays: invoice.creditDays || 0,
      transport: invoice.transport || "OWN VEHICLE",
      lrNo: invoice.lrNo || "-",
      lrDate: invoice.lrDate ? invoice.lrDate.split("T")[0] : new Date().toISOString().split("T")[0],
      vehicleNo: invoice.vehicleNo || "-",
      removalTime: invoice.removalTime || "",
      eBill: invoice.eBill || "",
      exportTo: invoice.exportTo || "",
      assessableValue: invoice.assessableValue || 0,
      charity: invoice.charity || 0,
      vatTax: invoice.vatTax || 0,
      cenvat: invoice.cenvat || 0,
      duty: invoice.duty || 0,
      cess: invoice.cess || 0,
      hsCess: invoice.hsCess || 0,
      tcs: invoice.tcs || 0,
      pfCharges: invoice.pfCharges || 0,
      subTotal: invoice.subTotal || 0,
      roundOff: invoice.roundOff || 0,
      invoiceValue: invoice.invoiceValue || 0,
      gst: invoice.gst || 0,
      igst: invoice.igst || 0,
      approve: invoice.approve || false,
      salesOrderId: invoice.salesOrderId || "",
      details: invoice.details || [],
    });
    if (invoice.ratePerKg) setRatePerKg(parseFloat(invoice.ratePerKg));
    setShowEditModal(true);
  };

  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setSelectedOrder(null);
    setAvailableBales([]);
    setRatePerKg(119.6);
    const def = invoiceTypes.find((t) => t.name === "GST WASTE SALE INVOICE");
    setSelectedInvoiceType(def || null);
  };

  // ── JSON preview / download ───────────────────────────────────────────────────
  const handleShowJson = (invoice) => {
    const supplier = getSupplierById(invoice.supplierId);
    const json = generateEInvoiceJSON(invoice, supplier);
    setJsonPreviewData({ json, invoice });
    setShowJsonPreviewModal(true);
  };

  const handleDownloadJson = (invoice) => {
    const supplier = getSupplierById(invoice.supplierId);
    downloadJSON(invoice, supplier);
    toast.success(`JSON downloaded: W-${invoice.invoiceNo}.json`);
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const { totalGross, totalTare, totalNet } = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ─── Shared invoice form fields ──────────────────────────────────────────────
  const InvoiceForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      {/* Row 1: Invoice No / Date / Invoice Type */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice No. *</label>
          <input type="text" name="invoiceNo" value={formData.invoiceNo}
            onChange={handleFormChange} required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input type="date" name="date" value={formData.date}
            onChange={handleFormChange} required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Type</label>
          <select name="invoiceType" value={formData.invoiceType} onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm">
            {invoiceTypes.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Supplier / Address */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier *</label>
          <select value={formData.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}
            required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm">
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.accountName} — {s.place}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
        </div>
      </div>

      {/* Row 3: Transport fields */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Credit Days", name: "creditDays", type: "number" },
          { label: "Transport", name: "transport", type: "text" },
          { label: "LR No.", name: "lrNo", type: "text" },
          { label: "LR Date", name: "lrDate", type: "date" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input type={type} name={name} value={formData[name]} onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
          </div>
        ))}
      </div>

      {/* Row 4: Vehicle / Removal Time / E-Bill */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle No.</label>
          <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Removal Time</label>
          <input type="text" name="removalTime" value={formData.removalTime} onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">E-Bill No.</label>
          <input type="text" name="eBill" value={formData.eBill} onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
        </div>
      </div>

      {/* Calculated Invoice Values */}
      <div className="grid grid-cols-4 gap-3 mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg">
        {[
          { label: "Assessable Value", key: "assessableValue", highlight: "text-blue-700 font-semibold" },
          { label: "Charity", key: "charity" },
          { label: "VAT Tax", key: "vatTax" },
          { label: "Cenvat", key: "cenvat" },
          { label: "Duty", key: "duty" },
          { label: "Cess", key: "cess" },
          { label: "H.S. Cess", key: "hsCess" },
          { label: "TCS", key: "tcs" },
          { label: "PF / Other Charges", key: "pfCharges" },
          { label: "Sub Total", key: "subTotal", highlight: "font-semibold" },
          { label: "Round Off", key: "roundOff" },
          { label: "Invoice Value", key: "invoiceValue", highlight: "text-green-700 font-bold text-lg" },
          { label: "GST", key: "gst" },
          { label: "IGST", key: "igst" },
        ].map(({ label, key, highlight }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500">{label}</label>
            <div className={`text-base ${highlight || "text-gray-800"}`}>
              ₹{formatNumber(formData[key])}
            </div>
          </div>
        ))}
      </div>

      {/* Order Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Sales Order</label>
        <select value={formData.salesOrderId} onChange={(e) => handleOrderSelect(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          disabled={loadingOrders}>
          <option value="">Select an order…</option>
          {salesOrders.map((o) => (
            <option key={o.id} value={o.id}>{o.orderNo} — {o.party}</option>
          ))}
        </select>
      </div>

      {/* Order Detail Table */}
      {selectedOrder && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Order Details</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>{["Order No", "Product", "Pack", "Ord Qty", "Ord Kgs", "Stock Qty", "Stock Kgs", "Despatch Qty"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedOrder.details?.map((d, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{selectedOrder.orderNo}</td>
                    <td className="px-4 py-2">{d.product}</td>
                    <td className="px-4 py-2">BALE</td>
                    <td className="px-4 py-2">{d.qty}</td>
                    <td className="px-4 py-2">{d.totalWt}</td>
                    <td className="px-4 py-2">{d.qty}</td>
                    <td className="px-4 py-2">{d.totalWt}</td>
                    <td className="px-4 py-2">{d.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Bales */}
      {availableBales.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Available Bales</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>{["Bale No.", "Waste Name", "Lot No", "Gross Wt.", "Action"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableBales.map((bale, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{bale.baleNo}</td>
                    <td className="px-4 py-2">{bale.wasteName}</td>
                    <td className="px-4 py-2">{bale.lotNo}</td>
                    <td className="px-4 py-2">{formatNumber(bale.grossWt, 3)}</td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => addBaleToInvoice(bale)}
                        className="text-green-600 hover:text-green-800 font-medium text-xs">Add</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bale Details */}
      {formData.details.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Bale Details</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>{["Waste Name", "LOT No", "Bale No", "Gross Wt", "Tare Wt", "Net Wt", "Action"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.details.map((bale, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{bale.wasteName}</td>
                    <td className="px-4 py-2">{bale.lotNo}</td>
                    <td className="px-4 py-2">{bale.baleNo}</td>
                    <td className="px-4 py-2">
                      <input type="number" value={bale.grossWt} step="0.001"
                        onChange={(e) => handleDetailChange(index, "grossWt", e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={bale.tareWt} step="0.001"
                        onChange={(e) => handleDetailChange(index, "tareWt", e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-4 py-2 font-medium">{formatNumber(bale.netWt, 3)}</td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => removeBaleFromInvoice(index)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-sm">
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2">{formatNumber(totalGross, 3)}</td>
                  <td className="px-4 py-2">{formatNumber(totalTare, 3)}</td>
                  <td className="px-4 py-2">{formatNumber(totalNet, 3)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Rate Per Kg */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Per Kg (₹)</label>
        <input type="number" name="ratePerKg" value={ratePerKg} step="0.01"
          onChange={handleFormChange}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md text-sm" />
      </div>

      {/* Footer actions */}
      <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-200">
        <label className="flex items-center">
          <input type="checkbox" name="approve" checked={formData.approve}
            onChange={handleFormChange} className="h-4 w-4 text-blue-600 rounded" />
          <span className="ml-2 text-sm text-gray-700">Approval</span>
        </label>
        <button type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
          {submitLabel}
        </button>
        <button type="button"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
            setSelectedInvoice(null);
          }}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Waste Cotton Sales Invoice</h1>
          <p className="text-gray-500 text-sm">Add, modify or export cotton invoice details.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
          + Create New Invoice
        </button>
      </div>

      {/* Invoice List Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Invoices</h2>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Invoice No", "Date", "Supplier", "Bales", "Invoice Value", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{inv.invoiceNo}</td>
                    <td className="px-4 py-2">{formatDate(inv.date)}</td>
                    <td className="px-4 py-2">{getSupplierName(inv.supplierId)}</td>
                    <td className="px-4 py-2">{inv.details?.length || 0}</td>
                    <td className="px-4 py-2 font-medium text-blue-600">₹{formatNumber(inv.invoiceValue)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        inv.approve
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {inv.approve ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleView(inv)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</button>
                        <button onClick={() => handleEdit(inv)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium">Edit</button>
                        <button onClick={() => confirmDelete(inv)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                        {/* Single JSON download button per row */}
                        <button
                          onClick={() => handleDownloadJson(inv)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium"
                        >
                          ↓ JSON
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

      {/* ── Create Modal ───────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create Waste Cotton Sales Invoice</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <InvoiceForm onSubmit={handleCreateInvoice} submitLabel="Create Invoice" />
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {showEditModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Waste Cotton Sales Invoice</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); setSelectedInvoice(null); }}
                className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <InvoiceForm onSubmit={handleUpdateInvoice} submitLabel="Update Invoice" />
          </div>
        </div>
      )}

      {/* ── View Modal ─────────────────────────────────────────────────────────── */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Invoice — {selectedInvoice.invoiceNo}</h2>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadJson(selectedInvoice)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium">
                  ↓ Download JSON
                </button>
                <button onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
                  className="text-gray-400 hover:text-gray-600 ml-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Invoice No.", val: selectedInvoice.invoiceNo },
                { label: "Date", val: formatDate(selectedInvoice.date) },
                { label: "Invoice Type", val: selectedInvoice.invoiceType },
                { label: "Supplier", val: getSupplierName(selectedInvoice.supplierId) },
                { label: "Address", val: selectedInvoice.address || "N/A" },
                { label: "Transport", val: selectedInvoice.transport },
                { label: "LR No.", val: selectedInvoice.lrNo },
                { label: "LR Date", val: formatDate(selectedInvoice.lrDate) },
                { label: "Vehicle No.", val: selectedInvoice.vehicleNo },
                { label: "Removal Time", val: selectedInvoice.removalTime },
                { label: "E-Bill No.", val: selectedInvoice.eBill || "—" },
                { label: "Status", val: selectedInvoice.approve ? "Approved" : "Pending" },
              ].map(({ label, val }) => (
                <div key={label}>
                  <label className="text-xs font-medium text-gray-500">{label}</label>
                  <p className="text-sm font-medium text-gray-800">{val}</p>
                </div>
              ))}
            </div>

            {/* Invoice values */}
            <div className="border-t pt-4 mb-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Invoice Values</h3>
              <div className="grid grid-cols-4 gap-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                {[
                  { label: "Assessable Value", key: "assessableValue", cls: "text-blue-700 font-semibold" },
                  { label: "Charity", key: "charity" },
                  { label: "VAT Tax", key: "vatTax" },
                  { label: "Cenvat", key: "cenvat" },
                  { label: "Duty", key: "duty" },
                  { label: "Cess", key: "cess" },
                  { label: "H.S. Cess", key: "hsCess" },
                  { label: "TCS", key: "tcs" },
                  { label: "PF / Other Charges", key: "pfCharges" },
                  { label: "Sub Total", key: "subTotal", cls: "font-semibold" },
                  { label: "Round Off", key: "roundOff" },
                  { label: "Invoice Value", key: "invoiceValue", cls: "text-green-700 font-bold text-base" },
                  { label: "GST", key: "gst" },
                  { label: "IGST", key: "igst" },
                ].map(({ label, key, cls }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-500">{label}</label>
                    <p className={`text-sm ${cls || "text-gray-800"}`}>₹{formatNumber(selectedInvoice[key])}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bale table */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Bale Details ({selectedInvoice.details?.length || 0} bales)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>{["Waste Name", "Lot No", "Bale No", "Gross Wt", "Tare Wt", "Net Wt"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.details?.map((bale, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{bale.wasteName}</td>
                        <td className="px-4 py-2">{bale.lotNo}</td>
                        <td className="px-4 py-2">{bale.baleNo}</td>
                        <td className="px-4 py-2">{formatNumber(bale.grossWt, 3)}</td>
                        <td className="px-4 py-2">{formatNumber(bale.tareWt, 3)}</td>
                        <td className="px-4 py-2 font-medium">{formatNumber(bale.netWt, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── JSON Preview Modal ─────────────────────────────────────────────────── */}
      {showJsonPreviewModal && jsonPreviewData && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-xl rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">e-Invoice JSON</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Invoice No: {jsonPreviewData.invoice.invoiceNo} — ready for GST portal upload
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(jsonPreviewData.json, null, 2));
                    toast.success("JSON copied to clipboard!");
                  }}
                  className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium">
                  Copy
                </button>
                <button
                  onClick={() => {
                    handleDownloadJson(jsonPreviewData.invoice);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium">
                  ↓ Download
                </button>
                <button onClick={() => { setShowJsonPreviewModal(false); setJsonPreviewData(null); }}
                  className="text-gray-400 hover:text-gray-600 ml-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Structured JSON sections */}
            {(() => {
              const j = jsonPreviewData.json[0];
              const Section = ({ title, color, children }) => (
                <div className={`mb-4 border rounded-lg overflow-hidden border-${color}-200`}>
                  <div className={`px-4 py-2 text-xs font-semibold bg-${color}-50 text-${color}-700 border-b border-${color}-200`}>
                    {title}
                  </div>
                  <div className="px-4 py-3 bg-white">
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">{children}</div>
                  </div>
                </div>
              );
              const Row = ({ label, value }) => (
                <div>
                  <span className="text-xs text-gray-500">{label}</span>
                  <p className="text-xs font-mono font-medium text-gray-800 truncate">
                    {value === null ? <span className="text-gray-300 italic">null</span> : String(value)}
                  </p>
                </div>
              );

              return (
                <>
                  {/* Version + TranDtls */}
                  <Section title="Version & Transaction Details (TranDtls)" color="gray">
                    <Row label="Version" value={j.Version} />
                    <Row label="TaxSch" value={j.TranDtls.TaxSch} />
                    <Row label="SupTyp" value={j.TranDtls.SupTyp} />
                    <Row label="IgstOnIntra" value={j.TranDtls.IgstOnIntra} />
                    <Row label="RegRev" value={j.TranDtls.RegRev} />
                    <Row label="EcmGstin" value={j.TranDtls.EcmGstin} />
                  </Section>

                  {/* DocDtls */}
                  <Section title="Document Details (DocDtls)" color="blue">
                    <Row label="Typ" value={j.DocDtls.Typ} />
                    <Row label="No" value={j.DocDtls.No} />
                    <Row label="Dt" value={j.DocDtls.Dt} />
                  </Section>

                  {/* SellerDtls */}
                  <Section title="Seller Details (SellerDtls) — Fixed" color="teal">
                    {Object.entries(j.SellerDtls).map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  {/* BuyerDtls */}
                  <Section title="Buyer Details (BuyerDtls)" color="purple">
                    {Object.entries(j.BuyerDtls).map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  {/* ValDtls */}
                  <Section title="Value Details (ValDtls)" color="amber">
                    {Object.entries(j.ValDtls).map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  {/* Itemlist */}
                  <Section title="Item List (Itemlist[0]) — Grouped" color="green">
                    {Object.entries(j.Itemlist[0])
                      .filter(([k]) => k !== "BchDtls")
                      .map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  {/* Raw JSON */}
                  <div className="mb-4">
                    <div className="px-4 py-2 text-xs font-semibold bg-gray-800 text-gray-200 rounded-t-lg">
                      Raw JSON
                    </div>
                    <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-b-lg overflow-x-auto max-h-64 font-mono">
                      {JSON.stringify(jsonPreviewData.json, null, 2)}
                    </pre>
                  </div>
                </>
              );
            })()}

            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => { setShowJsonPreviewModal(false); setJsonPreviewData(null); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Invoice</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete invoice <strong>{invoiceToDelete.invoiceNo}</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
              <div className="mt-6 flex justify-center space-x-4">
                <button onClick={() => { setShowDeleteModal(false); setInvoiceToDelete(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button onClick={() => handleDelete(invoiceToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
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

export default WasteCottonInvoicePage;

// frontend/src/pages/admin/WasteCottonInvoicePage.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import invoiceService from "../../services/admin1/transaction-waste/invoiceService";
import salesOrderService from "../../services/admin1/transaction-waste/salesOrderService";

// Helper function to format numbers
const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toFixed(decimals);
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// Helper function to format datetime
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const WasteCottonInvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bales, setBales] = useState([]);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    invoiceType: "GST WASTE SALE WITHOUT TCS",
    partyName: "",
    address: "",
    creditDays: 0,
    interestPercent: 0,
    transport: "OWN VEHICLE",
    lrNo: "",
    lrDate: new Date().toISOString().split("T")[0],
    vehicleNo: "",
    removalTime: new Date().toISOString().replace("T", " ").substring(0, 19),
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

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();
      const processedData = Array.isArray(data)
        ? data.map((invoice) => ({
            ...invoice,
            assessableValue: parseFloat(invoice.assessableValue) || 0,
            invoiceValue: parseFloat(invoice.invoiceValue) || 0,
            gst: parseFloat(invoice.gst) || 0,
            subTotal: parseFloat(invoice.subTotal) || 0,
            details: Array.isArray(invoice.details)
              ? invoice.details.map((detail) => ({
                  ...detail,
                  grossWt: parseFloat(detail.grossWt) || 0,
                  tareWt: parseFloat(detail.tareWt) || 0,
                  netWt: parseFloat(detail.netWt) || 0,
                }))
              : [],
          }))
        : [];
      setInvoices(processedData);
    } catch (error) {
      toast.error("Failed to fetch invoices");
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await salesOrderService.getAll();
      setSalesOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-calculate values if needed
    if (name === "assessableValue" || name === "gst") {
      const assessable = parseFloat(formData.assessableValue) || 0;
      const gstValue = parseFloat(formData.gst) || 0;
      if (name === "assessableValue") {
        const gst = (assessable * 5) / 100; // Assuming 5% GST for example
        const invoiceValue = assessable + gst;
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
          gst: gst.toFixed(2),
          invoiceValue: invoiceValue.toFixed(2),
          subTotal: assessable.toFixed(2),
        }));
      }
    }
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    const numValue = ["grossWt", "tareWt", "netWt"].includes(field)
      ? parseFloat(value) || 0
      : value;

    updatedDetails[index][field] = numValue;

    // Auto-calculate net weight if gross or tare changes
    if (field === "grossWt" || field === "tareWt") {
      const gross = parseFloat(updatedDetails[index].grossWt) || 0;
      const tare = parseFloat(updatedDetails[index].tareWt) || 0;
      updatedDetails[index].netWt = (gross + tare).toFixed(3);
    }

    setFormData((prev) => ({
      ...prev,
      details: updatedDetails,
    }));
  };

  const handleOrderSelect = async (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      setBales([]);
      setFormData((prev) => ({
        ...prev,
        details: [],
        salesOrderId: "",
      }));
      return;
    }

    try {
      const order = await salesOrderService.getById(orderId);
      setSelectedOrder(order);

      // Set party name and address from order
      setFormData((prev) => ({
        ...prev,
        partyName: order.party || "",
        address: order.despatchTo || "",
        salesOrderId: orderId,
      }));

      // Generate bales from order details
      if (order.details && order.details.length > 0) {
        const generatedBales = [];
        order.details.forEach((detail, detailIndex) => {
          const totalBales = detail.qty || 0;
          const totalWeight = detail.totalWt || 0;
          const avgWeight = totalBales > 0 ? totalWeight / totalBales : 0;

          for (let i = 1; i <= totalBales; i++) {
            generatedBales.push({
              wasteName: detail.product || "COMBER NOILS",
              lotNo: order.lotNo || "4",
              baleNo: `WC-3090-${order.lotNo || "4"}-${i.toString().padStart(3, "0")}`,
              grossWt: avgWeight.toFixed(3),
              tareWt: 0,
              netWt: avgWeight.toFixed(3),
            });
          }
        });

        setBales(generatedBales);
        setFormData((prev) => ({
          ...prev,
          details: generatedBales.slice(0, 10), // Limit to first 10 bales initially
        }));
      }
    } catch (error) {
      toast.error("Failed to load order details");
      console.error("Error loading order:", error);
    }
  };

  const addBaleToInvoice = (bale) => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { ...bale }],
    }));
  };

  const removeBaleFromInvoice = (index) => {
    const updatedDetails = [...formData.details];
    updatedDetails.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      details: updatedDetails,
    }));
  };

  const calculateTotals = () => {
    const totalGross = formData.details.reduce((sum, bale) => sum + (parseFloat(bale.grossWt) || 0), 0);
    const totalTare = formData.details.reduce((sum, bale) => sum + (parseFloat(bale.tareWt) || 0), 0);
    const totalNet = formData.details.reduce((sum, bale) => sum + (parseFloat(bale.netWt) || 0), 0);
    
    return { totalGross, totalTare, totalNet };
  };

  const validateForm = () => {
    if (!formData.invoiceNo.trim()) {
      toast.error("Invoice No. is required");
      return false;
    }
    if (!formData.date) {
      toast.error("Date is required");
      return false;
    }
    if (!formData.partyName.trim()) {
      toast.error("Party name is required");
      return false;
    }
    if (formData.details.length === 0) {
      toast.error("At least one bale detail is required");
      return false;
    }
    return true;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Calculate totals
      const assessableValue = calculateTotals().totalNet * 119.6; // Example rate
      const gstValue = assessableValue * 0.05; // 5% GST
      const invoiceValue = assessableValue + gstValue;

      const finalData = {
        ...formData,
        assessableValue: assessableValue.toFixed(2),
        gst: gstValue.toFixed(2),
        invoiceValue: invoiceValue.toFixed(2),
        subTotal: assessableValue.toFixed(2),
      };

      await invoiceService.create(finalData);
      toast.success("Invoice created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedInvoice) return;

    try {
      await invoiceService.update(selectedInvoice._id, formData);
      toast.success("Invoice updated successfully!");
      setShowEditModal(false);
      resetForm();
      fetchInvoices();
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
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNo: "",
      date: new Date().toISOString().split("T")[0],
      invoiceType: "GST WASTE SALE WITHOUT TCS",
      partyName: "",
      address: "",
      creditDays: 0,
      interestPercent: 0,
      transport: "OWN VEHICLE",
      lrNo: "",
      lrDate: new Date().toISOString().split("T")[0],
      vehicleNo: "",
      removalTime: new Date().toISOString().replace("T", " ").substring(0, 19),
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
    setSelectedInvoice(null);
    setSelectedOrder(null);
    setBales([]);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      invoiceNo: invoice.invoiceNo || "",
      date: invoice.date ? invoice.date.split("T")[0] : new Date().toISOString().split("T")[0],
      invoiceType: invoice.invoiceType || "GST WASTE SALE WITHOUT TCS",
      partyName: invoice.partyName || "",
      address: invoice.address || "",
      creditDays: invoice.creditDays || 0,
      interestPercent: invoice.interestPercent || 0,
      transport: invoice.transport || "OWN VEHICLE",
      lrNo: invoice.lrNo || "",
      lrDate: invoice.lrDate ? invoice.lrDate.split("T")[0] : new Date().toISOString().split("T")[0],
      vehicleNo: invoice.vehicleNo || "",
      removalTime: invoice.removalTime || new Date().toISOString().replace("T", " ").substring(0, 19),
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
    setShowEditModal(true);
  };

  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (invoice.invoiceNo && invoice.invoiceNo.toLowerCase().includes(searchLower)) ||
      (invoice.partyName && invoice.partyName.toLowerCase().includes(searchLower)) ||
      (invoice._id && invoice._id.includes(searchTerm))
    );
  });

  const { totalGross, totalTare, totalNet } = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Cotton Sales Invoice</h1>
        <p className="text-gray-600 mt-2">To Add, Modify Cotton Invoice details.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
            <p className="text-gray-600 text-sm">Manage waste cotton sales invoices</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by invoice no, party name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
            </div>
            <button
              onClick={fetchInvoices}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Invoice
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">Invoice No: {invoice.invoiceNo}</div>
                      <div className="text-sm text-gray-500">Type: {invoice.invoiceType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.partyName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{invoice.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {invoice.details?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      ₹{formatNumber(invoice.invoiceValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.approve ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(invoice)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
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

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create Waste Cotton Sales Invoice</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Order Selection and Bales */}
                <div>
                  {/* Order Selection */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Select Sales Order</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order No.
                      </label>
                      <select
                        value={formData.salesOrderId}
                        onChange={(e) => handleOrderSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingOrders}
                      >
                        <option value="">Select an order...</option>
                        {salesOrders.map((order) => (
                          <option key={order._id} value={order._id}>
                            {order.orderNo} - {order.party} ({order.details?.length || 0} items)
                          </option>
                        ))}
                      </select>
                      {loadingOrders && <p className="text-sm text-gray-500 mt-1">Loading orders...</p>}
                    </div>

                    {/* Order Details */}
                    {selectedOrder && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Order Details</h5>
                        <div className="text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Order No:</span> {selectedOrder.orderNo}
                          </p>
                          <p>
                            <span className="font-medium">Party:</span> {selectedOrder.party}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span> {formatDate(selectedOrder.date)}
                          </p>
                          <p>
                            <span className="font-medium">Total Items:</span> {selectedOrder.details?.length || 0}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Available Bales from Order */}
                    {bales.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-700">Available Bales ({bales.length})</h5>
                          <span className="text-sm text-gray-500">
                            Click "+" to add to invoice
                          </span>
                        </div>
                        <div className="overflow-y-auto max-h-60 border border-gray-200 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waste</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gross Wt.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bales.map((bale, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm text-gray-500">{bale.baleNo}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{bale.wasteName}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{formatNumber(bale.grossWt, 3)}</td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => addBaleToInvoice(bale)}
                                      className="text-green-600 hover:text-green-800 text-sm"
                                    >
                                      Add
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Invoice Form */}
                <div>
                  {/* Invoice Header */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Invoice Information</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Invoice No. *
                        </label>
                        <input
                          type="text"
                          name="invoiceNo"
                          value={formData.invoiceNo}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Invoice Type *
                        </label>
                        <select
                          name="invoiceType"
                          value={formData.invoiceType}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="GST WASTE SALE WITHOUT TCS">GST WASTE SALE WITHOUT TCS</option>
                          <option value="GST WASTE SALE WITH TCS">GST WASTE SALE WITH TCS</option>
                          <option value="EXPORT INVOICE">EXPORT INVOICE</option>
                          <option value="LOCAL SALE">LOCAL SALE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Party Name *
                        </label>
                        <input
                          type="text"
                          name="partyName"
                          value={formData.partyName}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleFormChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transport Details */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Transport Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
                        <input
                          type="text"
                          name="transport"
                          value={formData.transport}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LR No.</label>
                        <input
                          type="text"
                          name="lrNo"
                          value={formData.lrNo}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                        <input
                          type="date"
                          name="lrDate"
                          value={formData.lrDate}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No.</label>
                        <input
                          type="text"
                          name="vehicleNo"
                          value={formData.vehicleNo}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Bales for Invoice */}
              {formData.details.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-700">Selected Bales for Invoice ({formData.details.length})</h4>
                    <div className="text-sm font-medium text-gray-700">
                      Total Net Weight: {formatNumber(totalNet, 3)} kg
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waste Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">LOT No.</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gross Wt.</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tare Wt.</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Wt.</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.details.map((bale, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-500">{bale.wasteName}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{bale.lotNo}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{bale.baleNo}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={bale.grossWt}
                                onChange={(e) => handleDetailChange(index, "grossWt", e.target.value)}
                                step="0.001"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={bale.tareWt}
                                onChange={(e) => handleDetailChange(index, "tareWt", e.target.value)}
                                step="0.001"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatNumber(bale.netWt, 3)}</td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeBaleFromInvoice(index)}
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                          <td colSpan="3" className="px-3 py-2 text-sm text-gray-900 text-right">Totals:</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{formatNumber(totalGross, 3)}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{formatNumber(totalTare, 3)}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{formatNumber(totalNet, 3)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Invoice Value */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Invoice Value</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessable Value</label>
                    <input
                      type="number"
                      name="assessableValue"
                      value={formData.assessableValue}
                      onChange={handleFormChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
                    <input
                      type="number"
                      name="gst"
                      value={formData.gst}
                      onChange={handleFormChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Value</label>
                    <input
                      type="number"
                      name="invoiceValue"
                      value={formData.invoiceValue}
                      onChange={handleFormChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="approve"
                        checked={formData.approve}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Approval</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Waste Cotton Sales Invoice Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Invoice Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice No.</label>
                    <p className="text-lg font-semibold">{selectedInvoice.invoiceNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-lg">{formatDate(selectedInvoice.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice Type</label>
                    <p className="text-lg">{selectedInvoice.invoiceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Party Name</label>
                    <p className="text-lg">{selectedInvoice.partyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-lg">{selectedInvoice.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Transport & Value Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transport</label>
                    <p className="text-lg">{selectedInvoice.transport || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">LR No.</label>
                    <p className="text-lg">{selectedInvoice.lrNo || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle No.</label>
                    <p className="text-lg">{selectedInvoice.vehicleNo || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice Value</label>
                    <p className="text-lg font-semibold text-blue-600">
                      ₹{formatNumber(selectedInvoice.invoiceValue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-lg">
                      {selectedInvoice.approve ? (
                        <span className="px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bale Details */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Bale Details ({selectedInvoice.details?.length || 0})</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waste Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LOT No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Wt.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tare Wt.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Wt.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedInvoice.details || []).map((bale, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{bale.wasteName}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{bale.lotNo}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{bale.baleNo}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(bale.grossWt, 3)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(bale.tareWt, 3)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatNumber(bale.netWt, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-sm text-gray-900 text-right">Totals:</td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(
                          (selectedInvoice.details || []).reduce((sum, b) => sum + (parseFloat(b.grossWt) || 0), 0),
                          3
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(
                          (selectedInvoice.details || []).reduce((sum, b) => sum + (parseFloat(b.tareWt) || 0), 0),
                          3
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(
                          (selectedInvoice.details || []).reduce((sum, b) => sum + (parseFloat(b.netWt) || 0), 0),
                          3
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Invoice Value Details */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Invoice Value Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assessable Value</label>
                  <p className="text-lg">₹{formatNumber(selectedInvoice.assessableValue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">GST</label>
                  <p className="text-lg">₹{formatNumber(selectedInvoice.gst)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sub Total</label>
                  <p className="text-lg">₹{formatNumber(selectedInvoice.subTotal)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Value</label>
                  <p className="text-lg font-semibold text-blue-600">₹{formatNumber(selectedInvoice.invoiceValue)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedInvoice);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Invoice</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center">Are you sure you want to delete this invoice?</p>
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Invoice No: {invoiceToDelete.invoiceNo} - {invoiceToDelete.partyName}
                  </p>
                  <p className="text-xs text-red-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setInvoiceToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(invoiceToDelete._id)}
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

export default WasteCottonInvoicePage;
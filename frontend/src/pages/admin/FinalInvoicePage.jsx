// components/finalInvoice/FinalInvoice.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  message,
  Card,
  Tabs,
  Row,
  Col,
  Tooltip,
  Divider,
  Statistic,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import finalInvoiceService from '../../services/admin1/transaction-cotton/finalInvoiceService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const FinalInvoice = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // State management
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);
  const [totals, setTotals] = useState({
    totalWeight: 0,
    totalQuantity: 0,
    totalInvoiceValue: 0,
    totalFreight: 0,
    totalAssessValue: 0,
    totalTax: 0,
    totalNetAmount: 0,
    totalIGST: 0,
    totalSGST: 0,
    totalCGST: 0
  });

  // Fetch all invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await finalInvoiceService.getAllFinalInvoices();
      setInvoices(data || []);
    } catch (error) {
      message.error('Failed to fetch invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available lots
  const fetchAvailableLots = async () => {
    try {
      const data = await inwardLotService.getAll();
      setAvailableLots(data || []);
    } catch (error) {
      message.error('Failed to fetch lots');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAvailableLots();
  }, []);

  // Calculate totals whenever invoice details change
  useEffect(() => {
    calculateTotals();
  }, [invoiceDetails]);

  const calculateTotals = () => {
    const newTotals = invoiceDetails.reduce((acc, detail) => {
      const weight = Number(detail.nettWeight) || 0;
      const qty = Number(detail.qty) || 0;
      const assessValue = Number(detail.assessValue) || 0;
      const freight = Number(detail.freight) || 0;
      const taxAmount = Number(detail.TaxRs) || 0;
      const igst = Number(detail.igstAmount) || 0;
      const sgst = Number(detail.sgstAmount) || 0;
      const cgst = Number(detail.cgstAmount) || 0;
      
      // Invoice Value = Assess Value + Freight + Other Charges
      const invoiceValue = assessValue + freight + 
                          (Number(detail.insurance) || 0) + 
                          (Number(detail.charity) || 0) +
                          (Number(detail.eduCess) || 0) +
                          (Number(detail.hrSecCess) || 0);

      return {
        totalWeight: acc.totalWeight + weight,
        totalQuantity: acc.totalQuantity + qty,
        totalInvoiceValue: acc.totalInvoiceValue + invoiceValue,
        totalFreight: acc.totalFreight + freight,
        totalAssessValue: acc.totalAssessValue + assessValue,
        totalTax: acc.totalTax + taxAmount,
        totalIGST: acc.totalIGST + igst,
        totalSGST: acc.totalSGST + sgst,
        totalCGST: acc.totalCGST + cgst,
        totalNetAmount: acc.totalNetAmount + (invoiceValue + taxAmount)
      };
    }, {
      totalWeight: 0,
      totalQuantity: 0,
      totalInvoiceValue: 0,
      totalFreight: 0,
      totalAssessValue: 0,
      totalTax: 0,
      totalIGST: 0,
      totalSGST: 0,
      totalCGST: 0,
      totalNetAmount: 0
    });
    setTotals(newTotals);
  };

  // Handle lot selection
  const handleAddLot = async (lotId) => {
    try {
      const lotData = await inwardLotService.getById(lotId);
      
      // Check if lot already added
      if (invoiceDetails.some(d => d.lotId === lotData.id)) {
        message.warning('This lot is already added');
        return;
      }

      // Create detail row with all fields from lot data
      const newDetail = {
        lotId: lotData.id,
        lotNo: lotData.lotNo,
        supplier: lotData.supplier,
        broker: lotData.broker,
        variety: lotData.variety,
        mixingGroup: lotData.mixingGroup,
        station: lotData.station,
        companyBroker: lotData.companyBroker,
        
        // Weight details
        nettWeight: Number(lotData.nettWeight) || 0,
        qty: Number(lotData.qty) || 0,
        freight: Number(lotData.freight) || 0,
        
        // Rate details
        candyRate: Number(lotData.candyRate) || 0,
        quintalRate: Number(lotData.quintalRate) || 0,
        ratePerKg: Number(lotData.ratePerKg) || 0,
        assessValue: Number(lotData.assessValue) || 0,
        
        // Tax details
        Tax: Number(lotData.Tax) || 0,
        TaxRs: Number(lotData.TaxRs) || 0,
        gst: Number(lotData.gst) || 0,
        sgst: Number(lotData.sgst) || 0,
        cgst: Number(lotData.cgst) || 0,
        igst: Number(lotData.igst) || 0,
        sgstAmount: Number(lotData.sgstAmount) || 0,
        cgstAmount: Number(lotData.cgstAmount) || 0,
        igstAmount: Number(lotData.igstAmount) || 0,
        
        // Initialize all other fields with 0
        factor: 1,
        insurance: 0,
        charityBale: 0,
        charity: 0,
        eduCessPercent: 0,
        eduCess: 0,
        hsCessPercent: 0,
        hsCess: 0,
        tngstPercent: 0,
        tngst: 0,
        taxType: '',
        taxPercent: 0,
        tax: 0,
        commissionValue: 0,
        roundOff: 0,
        invValueOC: Number(lotData.assessValue) || 0,
        invValue: Number(lotData.assessValue) || 0,
        permitNo: '',
        transport: '',
        lrNo: '',
        lrDate: null,
        totalLRValue: 0,
        lrPercent: 0,
        lrValue: 0,
        serviceTaxPercent: 0,
        serviceTax: 0,
        eduCess2Percent: 0,
        eduCess2: 0,
        hsCess2Percent: 0,
        hsCess2: 0,
        tdsPercent: 0,
        tds: 0,
        companyBrokerId: null,
        tcsPercent: 0,
        tcsAmount: 0,
        remarks: '',
        netAmount: Number(lotData.assessValue) || 0
      };

      setInvoiceDetails([...invoiceDetails, newDetail]);
      message.success('Lot added successfully');
    } catch (error) {
      message.error('Failed to fetch lot details');
      console.error(error);
    }
  };

  // Handle detail removal
  const handleRemoveDetail = (index) => {
    const newDetails = invoiceDetails.filter((_, i) => i !== index);
    setInvoiceDetails(newDetails);
  };

  // Handle detail field update
  const handleDetailChange = (index, field, value) => {
    const newDetails = [...invoiceDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    // Recalculate if needed
    const detail = newDetails[index];
    if (field === 'assessValue' || field === 'freight' || field === 'insurance' || 
        field === 'charity' || field === 'eduCess' || field === 'hsCess') {
      const invoiceValue = (Number(detail.assessValue) || 0) + 
                          (Number(detail.freight) || 0) + 
                          (Number(detail.insurance) || 0) + 
                          (Number(detail.charity) || 0) +
                          (Number(detail.eduCess) || 0) +
                          (Number(detail.hsCess) || 0);
      detail.invValue = invoiceValue;
      detail.netAmount = invoiceValue + (Number(detail.TaxRs) || 0);
    }
    
    setInvoiceDetails(newDetails);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (invoiceDetails.length === 0) {
      message.warning('Please add at least one lot');
      return;
    }

    try {
      // Format head data
      const headData = {
        voucherNo: values.voucherNo,
        invoiceDate: dayjs(values.invoiceDate).format('YYYY-MM-DD'),
        tcType: values.tcType || 'UPCOUNTRY',
        weight: totals.totalWeight,
        quantity: totals.totalQuantity,
        invoiceValue: totals.totalInvoiceValue,
        freight: totals.totalFreight,
        billNo: values.billNo,
        billDate: values.billDate ? dayjs(values.billDate).format('YYYY-MM-DD') : null,
        
        // Charges from image
        insurance: 0,
        charity: 0,
        eduCess: 0,
        hrSecCess: 0,
        cst: 0,
        tngst: 0,
        vat: 0,
        commission: 0,
        tcs: 0,
        roundOff: 0.33, // As per image
        
        netAmount: totals.totalNetAmount,
        remarks: values.remarks,
        deliveryType: 'SPOT',
        
        // Service Tax & TDS section
        totalLRValue: 0,
        lrValue: 0,
        serviceTax: 0,
        eduCess2: 0,
        hrSecCess2: 0,
        tds: values.tds || 0,
        sgst: totals.totalSGST,
        cgst: totals.totalCGST,
        igst: totals.totalIGST
      };

      // Format details data
      const detailsData = invoiceDetails.map(detail => ({
        lotId: detail.lotId,
        factor: detail.factor,
        insurance: detail.insurance,
        charityBale: detail.charityBale,
        charity: detail.charity,
        eduCessPercent: detail.eduCessPercent,
        eduCess: detail.eduCess,
        hsCessPercent: detail.hsCessPercent,
        hsCess: detail.hsCess,
        tngstPercent: detail.tngstPercent,
        tngst: detail.tngst,
        taxType: detail.taxType,
        taxPercent: detail.taxPercent,
        tax: detail.tax,
        commissionValue: detail.commissionValue,
        roundOff: detail.roundOff,
        netAmount: detail.netAmount,
        invValueOC: detail.invValueOC,
        invValue: detail.invValue,
        permitNo: detail.permitNo,
        transport: detail.transport,
        lrNo: detail.lrNo,
        lrDate: detail.lrDate,
        totalLRValue: detail.totalLRValue,
        lrPercent: detail.lrPercent,
        lrValue: detail.lrValue,
        serviceTaxPercent: detail.serviceTaxPercent,
        serviceTax: detail.serviceTax,
        eduCess2Percent: detail.eduCess2Percent,
        eduCess2: detail.eduCess2,
        hsCess2Percent: detail.hsCess2Percent,
        hsCess2: detail.hsCess2,
        tdsPercent: detail.tdsPercent,
        tds: detail.tds,
        companyBrokerId: detail.companyBrokerId,
        tcsPercent: detail.tcsPercent,
        tcsAmount: detail.tcsAmount,
        remarks: detail.remarks,
        
        // Additional fields from lot
        nettWeight: detail.nettWeight,
        qty: detail.qty,
        freight: detail.freight,
        candyRate: detail.candyRate,
        quintalRate: detail.quintalRate,
        ratePerKg: detail.ratePerKg,
        assessValue: detail.assessValue,
        Tax: detail.Tax,
        TaxRs: detail.TaxRs,
        gst: detail.gst,
        sgst: detail.sgst,
        cgst: detail.cgst,
        igst: detail.igst,
        sgstAmount: detail.sgstAmount,
        cgstAmount: detail.cgstAmount,
        igstAmount: detail.igstAmount,
        supplier: detail.supplier,
        broker: detail.broker,
        variety: detail.variety,
        mixingGroup: detail.mixingGroup,
        station: detail.station,
        companyBroker: detail.companyBroker
      }));

      const payload = {
        ...headData,
        details: detailsData
      };

      if (editingId) {
        await finalInvoiceService.updateFinalInvoice(editingId, payload);
        message.success('Invoice updated successfully');
      } else {
        await finalInvoiceService.createFinalInvoice(payload);
        message.success('Invoice created successfully');
      }

      setModalVisible(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      message.error(editingId ? 'Failed to update invoice' : 'Failed to create invoice');
      console.error(error);
    }
  };

  // Reset form
  const resetForm = () => {
    form.resetFields();
    setInvoiceDetails([]);
    setEditingId(null);
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      const invoice = await finalInvoiceService.getFinalInvoiceById(id);
      setEditingId(id);
      
      form.setFieldsValue({
        ...invoice,
        invoiceDate: invoice.invoiceDate ? dayjs(invoice.invoiceDate) : null,
        billDate: invoice.billDate ? dayjs(invoice.billDate) : null
      });

      setInvoiceDetails(invoice.details || []);
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch invoice details');
      console.error(error);
    }
  };

  // Handle view
  const handleView = async (id) => {
    try {
      const invoice = await finalInvoiceService.getFinalInvoiceById(id);
      setSelectedInvoice(invoice);
      setViewModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch invoice details');
      console.error(error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await finalInvoiceService.deleteFinalInvoice(id);
      message.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      message.error('Failed to delete invoice');
      console.error(error);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Voucher No.',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      sorter: (a, b) => a.voucherNo - b.voucherNo
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'TC Type',
      dataIndex: 'tcType',
      key: 'tcType'
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (val) => val ? Number(val).toFixed(3) : '-'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Invoice Value',
      dataIndex: 'invoiceValue',
      key: 'invoiceValue',
      render: (val) => val ? `₹${Number(val).toFixed(2)}` : '-'
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (val) => val ? `₹${Number(val).toFixed(2)}` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record.id)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record.id)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this invoice?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Details table columns
  const detailColumns = [
    {
      title: 'Lot No',
      dataIndex: 'lotNo',
      key: 'lotNo',
      fixed: 'left',
      width: 120
    },
    {
      title: 'Party Name',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 180
    },
    {
      title: 'Weight',
      dataIndex: 'nettWeight',
      key: 'nettWeight',
      width: 100,
      render: (val) => Number(val).toFixed(3)
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 80
    },
    {
      title: 'Payment Mode',
      key: 'paymentMode',
      width: 100,
      render: () => 'CHQUE' // Default as per image
    },
    {
      title: 'Currency',
      key: 'currency',
      width: 80,
      render: () => 'RUPEES'
    },
    {
      title: 'Factor',
      dataIndex: 'factor',
      key: 'factor',
      width: 70,
      render: (val) => Number(val).toFixed(3)
    },
    {
      title: 'Candy Rate in OC',
      key: 'candyRateOC',
      width: 120,
      render: (_, record) => Number(record.candyRate || 0).toFixed(2)
    },
    {
      title: 'CandyRate',
      dataIndex: 'candyRate',
      key: 'candyRate',
      width: 100,
      render: (val) => Number(val).toFixed(2)
    },
    {
      title: 'Quintal Rate in OC',
      key: 'quintalRateOC',
      width: 120,
      render: (_, record) => Number(record.quintalRate || 0).toFixed(2)
    },
    {
      title: 'Quintal Rate',
      dataIndex: 'quintalRate',
      key: 'quintalRate',
      width: 100,
      render: (val) => Number(val).toFixed(3)
    },
    {
      title: 'Rate/Kg in OC',
      key: 'ratePerKgOC',
      width: 120,
      render: (_, record) => Number(record.ratePerKg || 0).toFixed(4)
    },
    {
      title: 'Rate/Kg',
      dataIndex: 'ratePerKg',
      key: 'ratePerKg',
      width: 100,
      render: (val) => Number(val).toFixed(4)
    },
    {
      title: 'Assess Value',
      dataIndex: 'assessValue',
      key: 'assessValue',
      width: 120,
      render: (val) => Number(val).toFixed(2)
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 80,
      render: (_, record, index) => (
        <Button 
          danger 
          size="small" 
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveDetail(index)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h2>Final Invoices</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              resetForm();
              setModalVisible(true);
            }}
          >
            Create Final Invoice
          </Button>
        </div>

        {/* Search */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="voucherNo">
              <Input placeholder="Voucher No." prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item name="fromDate">
              <DatePicker placeholder="From Date" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="toDate">
              <DatePicker placeholder="To Date" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">Search</Button>
                <Button icon={<ReloadOutlined />} onClick={() => searchForm.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Edit Final Invoice' : 'Create Final Invoice'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
        width={1400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ tcType: 'UPCOUNTRY' }}
        >
          {/* Head Section - As per image */}
          <Card title="Head" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item
                  name="voucherNo"
                  label="Voucher No."
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="invoiceDate"
                  label="Invoice Date"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="tcType" label="TC Type">
                  <Select>
                    <Option value="UPCOUNTRY">UPCOUNTRY</Option>
                    <Option value="LOCAL">LOCAL</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Insurance" 
                  value="0" 
                  suffix="SPOT FOR"
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Charity" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="Weight" 
                  value={totals.totalWeight.toFixed(3)} 
                  suffix="kg"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Quantity" 
                  value={totals.totalQuantity} 
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Invoice Value" 
                  value={totals.totalInvoiceValue.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Freight" 
                  value={totals.totalFreight.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Form.Item name="billNo" label="Bill No.">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="billDate" label="Bill Date">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="Edu.Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Hr.Sec.Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="CST" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="TNEST" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="VAT" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Commission" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="TCS" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Round Off" 
                  value="0.33" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Net Amount" 
                  value={totals.totalNetAmount.toFixed(2)} 
                  prefix="₹"
                  valueStyle={{ color: '#3f8600', fontSize: '16px' }}
                />
              </Col>
              <Col span={8}>
                <Form.Item name="remarks" label="Remarks">
                  <Input placeholder="-" />
                </Form.Item>
              </Col>
            </Row>

            {/* Service Tax & TDS Section */}
            <Divider orientation="left">Service Tax & TDS</Divider>
            
            <Row gutter={16}>
              <Col span={4}>
                <Statistic 
                  title="Total LR Value" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="LR Value" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Service Tax" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Educ. Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Hr.Sec.Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Form.Item name="tds" label="TDS" initialValue={3876.96}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="SGST" 
                  value={totals.totalSGST.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="CGST" 
                  value={totals.totalCGST.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="IGST" 
                  value={totals.totalIGST.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
            </Row>
          </Card>

          {/* Details Section */}
          <Card title="Details" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Select
                placeholder="Select Lot No"
                style={{ width: 300 }}
                showSearch
                optionFilterProp="children"
                onChange={handleAddLot}
                allowClear
              >
                {availableLots.map(lot => (
                  <Option key={lot.id} value={lot.id}>
                    {lot.lotNo} - {lot.supplier} (Qty: {lot.qty}, Wt: {lot.nettWeight})
                  </Option>
                ))}
              </Select>
            </div>

            <Table
              dataSource={invoiceDetails}
              columns={detailColumns}
              rowKey={(record, index) => index}
              pagination={false}
              scroll={{ x: 'max-content', y: 400 }}
              size="small"
              bordered
            />
          </Card>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {editingId ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Invoice #${selectedInvoice?.voucherNo}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1400}
      >
        {selectedInvoice && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Head" key="1">
              <Descriptions bordered column={4} size="small">
                <Descriptions.Item label="Voucher No." span={1}>{selectedInvoice.voucherNo}</Descriptions.Item>
                <Descriptions.Item label="Invoice Date" span={1}>
                  {dayjs(selectedInvoice.invoiceDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="TC Type" span={1}>{selectedInvoice.tcType || '-'}</Descriptions.Item>
                <Descriptions.Item label="Insurance" span={1}>0 SPOT FOR</Descriptions.Item>
                
                <Descriptions.Item label="Weight" span={1}>{Number(selectedInvoice.weight).toFixed(3)}</Descriptions.Item>
                <Descriptions.Item label="Quantity" span={1}>{selectedInvoice.quantity}</Descriptions.Item>
                <Descriptions.Item label="Invoice Value" span={1}>₹{Number(selectedInvoice.invoiceValue).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="Freight" span={1}>₹{Number(selectedInvoice.freight).toFixed(2)}</Descriptions.Item>
                
                <Descriptions.Item label="Bill No." span={1}>{selectedInvoice.billNo || '-'}</Descriptions.Item>
                <Descriptions.Item label="Bill Date" span={1}>
                  {selectedInvoice.billDate ? dayjs(selectedInvoice.billDate).format('DD/MM/YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Charity" span={1}>0</Descriptions.Item>
                <Descriptions.Item label="Edu.Cess" span={1}>0</Descriptions.Item>
                
                <Descriptions.Item label="Hr.Sec.Cess" span={1}>0</Descriptions.Item>
                <Descriptions.Item label="CST" span={1}>0</Descriptions.Item>
                <Descriptions.Item label="TNEST" span={1}>0</Descriptions.Item>
                <Descriptions.Item label="VAT" span={1}>0</Descriptions.Item>
                
                <Descriptions.Item label="Commission" span={1}>0</Descriptions.Item>
                <Descriptions.Item label="TCS" span={1}>0</Descriptions.Item>
                <Descriptions.Item label="Round Off" span={1}>0.33</Descriptions.Item>
                <Descriptions.Item label="Net Amount" span={1}>
                  <strong>₹{Number(selectedInvoice.netAmount).toFixed(2)}</strong>
                </Descriptions.Item>
                
                <Descriptions.Item label="Remarks" span={4}>{selectedInvoice.remarks || '-'}</Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Service Tax & TDS</Divider>
              
              <Descriptions bordered column={4} size="small">
                <Descriptions.Item label="Total LR Value">0</Descriptions.Item>
                <Descriptions.Item label="LR Value">0</Descriptions.Item>
                <Descriptions.Item label="Service Tax">0</Descriptions.Item>
                <Descriptions.Item label="Educ. Cess">0</Descriptions.Item>
                
                <Descriptions.Item label="Hr.Sec.Cess">0</Descriptions.Item>
                <Descriptions.Item label="TDS">₹{Number(selectedInvoice.tds || 3876.96).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="SGST">₹{Number(selectedInvoice.sgst || 0).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="CGST">₹{Number(selectedInvoice.cgst || 0).toFixed(2)}</Descriptions.Item>
                
                <Descriptions.Item label="IGST" span={4}>₹{Number(selectedInvoice.igst || 193848.04).toFixed(2)}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Details" key="2">
              <Table
                dataSource={selectedInvoice.details}
                columns={detailColumns.filter(col => col.title !== 'Actions')}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="small"
                bordered
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default FinalInvoice;
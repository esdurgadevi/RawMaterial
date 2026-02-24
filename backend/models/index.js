import sequelize from "../config/db.js";

//auth
import UserModel from "./auth/userModel.js";

//master
import BrokerModel from "./admin1/master/Broker.js";
import StateModel from "./admin1/master/state.js";
import StationModel from "./admin1/master/station.js";
import MixingGroupModel from "./admin1/master/mixingGroup.js";
import MixingModel from "./admin1/master/mixing.js";
import VarietyModel from "./admin1/master/variety.js";
import GodownModel from "./admin1/master/godown.js";
import CompanyBrokerModel from "./admin1/master/companyBroker.js";
import WasteInvoiceTypeModel from "./admin1/master/wasteInvoiceType.js";
import SupplierModel from "./admin1/master/supplier.js";
import CommodityModel from "./admin1/master/commodity.js";
import TransportModel from "./admin1/master/transport.js";
import FibreModel from "./admin1/master/fibre.js";
import PackingTypeModel from "./admin1/master/packingType.js";
import WasteMasterModel from "./admin1/master/wasteMaster.js";
import WasteRateModel from "./admin1/master/wasteRate.js";
import WasteLotModel from "./admin1/master/wasteLot.js"
import CostMasterModel from "./admin1/master/costMaster.js";

//transaction-cotton
import PurchaseOrderModel from "./admin1/transaction-cotton/purchaseOrder.js";
import InwardEntryModel from "./admin1/transaction-cotton/gate-inward/inwardEntry.js";
import InwardLotModel from "./admin1/transaction-cotton/inward-lot/inwardLot.js";
import InwardLotWeightmentModel from "./admin1/transaction-cotton/inward-lot/inwardLotWeightment.js";
import IssueModel from "./admin1/transaction-cotton/issue/Issue.js";
import IssueItemModel from "./admin1/transaction-cotton/issue/IssueItem.js";

//transaction-waste
import WastePackingDetailModel from "./admin1/transaction-waste/waste-packing/wastePackingDetailModel.js";
import WastePacking from "./admin1/transaction-waste/waste-packing/wastePackingModel.js";
import SalesOrderModel from "./admin1/transaction-waste/sales-order/salesOrderModel.js";
import SalesOrderDetailModel from "./admin1/transaction-waste/sales-order/salesOrderDetailModel.js";
import WasteEntryModel from './admin1/transaction-waste/waste-entry/wasteEntryModel.js';
import WasteEntryDetailModel from './admin1/transaction-waste/waste-entry/wasteEntryDetailModel.js';


import InvoiceModel from "./invoiceModel.js";
import InvoiceDetailModel from "./invoiceDetailModel.js";

//admin2 master
import SpinningCountModel from "./admin2/master/spinningCount.js";
import SimplexMachineModel from "./admin2/master/simplexMachine.js";
import QCEntryModel from "./admin2/transaction-qc/QCEntryModel.js";
import SpinningLongFrameInit from "./admin2/transaction-qc/SpinningLongFrameModel.js";
import BreakerDrawingModel from "./admin2/transaction-qc/BreakerDrawingModel.js";
import FinisherDrawingInit from "./admin2/transaction-qc/FinisherDrawingModel.js";
import ComberEntryModel from "./admin2/transaction-qc/comberEntry.js";
import LapFormerInit from "./admin2/transaction-qc/LapFormerModel.js";
import AutoConerInit from "./admin2/transaction-qc/AutoConerModel.js";
import QcSimplexInit from "./admin2/transaction-qc/QcSimplexModel.js";
import QcCardingInit from "./admin2/transaction-qc/QcCardingModel.js";
import QcBlowRoomInit from "./admin2/transaction-qc/QcBlowRoomModel.js";

const db = {};
db.sequelize = sequelize;

db.User = UserModel(sequelize);
db.Broker = BrokerModel(sequelize);
db.State = StateModel(sequelize);
db.Station = StationModel(sequelize);
db.Fibre = FibreModel(sequelize);
db.Godown = GodownModel(sequelize);
db.CompanyBroker = CompanyBrokerModel(sequelize);
db.WasteInvoiceType = WasteInvoiceTypeModel(sequelize);
db.Transport = TransportModel(sequelize);
db.Supplier = SupplierModel(sequelize);
db.MixingGroup = MixingGroupModel(sequelize);
db.Mixing = MixingModel(sequelize);
db.Commodity = CommodityModel(sequelize);
db.Variety = VarietyModel(sequelize);
db.PackingType = PackingTypeModel(sequelize);
db.WasteMaster = WasteMasterModel(sequelize);
db.WasteRate = WasteRateModel(sequelize);
db.WasteLot = WasteLotModel(sequelize);
db.CostMaster = CostMasterModel(sequelize);
db.PurchaseOrder = PurchaseOrderModel(sequelize);
db.InwardEntry = InwardEntryModel(sequelize);
db.InwardLot = InwardLotModel(sequelize);
db.InwardLotWeightment = InwardLotWeightmentModel(sequelize);
db.Issue = IssueModel(sequelize);
db.IssueItem = IssueItemModel(sequelize);
db.WastePacking = WastePacking(sequelize);
db.WastePackingDetail = WastePackingDetailModel(sequelize);
db.SalesOrder = SalesOrderModel(sequelize);
db.SalesOrderDetail = SalesOrderDetailModel(sequelize);
db.Invoice = InvoiceModel(sequelize);
db.InvoiceDetail = InvoiceDetailModel(sequelize);
db.WasteEntry = WasteEntryModel(sequelize);
db.WasteEntryDetail = WasteEntryDetailModel(sequelize);

//admin2 master spinning count
db.SpinningCount = SpinningCountModel(sequelize);
db.SimplexMachine = SimplexMachineModel(sequelize);
db.QCEntry = QCEntryModel(sequelize);
db.SpinningLongFrame = SpinningLongFrameInit(sequelize);
db.BreakerDrawing = BreakerDrawingModel(sequelize);
db.FinisherDrawing = FinisherDrawingInit(sequelize);
db.ComberEntry = ComberEntryModel(sequelize);
db.LapFormer = LapFormerInit(sequelize);
db.AutoConer = AutoConerInit(sequelize);
db.QcSimplex = QcSimplexInit(sequelize);
db.QcCarding = QcCardingInit(sequelize);
db.QcBlowRoom = QcBlowRoomInit(sequelize);

db.State.hasMany(db.Station, {
  foreignKey: "stateId",
});

db.Station.belongsTo(db.State, {
  foreignKey: "stateId",
});

// Define associations (optional but recommended for scalability)
db.Fibre.hasMany(db.Mixing, {
  foreignKey: "fibreId",
  as: "mixings",
});

db.Mixing.belongsTo(db.Fibre, {
  foreignKey: "fibreId",
  as: "fibre",
});

db.MixingGroup.hasMany(db.Mixing, {
  foreignKey: "mixingGroupId",
  as: "mixings",
});

db.Mixing.belongsTo(db.MixingGroup, {
  foreignKey: "mixingGroupId",
  as: "mixingGroup",
});

db.Fibre.belongsTo(db.Commodity, {
  foreignKey: "commodityId",
  as: "commodity",
});

db.Fibre.hasMany(db.Variety, {
  foreignKey: "fibreId",
  as: "varieties",
});

db.Variety.belongsTo(db.Fibre, {
  foreignKey: "fibreId",
  as: "fibre",
});

// Define association (optional but recommended)
db.State.hasMany(db.Supplier, {
  foreignKey: "stateId",
  as: "suppliers",
});

db.Supplier.belongsTo(db.State, {
  foreignKey: "stateId",
  as: "state",
});

db.Commodity.hasMany(db.Fibre, {
  foreignKey: "commodityId",
  as: "fibres",
});

// Define associations (important for foreign key)
db.PackingType.hasMany(db.WasteMaster, {
  foreignKey: "packingTypeId",
  as: "wasteMasters",
});

db.WasteMaster.belongsTo(db.PackingType, {
  foreignKey: "packingTypeId",
  as: "packingType",
});

db.WasteMaster.hasMany(db.WasteRate, {
  foreignKey: "wasteMasterId",
  as: "wasteRates",
});

db.WasteRate.belongsTo(db.WasteMaster, {
  foreignKey: "wasteMasterId",
  as: "wasteMaster",
});

db.WasteMaster.hasMany(db.WasteLot, {
  foreignKey: "wasteMasterId",
  as: "wasteLots",
});

db.WasteLot.belongsTo(db.WasteMaster, {
  foreignKey: "wasteMasterId",
  as: "wasteMaster",
});
db.Supplier.hasMany(db.PurchaseOrder, {
  foreignKey: "supplierId",
  as: "purchaseOrders",
});
db.PurchaseOrder.belongsTo(db.Supplier, {
  foreignKey: "supplierId",
  as: "supplier",
});

db.Broker.hasMany(db.PurchaseOrder, {
  foreignKey: "brokerId",
  as: "purchaseOrders",
});
db.PurchaseOrder.belongsTo(db.Broker, {
  foreignKey: "brokerId",
  as: "broker",
});

db.Variety.hasMany(db.PurchaseOrder, {
  foreignKey: "varietyId",
  as: "purchaseOrders",
});
db.PurchaseOrder.belongsTo(db.Variety, {
  foreignKey: "varietyId",
  as: "variety",
});

db.MixingGroup.hasMany(db.PurchaseOrder, {
  foreignKey: "mixingGroupId",
  as: "purchaseOrders",
});
db.PurchaseOrder.belongsTo(db.MixingGroup, {
  foreignKey: "mixingGroupId",
  as: "mixingGroup",
});

db.Station.hasMany(db.PurchaseOrder, {
  foreignKey: "stationId",
  as: "purchaseOrders",
});
db.PurchaseOrder.belongsTo(db.Station, {
  foreignKey: "stationId",
  as: "station",
});

db.CompanyBroker.hasMany(db.PurchaseOrder, {
  foreignKey: "companyBrokerId",
  as: "purchaseOrders",
});
db.PurchaseOrder.belongsTo(db.CompanyBroker, {
  foreignKey: "companyBrokerId",
  as: "companyBroker",
});

// Real FK associations
db.PurchaseOrder.hasMany(db.InwardEntry, {
  foreignKey: "purchaseOrderId",
  as: "inwardEntries",
});
db.InwardEntry.belongsTo(db.PurchaseOrder, {
  foreignKey: "purchaseOrderId",
  as: "purchaseOrder",
});

db.Godown.hasMany(db.InwardEntry, {
  foreignKey: "godownId",
  as: "inwardEntries",
});

db.InwardEntry.belongsTo(db.Godown, {
  foreignKey: "godownId",
  as: "godown",
});

db.InwardEntry.hasMany(db.InwardLot, {
  foreignKey: "inwardId",
});

db.InwardLot.belongsTo(db.InwardEntry, {
  foreignKey: "inwardId",
});

db.InwardLot.hasMany(db.InwardLotWeightment, {
  foreignKey: "inwardLotId",
  as: "weightments",
});

db.InwardLotWeightment.belongsTo(db.InwardLot, {
  foreignKey: "inwardLotId",
  as: "inwardLot",
});

//issue
db.Issue.hasMany(db.IssueItem, {
  foreignKey: "issueId",
});

db.IssueItem.belongsTo(db.Issue, {
  foreignKey: "issueId",
});

db.Issue.belongsTo(db.MixingGroup, {
  foreignKey: "mixingGroupId",
  as: "mixingGroup",
});

db.Issue.belongsTo(db.MixingGroup, {
  foreignKey: "toMixingGroupId",
  as: "toMixingGroup",
});

db.IssueItem.belongsTo(db.InwardLotWeightment, {
  foreignKey: "weightmentId",
});

db.WastePacking.hasMany(db.WastePackingDetail, {
  foreignKey: "wastePackingId",
  as: "details",
});

db.WastePackingDetail.belongsTo(db.WastePacking, {
  foreignKey: "wastePackingId",
  as: "packing",
});

db.SalesOrder.hasMany(db.SalesOrderDetail, {
  foreignKey: "salesOrderId",
  as: "details",
});
db.SalesOrderDetail.belongsTo(db.SalesOrder, {
  foreignKey: "salesOrderId",
  as: "order",
});

//waste invoice
// Associations
db.Invoice.hasMany(db.InvoiceDetail, {
  foreignKey: "invoiceId",
  as: "details",
});
db.InvoiceDetail.belongsTo(db.Invoice, {
  foreignKey: "invoiceId",
  as: "invoice",
});

db.SalesOrder.hasMany(db.Invoice, {
  foreignKey: "salesOrderId",
  as: "invoices",
});
db.Invoice.belongsTo(db.SalesOrder, {
  foreignKey: "salesOrderId",
  as: "salesOrder",
});
//waste entry
db.WasteEntry.hasMany(db.WasteEntryDetail, {
  foreignKey: "wasteEntryId",
  as: "details",
});

db.WasteEntryDetail.belongsTo(db.WasteEntry, {
  foreignKey: "wasteEntryId",
  as: "entry",
});
db.WasteMaster.hasMany(db.WasteEntryDetail, {
  foreignKey: "wasteMasterId",
  as: "entryDetails",
});

db.WasteEntryDetail.belongsTo(db.WasteMaster, {
  foreignKey: "wasteMasterId",
  as: "waste",
});
db.PackingType.hasMany(db.WasteEntryDetail, {
  foreignKey: "packingTypeId",
  as: "entryDetails",
});

db.WasteEntryDetail.belongsTo(db.PackingType, {
  foreignKey: "packingTypeId",
  as: "packingType",
});
db.Godown.hasMany(db.WasteEntryDetail, {
  foreignKey: "godownId",
  as: "entryDetails",
});

db.WasteEntryDetail.belongsTo(db.Godown, {
  foreignKey: "godownId",
  as: "godown",
});

//admin2
//transaction-qc entry
db.InwardLot.hasMany(db.QCEntry, {
  foreignKey: "inwardLotId",
  as: "qcEntries",
  onDelete: "RESTRICT",
});

db.QCEntry.belongsTo(db.InwardLot, {
  foreignKey: "inwardLotId",
  as: "inwardLot",
});

//transaction-qc spinning long frame
db.SpinningLongFrame.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

db.SpinningLongFrame.belongsTo(db.SimplexMachine, {
  foreignKey: "simplexId",
  as: "simplex",
});

//transaction-qc breakerdrawingmodel
db.BreakerDrawing.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

db.BreakerDrawing.belongsTo(db.SimplexMachine, {
  foreignKey: "machineId",
  as: "machine",
});

//transaction-qc finisherdrawing
db.FinisherDrawing.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

//transaction-qc comber entry
db.ComberEntry.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

db.SpinningCount.hasMany(db.ComberEntry, {
  foreignKey: "countId",
  as: "comberEntries",
});


db.ComberEntry.belongsTo(db.SimplexMachine, {
  foreignKey: "simplexMachineId",
  as: "simplex",
});

db.SimplexMachine.hasMany(db.ComberEntry, {
  foreignKey: "simplexMachineId",
  as: "comberEntries",
});

//transaction-qc lapformer
db.LapFormer.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

//transaction-qc autoconerinit
db.AutoConer.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

db.AutoConer.belongsTo(db.SimplexMachine, {
  foreignKey: "simplexId",
  as: "simplex",
});

//transaction-qc qcsimplex
db.QcSimplex.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

db.QcSimplex.belongsTo(db.SimplexMachine, {
  foreignKey: "simplexId",
  as: "simplex",
});

//transaction-qc carding
db.QcCarding.belongsTo(db.SpinningCount, {
  foreignKey: "countId",
  as: "count",
});

db.QcCarding.belongsTo(db.SimplexMachine, {
  foreignKey: "simplexId",
  as: "simplex",
});

export default db;

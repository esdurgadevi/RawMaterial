import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/authRoute.js";
import stationRoutes from './routes/admin1/master/stationRoutes.js';
import mixingGroupRoutes from './routes/admin1/master/mixingGroupRoutes.js';
import mixingRoutes from './routes/admin1/master/mixingRoutes.js';
import varietyRoutes from './routes/admin1/master/varietyRoutes.js';
import stateRoutes from './routes/admin1/master/stateRoutes.js';
import brokerRoutes from './routes/admin1/master/brokerRoutes.js';
import commodityRoutes from './routes/admin1/master/commodityRoutes.js';
import transportRoutes from './routes/admin1/master/transportRoutes.js';
import godownRoutes from './routes/admin1/master/godownRoutes.js';
import companyBrokerRoutes from './routes/admin1/master/companyBrokerRoutes.js';
import wasteInvoiceTypeRoutes from './routes/admin1/master/wasteInvoiceTypeRoutes.js';
import supplierRoutes from './routes/admin1/master/supplierRoutes.js';
import fibreRoutes from './routes/admin1/master/fibreRoutes.js';
import packingTypeRoutes from './routes/admin1/master/packingTypeRoutes.js';
import wasteMasterRoutes from './routes/admin1/master/wasteMasterRoutes.js';
import wasteRateRoutes from './routes/admin1/master/wasteRateRoutes.js';
import wasteLotRoutes from './routes/admin1/master/wasteLotRoutes.js';
import costMasterRoutes from './routes/admin1/master/costMasterRoutes.js';
import purchaseOrderRoutes from './routes/admin1/transaction-cotton/purchaseOrderRoutes.js';
import inwardEntryRoutes from './routes/admin1/transaction-cotton/inwardEntryRoutes.js';
import inwardLotsRoutes from './routes/admin1/transaction-cotton/inwardLotRoutes.js';
import inwardLotWeightmentRoutes from './routes/admin1/transaction-cotton/inwardLotWeightmentRoutes.js';
import issueRoutes from "./routes/admin1/transaction-cotton/issueRoutes.js";
import salesOrderRoutes from "./routes/admin1/transaction-waste/salesOrderRoutes.js";
import wastePackingRoutes from "./routes/admin1/transaction-waste/wastePackingRoutes.js"
import invoiceRoutes from "./routes/admin1/transaction-waste/invoiceRoutes.js";
import wasteEntryRoutes from "./routes/admin1/transaction-waste/wasteEntryRoutes.js";

import spinningRoutes from "./routes/admin2/master/spinningCountRoutes.js";
import simplexMachineRoutes from "./routes/admin2/master/simplexMachineRoutes.js";
import qcEntryRoutes from "./routes/admin2/transaction-qc/qcEntryRoutes.js";
import  spinningLongFrame from "./routes/admin2/transaction-qc/spinningLongFrameRoutes.js";
import breakerDrawingRoutes from "./routes/admin2/transaction-qc/breakerDrawingRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

//Masters
app.use("/api/auth", authRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/mixing-groups", mixingGroupRoutes);
app.use("/api/mixings", mixingRoutes);
app.use("/api/varieties", varietyRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/brokers", brokerRoutes);
app.use("/api/commodities", commodityRoutes);
app.use("/api/transports", transportRoutes);
app.use("/api/godowns", godownRoutes);
app.use("/api/company-brokers", companyBrokerRoutes);
app.use("/api/waste-invoice-types", wasteInvoiceTypeRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/fibres", fibreRoutes);
app.use("/api/packing-types", packingTypeRoutes);
app.use("/api/waste-masters", wasteMasterRoutes);
app.use("/api/waste-rates", wasteRateRoutes);
app.use("/api/waste-lots", wasteLotRoutes);
app.use("/api/cost-masters", costMasterRoutes);

//Transaction Purchase
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/inward-entries", inwardEntryRoutes);
app.use("/api/inward-lots",inwardLotsRoutes);
app.use("/api/weightments",inwardLotWeightmentRoutes)
app.use("/api/issues",issueRoutes);

app.use("/api/waste-packings",wastePackingRoutes);
app.use("/api/waste-sales",salesOrderRoutes);
app.use("/api/invoices",invoiceRoutes);
app.use("/api/waste-entries",wasteEntryRoutes);

//admin2
//master
app.use("/api/admin2/master/spinning-counts",spinningRoutes);
app.use("/api/admin2/master/simplex-machines", simplexMachineRoutes);
app.use("/api/admin2/transaction-qc/qc-entries", qcEntryRoutes);
app.use("/api/admin2/transaction-qc/spinning-long-frame", spinningLongFrame);
app.use(
  "/api/admin2/transaction-qc/breaker-drawing",
  breakerDrawingRoutes
);
import finisherDrawingRoutes from "./routes/admin2/transaction-qc/finisherDrawingRoutes.js";

app.use(
  "/api/admin2/transaction-qc/finisher-drawing",
  finisherDrawingRoutes
);

import comberEntryRoutes from "./routes/admin2/transaction-qc/comberEntryRoutes.js";

app.use(
  "/api/admin2/transaction-qc/comber-entry",
  comberEntryRoutes
);

import lapFormerRoutes from "./routes/admin2/transaction-qc/lapFormerRoutes.js";

app.use(
  "/api/admin2/transaction-qc/lap-former",
  lapFormerRoutes
);

import autoConerRoutes from "./routes/admin2/transaction-qc/autoConerRoutes.js";

app.use(
  "/api/admin2/transaction-qc/auto-coner",
  autoConerRoutes
);

import qcSimplexRoutes from "./routes/admin2/transaction-qc/qcSimplexRoutes.js";

app.use(
  "/api/admin2/transaction-qc/qc-simplex",
  qcSimplexRoutes
);

import qcCardingRoutes from "./routes/admin2/transaction-qc/qcCardingRoutes.js";

app.use(
  "/api/admin2/transaction-qc/qc-carding",
  qcCardingRoutes
);

import qcBlowRoomRoutes from "./routes/admin2/transaction-qc/qcBlowRoomRoutes.js";

app.use(
  "/api/admin2/transaction-qc/qc-blowroom",
  qcBlowRoomRoutes
);

export default app;

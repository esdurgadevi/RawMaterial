// routes/invoiceRoutes.js
import express from "express";
import {
  getNextInvoiceNoController,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../../../controllers/admin1/transaction-waste/invoiceController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/next-invoice-no", getNextInvoiceNoController);
router.post("/", createInvoice);
router.get("/", getAllInvoices);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;
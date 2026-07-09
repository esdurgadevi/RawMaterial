import express from "express";
import {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  deleteSalesOrder,
  getNextSalesOrderNoController,
  getAvailableBales
} from "../../../controllers/admin1/transaction-waste/salesOrderController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/next-order-no", getNextSalesOrderNoController);
router.get("/:id/available-bales", getAvailableBales);
router.post("/", createSalesOrder);
router.get("/", getAllSalesOrders);
router.get("/:id", getSalesOrderById);
router.put("/:id", updateSalesOrder);
router.delete("/:id", deleteSalesOrder);

export default router;
// routes/salesOrderRoutes.js
import express from "express";
import {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  deleteSalesOrder,
} from "../controllers/salesOrderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createSalesOrder);
router.get("/", getAllSalesOrders);
router.get("/:id", getSalesOrderById);
router.put("/:id", updateSalesOrder);
router.delete("/:id", deleteSalesOrder);

export default router;
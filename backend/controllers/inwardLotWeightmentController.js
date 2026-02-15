// controllers/inwardLotWeightmentController.js
import * as service from "../services/admin1/transaction-cotton/inwardLotWeightmentService.js";

export const saveWeightment = async (req, res) => {
  console.log(req.body.rows);
  try {
    const data = await service.create(req.params.lotNo, req.body);
    res.json({ message: "Weightment saved", data });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getWeightments = async (req, res) => {
  try {
    const data = await service.getAll(req.params.lotNo);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteWeightments = async (req, res) => {
  try {
    await service.remove(req.params.lotNo);
    res.json({ message: "Weightments deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

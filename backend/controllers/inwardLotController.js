// controllers/inwardLotController.js
import * as service from "../services/inwardLotService.js";


export const getNextLotNo = async (req, res) => {
  try {
    const nextNo = await lotEntryService.getNextLotNo();
    res.status(200).json({
      message: "Next lot number generated",
      nextLotNo: nextNo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const createLot = async (req, res) => {
  try {
    const lot = await service.create(req.body);
    res.status(201).json({ message: "Lot created", lot });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getAllLots = async (req, res) => {
  try {
    const lots = await service.getAll();
    res.json(lots);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getLot = async (req, res) => {
  try {
    const lot = await service.getByLotNo(req.params.lotNo);
    res.json(lot);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const updateLot = async (req, res) => {
  try {
    const lot = await service.update(req.params.lotNo, req.body);
    res.json({ message: "Lot updated", lot });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteLot = async (req, res) => {
  try {
    await service.remove(req.params.lotNo);
    res.json({ message: "Lot deleted" });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

// services/issueEntryService.js
import db from "../models/index.js";
import { getNextIssueNo } from "../utils/helpers.js";

const { IssueEntry, IssueEntryBale, InwardLotWeightment } = db;

export const createIssueEntry = async (data) => {
  const issueNo = data.issueNo || (await getNextIssueNo());

  const entry = await IssueEntry.create({
    issueNo,
    issueDate: data.issueDate,
    mixingNo: data.mixingNo,
    mixingGroupId: data.mixingGroupId,
    toMixingGroupId: data.toMixingGroupId,
  });

  const bales = data.bales.map((bale) => ({
    issueEntryId: entry.id,
    lotNo: bale.lotNo,
    baleNo: bale.baleNo,
    baleWeight: bale.baleWeight,
  }));

  await IssueEntryBale.bulkCreate(bales);

  return entry;
};

export const getAllIssues = async () => {
  return await IssueEntry.findAll({
    include: [{ model: IssueEntryBale, as: "bales" }],
    order: [["issueDate", "DESC"]],
  });
};

export const getIssueById = async (id) => {
  const entry = await IssueEntry.findByPk(id, {
    include: [{ model: IssueEntryBale, as: "bales" }],
  });
  if (!entry) throw new Error("Issue entry not found");
  return entry;
};

export const updateIssueEntry = async (id, data) => {
  const entry = await IssueEntry.findByPk(id);
  if (!entry) throw new Error("Issue entry not found");

  await entry.update({
    issueDate: data.issueDate,
    mixingNo: data.mixingNo,
    mixingGroupId: data.mixingGroupId,
    toMixingGroupId: data.toMixingGroupId,
  });

  await IssueEntryBale.destroy({ where: { issueEntryId: id } });

  const bales = data.bales.map((bale) => ({
    issueEntryId: id,
    lotNo: bale.lotNo,
    baleNo: bale.baleNo,
    baleWeight: bale.baleWeight,
  }));
  await IssueEntryBale.bulkCreate(bales);

  return entry;
};

export const deleteIssueEntry = async (id) => {
  const entry = await IssueEntry.findByPk(id);
  if (!entry) throw new Error("Issue entry not found");
  await entry.destroy();
};

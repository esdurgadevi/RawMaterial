import db from "../models/index.js";

const { Issue } = db;

export const create = async (data) => {
  return await Issue.create(data);
};

export const getAll = async () => {
  return await Issue.findAll();
};

export const getById = async (id) => {
  const issue = await Issue.findByPk(id);
  if (!issue) throw new Error("Issue not found");
  return issue;
};

export const update = async (id, data) => {
  const issue = await Issue.findByPk(id);
  if (!issue) throw new Error("Issue not found");
  return await issue.update(data);
};

export const remove = async (id) => {
  const issue = await Issue.findByPk(id);
  if (!issue) throw new Error("Issue not found");
  await issue.destroy();
};
export const getByLotNo = (lotNo) => {
  return Issue.findAll({
    where: { lotNo },
    order: [["issueDate", "DESC"]] // optional but nice
  });
};
import db from "../../../models/index.js";


const {
  sequelize,  
  Issue,
  IssueItem,
  MixingGroup,
  InwardLotWeightment,
} = db;

/* CREATE ISSUE + ITEMS */
export const create = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      issueNumber,
      issueDate,
      mixingNo,
      mixingGroupId,
      toMixingGroupId,
      items,
    } = data;

    if (
      !issueNumber ||
      !issueDate ||
      !mixingNo ||
      !mixingGroupId ||
      !toMixingGroupId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error("Missing required fields");
    }

    const issue = await Issue.create(
      {
        issueNumber,
        issueDate,
        mixingNo,
        mixingGroupId,
        toMixingGroupId,
        issueQty: items.length,
      },
      { transaction }
    );

    for (const item of items) {
      const weightment = await InwardLotWeightment.findByPk(
        item.weightmentId,
        { transaction }
      );

      if (!weightment) {
        throw new Error("Invalid weightmentId");
      }

      if (weightment.isIssued) {
        throw new Error(`Weightment ${item.weightmentId} already issued`);
      }

      await IssueItem.create(
        {
          issueId: issue.id,
          weightmentId: item.weightmentId,
          issueWeight: item.issueWeight,
        },
        { transaction }
      );

      // 🔴 Mark weightment as issued
      await weightment.update(
        { isIssued: true },
        { transaction }
      );
    }

    await transaction.commit();
    return issue;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* GET ALL */
export const getAll = async () => {
  return await Issue.findAll({
    include: [
      {
        model: IssueItem,
        include: [InwardLotWeightment],
      },
      { model: MixingGroup, as: "mixingGroup" },
      { model: MixingGroup, as: "toMixingGroup" },
    ],
    order: [["id", "DESC"]],
  });
};

/* GET BY ID */
export const getById = async (id) => {
  const issue = await Issue.findByPk(id, {
    include: [
      {
        model: IssueItem,
        include: [InwardLotWeightment],
      },
    ],
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  return issue;
};

/* DELETE */
export const remove = async (id) => {
  const issue = await Issue.findByPk(id);
  if (!issue) {
    throw new Error("Issue not found");
  }

  await issue.destroy();
};

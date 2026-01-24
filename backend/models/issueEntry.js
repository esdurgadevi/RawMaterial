import { DataTypes } from "sequelize";

const IssueModel = (sequelize) => {
  const Issue = sequelize.define(
    "Issue",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      issueNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      mixingNo: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      mixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
      },
      toMixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
      },
      lotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_lots",
          key: "id",
        },
      },
    },
    {
      tableName: "issues",
      timestamps: true,
    }
  );

  return Issue;
};

export default IssueModel;

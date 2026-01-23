// models/IssueEntry.js
import { DataTypes } from "sequelize";

const IssueEntryModel = (sequelize) => {
  const IssueEntry = sequelize.define(
    "IssueEntry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issueNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "issue_no",
      },

      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "issue_date",
      },

      mixingNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "mixing_no",
      },

      mixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
        field: "mixing_group_id",
      },

      toMixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
        field: "to_mixing_group_id",
      },
    },
    {
      tableName: "issue_entries",
      timestamps: true,
    }
  );

  return IssueEntry;
};

export default IssueEntryModel;

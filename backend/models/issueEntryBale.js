// models/IssueEntryBale.js
import { DataTypes } from "sequelize";

const IssueEntryBaleModel = (sequelize) => {
  const IssueEntryBale = sequelize.define(
    "IssueEntryBale",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issueEntryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "issue_entries",
          key: "id",
        },
        onDelete: "CASCADE",
        field: "issue_entry_id",
      },

      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "inward_lots",
          key: "lot_no",
        },
        field: "lot_no",
      },

      baleNo: {
        type: DataTypes.STRING(60),
        allowNull: false,
        field: "bale_no",
      },

      baleWeight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        field: "bale_weight",
      },
    },
    {
      tableName: "issue_entry_bales",
      timestamps: true,
      indexes: [{ unique: true, fields: ["issue_entry_id", "bale_no"] }],
    }
  );

  return IssueEntryBale;
};

export default IssueEntryBaleModel;

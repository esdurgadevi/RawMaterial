import { DataTypes } from "sequelize";

const LotEntryModel = (sequelize) => {
  const LotEntry = sequelize.define(
    "LotEntry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "lot_no",
      },
      inwardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_entries",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "inward_id",
      },
      partyDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "party_date",
      },
      billNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "bill_no",
      },
      freight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      billDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "bill_date",
      },
      coolyBale: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "cooly_bale",
      },
      lorryNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "lorry_no",
      },
      taxPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: "tax_percentage",
      },
      taxAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "tax_amount",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      grossWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        field: "gross_weight",
      },
      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "candy_rate",
      },
      tareWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        field: "tare_weight",
      },
      pMark: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "p_mark",
      },
      nettWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        field: "nett_weight",
      },
      pressRunningNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "press_running_no",
      },
      permitNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "permit_no",
      },
      commisType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "commis_type",
      },
      commisValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "commis_value",
      },
    },
    {
      tableName: "lot_entries",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["lot_no"] },
        { fields: ["inward_id"] },
      ],
    }
  );

  return LotEntry;
};

export default LotEntryModel;
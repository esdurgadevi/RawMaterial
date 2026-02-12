// models/InwardLot.js
import { DataTypes } from "sequelize";

const InwardLotModel = (sequelize) => {
  const InwardLot = sequelize.define(
    "InwardLot",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      inwardId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: "inward_entries",
    key: "id",
  },
  onUpdate: "CASCADE",
  onDelete: "RESTRICT",
  field: "inward_id",
},


      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "lot_no",
      },

      setNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "set_no",
      },

      balesQty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "bales_qty",
      },

      cessPaidAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "cess_paid_amount",
      },

      grossWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "gross_weight",
      },

      tareWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "tare_weight",
      },

      nettWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "nett_weight",
      },

      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "candy_rate",
      },

      quintalRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "quintal_rate",
      },

      ratePerKg: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "rate_per_kg",
      },

      invoiceValue: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        field: "invoice_value",
      },
    },
    {
      tableName: "inward_lots",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["lot_no"] },
        { fields: ["inward_id"] },
      ],
    }
  );

  return InwardLot;
};

export default InwardLotModel;

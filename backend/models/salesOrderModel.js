// models/salesOrderModel.js
import { DataTypes } from "sequelize";

const SalesOrderModel = (sequelize) => {
  const SalesOrder = sequelize.define(
    "SalesOrder",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, // Ensures unique order numbers
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      party: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      broker: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      broker1: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      payTerms: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payMode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      creditDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      bank: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      despatchTo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "sales_orders",
      timestamps: true,
    }
  );

  return SalesOrder;
};

export default SalesOrderModel;
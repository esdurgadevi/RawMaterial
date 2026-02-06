// models/salesOrderDetailModel.js
import { DataTypes } from "sequelize";

const SalesOrderDetailModel = (sequelize) => {
  const SalesOrderDetail = sequelize.define(
    "SalesOrderDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sales_orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      packingType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalWt: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      ratePer: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "sales_order_details",
      timestamps: true,
    }
  );

  return SalesOrderDetail;
};

export default SalesOrderDetailModel;
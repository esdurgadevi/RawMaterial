import { DataTypes } from "sequelize";

const LotTestResultModel = (sequelize) => {
  const LotTestResult = sequelize.define(
    "LotTestResult",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // 🔗 Reference Lot
      lotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      permitNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      rd: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      staple: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      plusB: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      moist: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      mr: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      twoPointFive: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      grade: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      ui: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      eLog: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      strength: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      sfi: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      mic: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      ml50: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      strMode: {
        type: DataTypes.ENUM("ICC", "HVI"),
        allowNull: true,
      },

      conStaple: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      sci: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      tableName: "lot_test_results",
      timestamps: true,
    }
  );

  return LotTestResult;
};

export default LotTestResultModel;
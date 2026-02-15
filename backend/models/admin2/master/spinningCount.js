import { DataTypes } from "sequelize";

const SpinningCountModel = (sequelize) => {
  const SpinningCount = sequelize.define(
    "SpinningCount",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      countName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        trim: true,
        field: "count_name",
      },
      actCount: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        field: "act_count",
      },
      noilsPct: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        field: "noils_pct",
        validate: {
          min: 0,
          max: 100,
        },
      },
    },
    {
      tableName: "spinning_counts",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["count_name"] },
      ],
    }
  );

  return SpinningCount;
};

export default SpinningCountModel;
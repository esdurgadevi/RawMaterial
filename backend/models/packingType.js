import { DataTypes } from "sequelize";

const PackingTypeModel = (sequelize) => {
  const PackingType = sequelize.define(
    "PackingType",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
    },
    {
      tableName: "packing_types",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["name"] }, // for faster name-based searches
      ],
    }
  );

  return PackingType;
};

export default PackingTypeModel;
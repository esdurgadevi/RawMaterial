import { DataTypes } from "sequelize";

const WasteEntryDetailModel = (sequelize) => {
  const WasteEntryDetail = sequelize.define(
    "WasteEntryDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wasteEntryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "waste_entries",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: false, // e.g. Carding, Combing, Speed Frame, Spinning, Auto Coner
      },
      wasteType: {
        type: DataTypes.STRING(100),
        allowNull: false, // LICKERIN FLY, FLAT STRIPS, COMBER NOILS, etc.
      },
      packingType: {
        type: DataTypes.STRING(50),
        allowNull: false, // BALEE, etc.
      },
      netWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      godown: {
        type: DataTypes.STRING(50),
        allowNull: false, // AB, CD, etc.
      },
    },
    {
      tableName: "waste_entry_details",
      timestamps: true,
    }
  );

  return WasteEntryDetail;
};

export default WasteEntryDetailModel;
module.exports = (sequelize, DataTypes) => {
  const Drop = sequelize.define("Drop", {
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,

    total_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // available_stock is not derived, it is stored and locked.

    available_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    drop_start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return Drop;
};

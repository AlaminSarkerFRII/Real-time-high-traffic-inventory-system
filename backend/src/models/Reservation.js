module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define("Reservation", {
    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED", "PURCHASED"),
      defaultValue: "ACTIVE",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return Reservation;
};

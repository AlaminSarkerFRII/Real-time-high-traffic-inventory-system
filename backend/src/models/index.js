const { Sequelize, DataTypes } = require("sequelize");
const  sequelize = require("../config/database");

const User = require("./User")(sequelize, Sequelize);
const Drop = require("./Drop")(sequelize, Sequelize);
const Reservation = require("./Reservation")(sequelize, Sequelize);
const Purchase = require("./Purchase")(sequelize, Sequelize);

//----------> Relations

User.hasMany(Reservation);
Reservation.belongsTo(User);

Drop.hasMany(Reservation);
Reservation.belongsTo(Drop);

User.hasMany(Purchase);
Purchase.belongsTo(User);

Drop.hasMany(Purchase);
Purchase.belongsTo(Drop);

module.exports = {
  sequelize,
  User,
  Drop,
  Reservation,
  Purchase,
};

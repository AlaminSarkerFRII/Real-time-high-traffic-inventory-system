const { sequelize, Reservation, Purchase, User, Drop } = require("../models");

async function purchaseReservedItem({ userId, reservationId }, io) {
  try {
    const reservation = await Reservation.findOne({
      where: {
        UserId: userId,
        id: reservationId,
        status: "ACTIVE",
      },
    });

    if (!reservation) {
      throw new Error("Reservation not found or not active");
    }

    const [drop, user] = await Promise.all([
      Drop.findByPk(reservation.DropId),
      User.findByPk(reservation.UserId),
    ]);

    if (!drop) {
      throw new Error("Associated drop not found");
    }

    if (new Date() > reservation.expires_at) {
      await reservation.update({ status: "EXPIRED" });
      await drop.update(
        { available_stock: drop.available_stock + 1 }
      );
      throw new Error("Reservation has expired");
    }

    const purchase = await Purchase.create(
      {
        UserId: userId,
        DropId: reservation.DropId,
      }
    );

    await reservation.update({ status: "PURCHASED" });

    // Log the purchase
    console.log(`Purchase completed: User ${userId} purchased from drop ${drop.id} (${drop.name})`);

    if (io) {
      io.emit("stockUpdate", {
        dropId: reservation.DropId,
        availableStock: drop.available_stock,
      });

      io.emit("newPurchase", {
        dropId: reservation.DropId,
        userId: userId,
        username: user?.username || `User ${userId}`,
        timestamp: new Date(),
      });
    }

    return {
      purchase,
      drop: drop,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  purchaseReservedItem,
};

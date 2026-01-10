const { sequelize, Reservation, Purchase, User, Drop } = require("../models");

async function purchaseReservedItem({ userId, reservationId }, io) {
  try {
    // Find the reservation and ensure it's active and belongs to the user
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

    // Fetch the associated drop and user separately
    const [drop, user] = await Promise.all([
      Drop.findByPk(reservation.DropId),
      User.findByPk(reservation.UserId),
    ]);

    if (!drop) {
      throw new Error("Associated drop not found");
    }

    // Check if reservation has expired
    if (new Date() > reservation.expires_at) {
      // Mark as expired and return stock
      await reservation.update({ status: "EXPIRED" });
      await drop.update(
        { available_stock: drop.available_stock + 1 }
      );
      throw new Error("Reservation has expired");
    }

    // Create the purchase record
    const purchase = await Purchase.create(
      {
        UserId: userId,
        DropId: reservation.DropId,
      }
    );

    // Update reservation status to purchased
    await reservation.update({ status: "PURCHASED" });

    // Stock is already deducted from reservation, no need to change

    console.log(`Purchase completed: User ${userId} purchased from drop ${drop.id} (${drop.name})`);

    // Broadcast stock update (no change, but clients might want to know)
    if (io) {
      io.emit("stockUpdate", {
        dropId: reservation.DropId,
        availableStock: drop.available_stock,
      });

      // Also emit purchase event for activity feed updates
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

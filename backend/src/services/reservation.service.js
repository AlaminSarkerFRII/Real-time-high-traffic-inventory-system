const { sequelize, Drop, Reservation } = require("../models");
const { Op } = require("sequelize");

async function reserveDrop({ userId, dropId }, io) {
  const transaction = await sequelize.transaction();

  try {
    // Lock the drop row
    const drop = await Drop.findOne({
      where: { id: dropId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!drop) {
      throw new Error("Drop not found");
    }

    // Check stock
    if (drop.available_stock <= 0) {
      throw new Error("Out of stock");
    }

    // Decrease stock
    drop.available_stock -= 1;
    await drop.save({ transaction });

    // Create reservation
    const expiresAt = new Date(Date.now() + 60 * 1000);

    const reservation = await Reservation.create(
      {
        UserId: userId,
        DropId: dropId,
        expires_at: expiresAt,
        status: "ACTIVE",
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    console.log(`Reservation created: User ${userId} reserved from drop ${dropId}, stock now: ${drop.available_stock}`);

    // Broadcast stock update to all connected clients
    if (io) {
      io.emit("stockUpdate", {
        dropId: dropId,
        availableStock: drop.available_stock,
      });
    }

    return reservation;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  reserveDrop,
};

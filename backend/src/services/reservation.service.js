const { sequelize, Drop, Reservation } = require("../models");
const { Op } = require("sequelize");

async function reserveDrop({ userId, dropId }, io) {
  const transaction = await sequelize.transaction();

  try {
    // 1 Lock the drop row
    const drop = await Drop.findOne({
      where: { id: dropId },
      lock: transaction.LOCK.UPDATE, // FOR UPDATE
      transaction,
    });

    if (!drop) {
      throw new Error("Drop not found");
    }

    // 2 Check stock
    if (drop.available_stock <= 0) {
      throw new Error("Out of stock");
    }

    // 3 Decrease stock
    drop.available_stock -= 1;
    await drop.save({ transaction });

    // 4 Create reservation
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

    // 5 Commit transaction
    await transaction.commit();

    console.log(`Reservation created: User ${userId} reserved from drop ${dropId}, stock now: ${drop.available_stock}`);

    // 6 Broadcast stock update to all connected clients
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

const { sequelize, Reservation, Drop } = require("../models");
const { Op } = require("sequelize");

let expirationInterval;

async function startExpirationService(io) {
  console.log("Starting reservation expiration service...");

  expirationInterval = setInterval(async () => {
    try {
      await checkAndExpireReservations(io);
    } catch (error) {
      console.error("Error in expiration service:", error);
    }
  }, 10000);
}

async function stopExpirationService() {
  if (expirationInterval) {
    clearInterval(expirationInterval);
    console.log("Reservation Expiration Service stopped");
  }
}

async function checkAndExpireReservations(io) {
  const transaction = await sequelize.transaction();

  try {
    const [expiredReservations] = await sequelize.query(
      'SELECT id, "DropId" FROM "Reservations" WHERE status = \'ACTIVE\' AND expires_at < NOW() FOR UPDATE',
      { transaction }
    );

    if (expiredReservations.length === 0) {
      await transaction.rollback();
      return;
    }

    console.log(`Expiring ${expiredReservations.length} reservations`);

    const dropIds = [...new Set(expiredReservations.map(r => r.DropId))];

    const drops = await Drop.findAll({
      where: { id: dropIds },
      transaction,
    });

    const dropMap = new Map(drops.map(drop => [drop.id, drop]));

    const dropUpdates = new Map();

    for (const reservation of expiredReservations) {
      const dropId = reservation.DropId;
      const drop = dropMap.get(dropId);

      if (!drop) continue;

      if (!dropUpdates.has(dropId)) {
        dropUpdates.set(dropId, {
          drop: drop,
          count: 0,
        });
      }

      dropUpdates.get(dropId).count += 1;

      await sequelize.query(
        'UPDATE "Reservations" SET status = \'EXPIRED\' WHERE id = $1',
        { bind: [reservation.id], transaction }
      );
    }

    for (const [dropId, { drop, count }] of dropUpdates) {
      const newStock = drop.available_stock + count;
      await drop.update({ available_stock: newStock }, { transaction });

      console.log(`Drop ${dropId}: returned ${count} units, new stock: ${newStock}`);

      if (io) {
        io.emit("stockUpdate", {
          dropId: dropId,
          availableStock: newStock,
        });
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  startExpirationService,
  stopExpirationService,
  checkAndExpireReservations,
};

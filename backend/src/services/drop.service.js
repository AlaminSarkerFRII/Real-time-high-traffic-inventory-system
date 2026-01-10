const { sequelize, Drop, Purchase, User } = require("../models");
const { Op } = require("sequelize");

async function createDrop({ name, price, totalStock, dropStartTime }) {
  const transaction = await sequelize.transaction();

  try {
    const drop = await Drop.create(
      {
        name,
        price,
        total_stock: totalStock,
        available_stock: totalStock, // Initially all stock is available
        drop_start_time: dropStartTime || new Date(), // Default to now if not provided
      },
      { transaction }
    );

    await transaction.commit();
    return drop;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getActiveDrops() {
  try {
    const drops = await Drop.findAll({
      where: {
        drop_start_time: {
          [Op.lte]: new Date(), // Drop has started
        },
        available_stock: {
          [Op.gt]: 0, // Has available stock
        },
      },
      include: [
        {
          model: Purchase,
          include: [{ model: User, attributes: ["username"] }],
          limit: 3,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["drop_start_time", "DESC"]],
    });

    // Format the response with activity feed
    const formattedDrops = drops.map((drop) => ({
      id: drop.id,
      name: drop.name,
      price: drop.price,
      availableStock: drop.available_stock,
      totalStock: drop.total_stock,
      dropStartTime: drop.drop_start_time,
      recentPurchases: drop.Purchases.map((purchase) => ({
        username: purchase.User.username,
        timestamp: purchase.createdAt,
      })),
    }));

    return formattedDrops;
  } catch (error) {
    throw error;
  }
}

async function getDropById(dropId) {
  try {
    const drop = await Drop.findByPk(dropId, {
      include: [
        {
          model: Purchase,
          include: [{ model: User, attributes: ["username"] }],
          limit: 3,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!drop) {
      throw new Error("Drop not found");
    }

    return {
      id: drop.id,
      name: drop.name,
      price: drop.price,
      availableStock: drop.available_stock,
      totalStock: drop.total_stock,
      dropStartTime: drop.drop_start_time,
      recentPurchases: drop.Purchases.map((purchase) => ({
        username: purchase.User.username,
        timestamp: purchase.createdAt,
      })),
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createDrop,
  getActiveDrops,
  getDropById,
};

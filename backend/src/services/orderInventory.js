const db = require("../config/db");

const RESERVATION_MINUTES = 15;
const EXPIRATION_BATCH_SIZE = 100;

const releaseOrderInventory = async (connection, orderId) => {
  const [items] = await connection.query(
    `SELECT product_id, SUM(quantity) AS quantity
     FROM order_items
     WHERE order_id=?
     GROUP BY product_id`,
    [orderId],
  );

  for (const item of items) {
    await connection.query(
      "UPDATE products SET stock=stock+? WHERE id=?",
      [item.quantity, item.product_id],
    );
  }
};

const expirePendingOrder = async (connection, orderId) => {
  const [orders] = await connection.query(
    `SELECT status,
            created_at <= DATE_SUB(NOW(), INTERVAL ${RESERVATION_MINUTES} MINUTE) AS expired
     FROM orders
     WHERE id=?
     FOR UPDATE`,
    [orderId],
  );

  if (!orders.length || orders[0].status !== "PENDING" || !orders[0].expired) {
    return false;
  }

  const [result] = await connection.query(
    "UPDATE orders SET status='EXPIRED' WHERE id=? AND status='PENDING'",
    [orderId],
  );
  if (result.affectedRows === 1) {
    await releaseOrderInventory(connection, orderId);
    return true;
  }
  return false;
};

const expirePendingOrders = async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    let expiredCount = 0;
    let batch;

    do {
      [batch] = await connection.query(
        `SELECT id
         FROM orders
         WHERE status='PENDING'
           AND created_at <= DATE_SUB(NOW(), INTERVAL ${RESERVATION_MINUTES} MINUTE)
         ORDER BY id
         LIMIT ${EXPIRATION_BATCH_SIZE}
         FOR UPDATE`,
      );

      for (const order of batch) {
        const [result] = await connection.query(
          "UPDATE orders SET status='EXPIRED' WHERE id=? AND status='PENDING'",
          [order.id],
        );
        if (result.affectedRows === 1) {
          await releaseOrderInventory(connection, order.id);
          expiredCount += 1;
        }
      }
    } while (batch.length === EXPIRATION_BATCH_SIZE);

    await connection.commit();
    return expiredCount;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  RESERVATION_MINUTES,
  expirePendingOrder,
  expirePendingOrders,
  releaseOrderInventory,
};

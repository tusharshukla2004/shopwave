const db = require("../config/db");

// Products
const getSellerProducts = async (req, res) => {

  const [products] = await db.query(
    `
    SELECT *
    FROM products
    WHERE seller_id=?
    `,
    [req.params.sellerId]
  );

  res.status(200).json({
    success:true,
    products
  });
};

const getSellerOrders = async (req, res) => {

  const [orders] = await db.query(
    `
    SELECT
    o.id,
    o.total_amount,
    o.status

    FROM orders o

    JOIN order_items oi
    ON o.id=oi.order_id

    JOIN products p
    ON oi.product_id=p.id

    WHERE p.seller_id=?
    `,
    [req.params.sellerId]
  );

  res.status(200).json({
    success:true,
    orders
  });
};

const getRevenue = async (req, res) => {

  const [revenue] = await db.query(
    `
    SELECT
    SUM(oi.price*oi.quantity)
    AS totalRevenue

    FROM order_items oi

    JOIN products p
    ON oi.product_id=p.id

    WHERE p.seller_id=?
    `,
    [req.params.sellerId]
  );

  res.status(200).json({
    success:true,
    revenue
  });
};

const getInventory = async (req, res) => {

  const [inventory] = await db.query(
    `
    SELECT
    name,
    stock

    FROM products

    WHERE seller_id=?
    `,
    [req.params.sellerId]
  );

  res.status(200).json({
    success:true,
    inventory
  });
};

module.exports = {
  getSellerProducts,
  getSellerOrders,
  getRevenue,
  getInventory
};


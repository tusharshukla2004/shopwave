const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

const sellerEmail = "demo-seller@shopwave.local";
const products = [
  {
    legacyName: "Demo Wireless Noise-Cancelling Headphones",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and immersive sound.",
    price: 8999,
    stock: 12,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Pro Smartphone",
    name: "Pro Smartphone",
    description: "Feature-rich smartphone with a vivid display, advanced camera, and all-day battery.",
    price: 54999,
    stock: 8,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511709268805-8631b60f232f?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Ultrabook Laptop",
    name: "Ultrabook Laptop",
    description: "Slim, lightweight laptop designed for work, study, and everyday multitasking.",
    price: 72999,
    stock: 5,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Smart Watch",
    name: "Smart Watch",
    description: "Smart watch with activity tracking, notifications, and a bright everyday display.",
    price: 12999,
    stock: 10,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Everyday Cotton T-Shirt",
    name: "Everyday Cotton T-Shirt",
    description: "Soft cotton T-shirt with a versatile fit for comfortable everyday wear.",
    price: 799,
    stock: 30,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Classic Sneakers",
    name: "Classic Sneakers",
    description: "Classic low-profile sneakers with a cushioned sole for daily use.",
    price: 3499,
    stock: 16,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Canvas Travel Backpack",
    name: "Canvas Travel Backpack",
    description: "Durable canvas backpack with practical storage for commuting and short trips.",
    price: 2199,
    stock: 14,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Minimalist Wrist Watch",
    name: "Minimalist Wrist Watch",
    description: "Minimalist wrist watch with a clean dial and a comfortable everyday strap.",
    price: 2799,
    stock: 9,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Modern Table Lamp",
    name: "Modern Table Lamp",
    description: "Modern table lamp that adds warm, focused lighting to a desk or bedside table.",
    price: 1899,
    stock: 11,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Lounge Accent Chair",
    name: "Lounge Accent Chair",
    description: "Comfortable accent chair with a contemporary silhouette for living spaces.",
    price: 18499,
    stock: 4,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Indoor Potted Plant",
    name: "Indoor Potted Plant",
    description: "Decorative indoor potted plant to bring a natural touch to your home.",
    price: 649,
    stock: 20,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
  },
  {
    legacyName: "Demo Ceramic Tableware Set",
    name: "Ceramic Tableware Set",
    description: "Ceramic tableware set for everyday meals and relaxed dining.",
    price: 2499,
    stock: 7,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80",
  },
];

const seedCatalog = async () => {
  const connection = await db.getConnection();
  let createdSellerPassword;

  try {
    await connection.beginTransaction();

    const [columns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA=DATABASE()
         AND TABLE_NAME='products'
         AND COLUMN_NAME='is_demo'`,
    );
    if (!columns.length) {
      await connection.query(
        "ALTER TABLE products ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT FALSE AFTER stock",
      );
    }
    const [shippingAddressColumns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA=DATABASE()
         AND TABLE_NAME='orders'
         AND COLUMN_NAME='shipping_address'`,
    );
    if (!shippingAddressColumns.length) {
      await connection.query(
        "ALTER TABLE orders ADD COLUMN shipping_address JSON NULL AFTER total_amount",
      );
    }

    const [users] = await connection.query(
      "SELECT id, role FROM users WHERE email=? FOR UPDATE",
      [sellerEmail],
    );
    let sellerId;
    if (users.length) {
      if (users[0].role !== "SELLER") {
        throw new Error(`${sellerEmail} already exists but is not a seller`);
      }
      sellerId = users[0].id;
      await connection.query(
        "UPDATE users SET name=? WHERE id=?",
        ["ShopWave Store", sellerId],
      );
    } else {
      createdSellerPassword = crypto.randomBytes(24).toString("hex");
      const passwordHash = await bcrypt.hash(createdSellerPassword, 12);
      const [seller] = await connection.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'SELLER')",
        ["ShopWave Store", sellerEmail, passwordHash],
      );
      sellerId = seller.insertId;
    }

    const categoryIds = new Map();
    for (const categoryName of new Set(products.map((product) => product.category))) {
      const [categories] = await connection.query(
        "SELECT id FROM categories WHERE name=? FOR UPDATE",
        [categoryName],
      );
      if (categories.length) {
        categoryIds.set(categoryName, categories[0].id);
      } else {
        const [category] = await connection.query(
          "INSERT INTO categories (name) VALUES (?)",
          [categoryName],
        );
        categoryIds.set(categoryName, category.insertId);
      }
    }

    let insertedCount = 0;
    let convertedCount = 0;
    for (const product of products) {
      const [existing] = await connection.query(
        `SELECT id, is_demo
         FROM products
         WHERE seller_id=? AND name IN (?, ?)
         ORDER BY is_demo DESC
         LIMIT 1
         FOR UPDATE`,
        [sellerId, product.legacyName, product.name],
      );
      if (existing.length) {
        if (existing[0].is_demo) {
          await connection.query(
            `UPDATE products
             SET name=?, description=?, price=?, stock=?, is_demo=FALSE,
                 image=?, category_id=?
             WHERE id=? AND is_demo=TRUE`,
            [
              product.name,
              product.description,
              product.price,
              product.stock,
              product.image,
              categoryIds.get(product.category),
              existing[0].id,
            ],
          );
          convertedCount += 1;
        }
        continue;
      }

      await connection.query(
        `INSERT INTO products
         (name, description, price, stock, is_demo, image, category_id, seller_id)
         VALUES (?, ?, ?, ?, FALSE, ?, ?, ?)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.image,
          categoryIds.get(product.category),
          sellerId,
        ],
      );
      insertedCount += 1;
    }

    await connection.commit();
    console.info(
      `Live catalog ready: ${insertedCount} added, ${convertedCount} converted; seller ${sellerEmail}.`,
    );
    if (createdSellerPassword) {
      console.info(`One-time demo seller password: ${createdSellerPassword}`);
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await db.end();
  }
};

seedCatalog().catch((error) => {
  console.error("Failed to seed demo catalog:", error.message);
  process.exitCode = 1;
});

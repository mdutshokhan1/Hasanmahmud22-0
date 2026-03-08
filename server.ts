import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("business.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS menu_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    href TEXT NOT NULL
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (title, price, image) VALUES (?, ?, ?)");
  insertProduct.run("Premium Wireless Headphones", 199.99, "https://picsum.photos/seed/headphones/400/400");
  insertProduct.run("Minimalist Smart Watch", 149.50, "https://picsum.photos/seed/watch/400/400");
  insertProduct.run("Ergonomic Desk Chair", 299.00, "https://picsum.photos/seed/chair/400/400");
}

const menuCount = db.prepare("SELECT COUNT(*) as count FROM menu_links").get() as { count: number };
if (menuCount.count === 0) {
  const insertMenu = db.prepare("INSERT INTO menu_links (label, href) VALUES (?, ?)");
  insertMenu.run("Home", "#");
  insertMenu.run("Products", "#products");
  insertMenu.run("About", "#about");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { title, price, image } = req.body;
    const result = db.prepare("INSERT INTO products (title, price, image) VALUES (?, ?, ?)").run(title, price, image);
    res.json({ id: result.lastInsertRowid, title, price, image });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/menu", (req, res) => {
    const links = db.prepare("SELECT * FROM menu_links").all();
    res.json(links);
  });

  app.post("/api/menu", (req, res) => {
    const { label, href } = req.body;
    const result = db.prepare("INSERT INTO menu_links (label, href) VALUES (?, ?)").run(label, href);
    res.json({ id: result.lastInsertRowid, label, href });
  });

  app.delete("/api/menu/:id", (req, res) => {
    db.prepare("DELETE FROM menu_links WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

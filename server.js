import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import db from "./database.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import session from "express-session";

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: ["https://example-frontend-github-io.onrender.com"] }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
}));

const PORT = 5000;
const saltRounds = 10;
const secret = process.env.SECRET;

// User registration
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const role = "User";
  
  try {
    const [checkResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (checkResult.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hash = await bcrypt.hash(password, saltRounds);
    const userdata = { email, password: hash, role };
    await db.query("INSERT INTO users SET ?", [userdata]);
    
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    res.status(201).json({ user: user[0], message: "User registered successfully" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [result] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (result.length > 0) {
      const user = result[0];
      
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        const token = jwt.sign({ email: user.email }, secret, { expiresIn: "1h" });
        res.status(200).json({ user, message: "User logged in successfully", token });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
      
    } else {
      res.status(404).json({ message: "User not found" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User logout
app.get("/api/logout", (req, res) => {
  // Clear the session or token as per your implementation
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json({ message: "User logged out successfully" });
  });
});

// Fetch products
app.get("/api/products", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM products");
    res.status(200).json({ result, status: "ok", message: "Products fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch product by ID
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    
    if (result.length > 0) {
      res.status(200).json({ result, status: "ok", message: "Product fetched successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Role Admin only - Fetch users
app.get("/api/users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const authToken = authHeader.split(" ")[1];
    const user = jwt.verify(authToken, secret);
    
    const [recheck] = await db.query("SELECT * FROM users WHERE email = ?", [user.email]);
    
    if (recheck.length > 0 && recheck[0].role === "Admin") {
      const [result] = await db.query("SELECT * FROM users");
      res.status(200).json({ result, status: "ok", message: "Users fetched successfully" });
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new product (Admin only)
app.post("/api/products", async (req, res) => {
  const { name, price, description, image, category } = req.body;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const authToken = authHeader.split(" ")[1];
    const user = jwt.verify(authToken, secret);
    
    const [recheck] = await db.query("SELECT * FROM users WHERE email = ?", [user.email]);
    if (recheck.length > 0 && recheck[0].role === "Admin") {
      const productdata = { name, price, description, image, category };
      await db.query("INSERT INTO products SET ?", [productdata]);
      res.status(201).json({ status: "ok", message: "Product added successfully" });
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", err });
  }
});

// Update product by ID
app.post("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, category } = req.body;

  try {
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    
    if (product.length > 0) {
      const productdata = {
        name: name || product[0].name,
        price: price || product[0].price,
        description: description || product[0].description,
        image: image || product[0].image,
        category: category || product[0].category,
      };
      await db.query("UPDATE products SET ? WHERE id = ?", [productdata, id]);
      res.status(200).json({ status: "ok", message: "Product updated successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete product by ID
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

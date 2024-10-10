import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import env from "dotenv";
import bcrypt from "bcrypt";
import db from "./database.js";
import jwt from "jsonwebtoken";
import passport, { use } from "passport";
import passportJWT from "passport-jwt";
import session from "express-session";
import cookieParser from "cookie-parser";

env.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["https://example-frontend-github-io.onrender.com"],
  })
);
import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ["https://example-frontend-github-io.onrender.com"],
}));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const PORT = 5000;
const saltRounds = 10;
const secret = process.env.SECRET;
//User Roles
app.post("/api/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const role = "User";
  try {
    const [checkResult] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (checkResult.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const hash = await bcrypt.hash(password, saltRounds);
      const userdata = { email: email, password: hash, role: role };
      const [result] = await db.query("INSERT INTO users SET ?", [userdata]);
      console.log("result", result);
      const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      console.log("user", user);
      res
        .status(201)
        .json({ user: user[0], message: "User registered successfully" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/", async (req, res) => {
  res.render("login.ejs");
});
app.get("/register", async (req, res) => {
  res.render("register.ejs");
});
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const response = await axios.post("https://storeapi-nodejs.onrender.com/api/login", {
      email: email,
      password: password,
    });
    console.log(response.data);
    res.render("index.ejs");
  } catch (err) {
    console.log(err);
    res.render("login.ejs");
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.post("/api/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const [result] = await db.query("SELECT * FROM users WHERE email = ? ", [
      email,
    ]);
    if (result.length > 0) {
      const user = result[0];
      const storedHashedPassword = user.password;
      bcrypt.compare(password, storedHashedPassword, (err, valid) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).json({ message: "Error comparing passwords:" });
        } else {
          if (valid) {
            const token = jwt.sign({ email: user.email }, secret, {
              expiresIn: "1h",
            });
            console.log("token: ", token);
            console.log("user: ", user);
            // res.cookie("token", token, {
            //   maxAge: 300000,
            //   secure: true,
            //   httpOnly: true,
            //   sameSite: "none",
            // });
              console.log("token: ",token);
                  console.log("user: ",user);
            res.status(200).json({
              user: user,
              message: "User logged in successfully",
              token: token,
            });
          } else {
            res.json({ message: "Invalid password" });
          }
        }
      });
    } else {
      res.status(404).json({ message: "User not found", status: "error" });

      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/logout", (req, res) => {
  try {
    localStorage.removeItem("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
  res.json({ message: "User logged out successfully" });
});
app.get("/api/products", (req, res) => {
  try {
    const result = db.query("SELECT * FROM products");
    res.status(200).json({
      result: result,
      status: "ok",
      message: "Products fetched successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  try {
    const [result] = db.query("SELECT * FROM products WHERE id = ?", [id]);
    if (result.length > 0) {
      res.status(200).json({
        result: result,
        status: "ok",
        message: "Product fetched successfully",
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/orders", (req, res) => {});
app.post("/api/orders", (req, res) => {});
app.post("/api/orders/:id", (req, res) => {});
app.delete("/api/orders/:id", (req, res) => {});

//Role Admin only
app.get("/api/users", async (req, res) => {
  try {
    const authHeder = req.headers.authorization;
    let authToken = "";
    if (authHeder) {
      authToken = authHeder.split(" ")[1];
    }

    console.log("authToken", authToken);
    const user = jwt.verify(authToken, secret);
    console.log("decodedToken", user);
    const [recheck] = await db.query("SELECT * FROM users WHERE email = ?", [
      user.email,
    ]);
    console.log("recheck: ", recheck);
    if (recheck.length > 0) {
      if (recheck[0].role === "Admin") {
        const result = await db.query("SELECT * FROM users");
        console.log("result: ", result);
    console.log("recheck: ",recheck);
    if (recheck.length > 0) {
      if (recheck[0].role === "Admin") {
        const [result] = await db.query("SELECT * FROM users");
          console.log("result: ",result)
        res.status(200).json({
          result: result,
          status: "ok",
          message: "Users fetched successfully",
        });
      } else {
        res.status(401).json({ message: "Unauthorized access" });
      }
    } else {
      res.status(401).json({ message: "Not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/products", (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.body.image;
  const category = req.body.category;
  try {
    const authHeder = req.headers.authorization;
    let authToken = "";
    if (authHeder) {
      authToken = authHeder.split(" ")[1];
    }
    console.log("authToken", authToken);
    const user = jwt.verify(authToken, secret);
    console.log("decodedToken", user);
    const [recheck] = db.query("SELECT * FROM users WHERE email = ?", [user.email]);
    if(recheck.length > 0){
      const productdata = {
        name: name,
        price: price,
        description: description,
        image: image,
        category: category,
      };
      const [result] = db.query("INSERT INTO products SET ?", [productdata]);
      res.status(201).json({
        result: result,
        status: "ok",
        message: "Product added successfully",
      });
    }else{
      res.status(401).json({ message: "Unauthorized access  " });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/products/:id", async (req, res) => {
  let id = req.params.id;
  let name = req.body.name;
  let price = req.body.price;
  let description = req.body.description;
  let image = req.body.image;
  let category = req.body.category;
  try {
    const product = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    if (product.length > 0) {
      if (name) product.name = name;
      if (price) product.price = price;
      if (description) product.description = description;
      if (image) product.image = image;
      if (category) product.category = category;
      const productdata = {
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        category: product.category,
      };
      const result = db.query("UPDATE products SET ? WHERE id = ?", [
        productdata,
        id,
      ]);
      res.status(200).json({
        result: result,
        status: "ok",
        message: "Product updated successfully",
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.delete("/api/products/:id", (req, res) => {});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

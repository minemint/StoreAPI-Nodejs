import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import env from "dotenv";
import bcrypt from "bcrypt";
import db from "./database.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import passportJWT from "passport-jwt";
import session from "express-session";
import cookieParser from "cookie-parser";

env.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
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
            // res.cookie("token", token, {
            //   maxAge: 300000,
            //   secure: true,
            //   httpOnly: true,
            //   sameSite: "none",
            // });
            res.status(200).json({
              email: user.email,
              message: "User logged in successfully",
              token: token,
            });
          } else {
            res.json({ message: "Invalid password" });
          }
        }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
    if (recheck.length > 0) {
      if (recheck[0].role === "Admin") {
        const [result] = await db.query("SELECT * FROM users");
        res.status(200).json({
          result: result,
          status: "ok",
          message: "Users fetched successfully",
        });
      } else {
        res.status(401).json({ message: "Unauthorized access" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

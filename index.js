import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

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
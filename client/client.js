const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");

let indexRoute = require("./routes/index");
let apiRoute = require("./routes/api");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); //precision du module qu'on va utiliser
app.use(express.static(path.join(__dirname, "public"))); //precision des module static
//page index
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use("/", indexRoute);
app.use("/api", apiRoute);

module.exports = app;

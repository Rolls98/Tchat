const express = require("express");
const app = express();
const server = app.listen(8002);
const io = require("socket.io").listen(server);
const path = require("path");
const cors = require("cors");
const contr = require("./controllers/client");
const session = require("express-session");
const flash = require("connect-flash");
let axios = require("axios");

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

app.use((req, res, next) => {
  if (!req.session.Client) {
    req.session.Client = {};
  }

  next();
});
app.use(flash());

app.get("/", (req, res) => {
  res.render("portal");
});

app.get("/inscription", (req, res) => {
  res.render("inscription");
});

app.get("/connexion", (req, res) => {
  if (req.session.Client.connexion) {
    res.redirect("index");
  } else {
    res.render("connexion");
  }
});

app.get("/index", (req, res) => {
  if (req.session.Client.connexion) {
    res.render("index", { infos: req.session.Client.client });
  } else {
    res.redirect("/connexion");
  }
});

app.get("/disconnect", (req, res) => {
  delete req.session["Client"];
  res.redirect("/connexion");
});

app.post("/connexion", contr.Connexion);

io.listen(server);

let me = null;

io.sockets.on("connection", async (socket) => {
  let users = await axios.get("http://localhost:8001/members");
  let clients = [];

  let messages = [];

  for (user of users.data) {
    clients.push({
      login: user.login,
      last: user.lastConnexion,
      connect: user.connect,
      id: user._id,
      messages: user.messages,
    });
  }

  socket.on("nvClient", async (login) => {
    console.log(login + " connecté");
    me = login;
    let result = await axios.post("http://localhost:8001/nvClient", { login });
    if (result) {
      clients.forEach((c) => {
        if (c.login == login) {
          c.connect = true;
        }
      });
      console.log("Connectes : ", clients);
      socket.emit("allUsers", clients);
      socket.broadcast.emit("allUsers", clients);
    }
  });
  // socket.emit("allUsers", clients);
  socket.emit("allMessage", messages);
  socket.on("nv_msg", async (msg) => {
    let result = await axios.post("http://localhost:8001/insertMessage", msg);
    if (result) {
      socket.emit("nv_msg", msg);
      socket.broadcast.emit("nv_msg", msg);
    }
  });

  socket.on("deconnexion", async () => {
    console.log(me, " deconnecte");
    if (me != null) {
      let result = await axios.post("http://localhost:8001/c_disc", {
        login: me,
      });
      if (result) {
        clients.forEach((c) => {
          if (c.login == me) {
            c.connect = false;
          }
        });
        console.log("deconnexion ", clients);
        me = null;
        socket.emit("allUsers", clients);
        socket.broadcast.emit("allUsers", clients);
      }
    }
  });
  socket.on("disconnect", async (reason) => {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }

    if (me != null) {
      let result = await axios.post("http://localhost:8001/c_disc", {
        login: me,
      });
      if (result) {
        clients.forEach((c) => {
          if (c.login == me) {
            c.connect = false;
          }
        });

        socket.emit("allUsers", clients);
        socket.broadcast.emit("allUsers", clients);
      }
      // else the socket will automatically try to reconnect
    }
    me = null;
  });
});

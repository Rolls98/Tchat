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
  let clients = await contr.Users();

  let messages = [];

  socket.on("nvClient", async (login) => {
    console.log(login + " connecté");
    me = login;
    let result = await axios.post("http://localhost:8001/nvClient", { login });
    if (result.data.success) {
      clients = await contr.Users();
      clients.forEach((c) => {
        if (c.login == login) {
          c.connect = true;
        }
      });
      socket.emit("allUsers", clients);
      socket.broadcast.emit("allUsers", clients);
    }
  });

  socket.on("write", (client) => {
    socket.broadcast.emit("write", client);
  });
  socket.on("nowrite", (client) => {
    socket.broadcast.emit("nowrite", client);
  });
  // socket.emit("allUsers", clients);
  socket.emit("allMessage", messages);
  socket.on("nv_msg", async (msg) => {
    let result = await axios.post("http://localhost:8001/insertMessage", msg);
    if (result.data.success) {
      clients = await contr.Users();
      socket.emit("allUsers", clients);
      socket.broadcast.emit("allUsers", clients);
      socket.emit("nv_msg", msg);
      socket.broadcast.emit("nv_msg", msg);
    }
  });

  socket.on("updateMessage", async (info) => {
    let result = await axios.post("http://localhost:8001/updateMessage", {
      info,
    });

    if (result.data.success) {
      clients = await contr.Users();
      socket.emit("allUsers", clients);
      socket.broadcast.emit("allUsers", clients);
    }
  });

  socket.on("deconnexion", async () => {
    console.log(me, " deconnecte");

    if (me != null) {
      let result = await axios.post("http://localhost:8001/c_disc", {
        login: me,
        last: new Date(),
      });
      if (result.data.success) {
        clients = await contr.Users();
        clients.forEach((c) => {
          if (c.login == me) {
            c.connect = false;
          }
        });
        me = null;
        socket.emit("allUsers", clients);
        socket.broadcast.emit("allUsers", clients);
      }
    }
  });

  /**
   *
   *
   */

  socket.on("disconnect", (reason) => {
    console.log("la raison de la deconnexion ", reason);
  });
  /*socket.on("disconnect", async (reason) => {
    clients = await contr.Users();
    if (me != null) {
      let result = await axios.post("http://localhost:8001/c_disc", {
        login: me,
        last: new Date(),
      });
      if (result.data.success) {
        clients = await contr.Users();
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
  });*/
});

process.on("SIGINT", async () => {
  console.log("Server will stoped on few second");
  let clients = await contr.Users();
  let finRes = [];
  clients.forEach(async (c) => {
    console.log(c);
    let result = await axios.post("http://localhost:8001/c_disc", {
      login: c,
      last: new Date(),
    });
    console.log(result);
    finRes.push(result);
  });
  console.log(finRes);
  if (finRes.length == clients.length) {
    console.log(finRes);
    process.exit();
  }
});

const app = require("../client");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const contr = require("../controllers/client");
let axios = require("axios");
const config = require("../config/config.json");

server.listen(config.server.port, () => {
  console.log("Server started on ", config.server.port);
});

let me = null;

io.on("connection", async (socket) => {
  console.log("socket connected");
  let clients = await contr.Users();

  let messages = [];

  socket.on("ok", () => {
    socket.emit("allUsers", clients);
    socket.broadcast.emit("allUsers", clients);
  });

  socket.emit("connex", "bonjour");

  socket.on("nvClient", async (login) => {
    console.log(login + " connecté");
    me = login;
    let result = await axios.post(
      config.server.host + ":" + config.server.port + "/api/nvClient",
      { login }
    );
    console.log("result ", result.data);
    if (result.data.success) {
      clients = await contr.Users();
      console.log("reponse récu");
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
    let result = await axios.post(
      config.server.host + ":" + config.server.port + "/api/insertMessage",
      msg
    );
    if (result.data.success) {
      clients = await contr.Users();
      socket.emit("allUsers", clients);
      socket.broadcast.emit("allUsers", clients);
      socket.emit("nv_msg", msg);
      socket.broadcast.emit("nv_msg", msg);
    }
  });

  socket.on("updateMessage", async (info) => {
    let result = await axios.post(
      config.server.host + ":" + config.server.port + "/api/updateMessage",
      {
        info,
      }
    );

    if (result.data.success) {
      clients = await contr.Users();
      socket.emit("allUsers", clients);
      socket.broadcast.emit("allUsers", clients);
    }
  });

  socket.on("deconnexion", async () => {
    console.log(me, " deconnecte");

    if (me != null) {
      let result = await axios.post(
        config.server.host + ":" + config.server.port + "/api/c_disc",
        {
          login: me,
          last: new Date(),
        }
      );
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
      let result = await axios.post(config.server.host + ":" + config.server.port+"/c_disc", {
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

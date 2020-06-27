const express = require("express");
const app = express();

const cors = require("cors");
const { verifie } = require("./fonctions/func.js");
const mongoose = require("mongoose");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

(async () => {
  await mongoose.connect("mongodb://localhost/chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
})();

let db = mongoose.connection;

db.on("error", () => {
  console.error("Error à la bd");
});

db.once("open", () => {
  let clientSchema = mongoose.Schema({
    login: String,
    sexe: String,
    password: String,
    created: { type: Date, default: new Date() },
    connect: { type: Boolean, default: false },
    lastConnexion: { type: Date, default: new Date() },
    messages: { type: Array, default: [] },
  });

  let Client = mongoose.model("Client", clientSchema);

  app.post("/inscription", (req, res) => {
    let infos = req.body;
    let r = verifie(infos);
    if (r.success) {
      let client = new Client(infos);

      client.save((err, r) => {
        if (err) return console.log("Error lors de l'inscription");
        console.log(r);
        res.json({ inscription: true });
      });
    } else {
      res.json({ inscription: false });
    }
  });

  app.get("/members", (req, res) => {
    Client.find((err, r) => {
      if (err) return console.log(err);
      res.json(r);
    });
  });

  app.post("/nvClient", async (req, res) => {
    let info = req.body;
    console.log("infonv : ", info.login);
    let r = await Client.updateOne({ login: info.login }, { connect: true });
    if (r.nModified == 1 && r.n == 1) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });

  app.post("/c_disc", async (req, res) => {
    let info = req.body;
    console.log("infodisc : ", info.login);
    let r = await Client.updateOne({ login: info.login }, { connect: false });
    if (r.nModified == 1 && r.n == 1) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });

  app.post("/connexion", (req, res) => {
    let info = req.body;

    Client.find({ login: info.login }, (err, result) => {
      if (err) return console.log("Error lors de l'inscription");

      if (result.length > 0) {
        if (result[0].password == info.password) {
          res.json({
            connexion: true,
            client: {
              id: result[0]._id,
              login: result[0].login,
              lastConnexion: result[0].lastConnexion,
            },
          });
        } else {
          res.json({ connexion: false, message: "Mot de passe incorrect" });
        }
      } else {
        res.json({ connexion: false, message: "User non trouvé" });
      }
    });
  });

  app.post("/insertMessage", async (req, response) => {
    let msg = req.body;
    let msgEnv = await Client.findOne({ _id: msg.env });
    let msgDest = await Client.findOne({ _id: msg.dest });
    msgEnv.messages.push(msg);
    [msg.env, msg.dest] = [msg.dest, msg.env];
    msgDest.messages.push(msg);

    Client.updateOne(
      { _id: msgEnv._id },
      { messages: msgEnv.messages },
      (err, res) => {
        if (err) return console.log("Error ", err);

        if (res) {
          console.log(res);
          Client.updateOne(
            { _id: msgDest._id },
            { messages: msgDest.messages },
            (err, r) => {
              if (err) return console.log("Error ", err);

              if (r) {
                response.json({ success: true });
              }
            }
          );
        }
      }
    );
  });
});

app.listen(8001, () => {
  console.log("Server Started");
});

const express = require("express");
const { verifie } = require("../../server/fonctions/func.js");

const Client = require("../db/mongoose");
const router = express.Router();

router
  .post("/inscription", (req, res) => {
    let infos = req.body;
    let r = verifie(infos);
    if (r.success) {
      let client = new Client(infos);

      client.save((err, r) => {
        if (err) return console.log("Error lors de l'inscription");

        res.json({ inscription: true });
      });
    } else {
      res.json({ inscription: false });
    }
  })

  .get("/members", (req, res) => {
    Client.find((err, r) => {
      if (err) return console.log(err);
      if (r.length > 0) {
        res.json({ success: true, results: r });
      } else {
        res.json({ success: false });
      }
    });
  })

  .post("/nvClient", async (req, res) => {
    let info = req.body;
    let r = await Client.updateOne({ login: info.login }, { connect: true });
    if (r.ok == 1 && r.n == 1) {
      console.log("reponse envoyé");
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  })

  .post("/c_disc", async (req, res) => {
    let info = req.body;
    console.log("infodisc : ", info.login);
    let r = await Client.updateOne(
      { login: info.login },
      { connect: false, lastConnexion: info.last }
    );
    if (r.nModified == 1 && r.n == 1) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  })

  .post("/connexion", (req, res) => {
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
  })

  .post("/updateMessage", async (req, res) => {
    let data = req.body;
    Client.updateOne(
      { login: data.info.login },
      { messages: data.info.messages },
      (err, raw) => {
        if (err) return console.log("Error update Message ", err);
        if (raw) {
          res.json({ success: true });
        } else {
          res.json({ success: false });
        }
      }
    );
  })

  .post("/insertMessage", async (req, response) => {
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

module.exports = router;

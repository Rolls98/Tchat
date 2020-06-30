let express = require("express");
const contr = require("../controllers/client");
let router = express.Router();

router.use((req, res, next) => {
  if (!req.session.Client) {
    req.session.Client = {};
  }

  next();
});

router
  .get("/", (req, res) => {
    res.render("portal");
  })

  .get("/inscription", (req, res) => {
    res.render("inscription");
  })

  .get("/connexion", (req, res) => {
    if (req.session.Client.connexion) {
      res.redirect("index");
    } else {
      res.render("connexion");
    }
  })

  .get("/index", (req, res) => {
    if (req.session.Client.connexion) {
      res.render("index", { infos: req.session.Client.client });
    } else {
      res.redirect("/connexion");
    }
  })

  .get("/disconnect", (req, res) => {
    delete req.session["Client"];
    res.redirect("/connexion");
  })

  .post("/connexion", contr.Connexion);

module.exports = router;

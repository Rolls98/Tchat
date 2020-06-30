let axios = require("axios");
let config = require("../config/config.json");

exports.Connexion = (req, res) => {
  if (req.body != undefined) {
    axios
      .post(
        config.server.host + ":" + config.server.port + "/api/connexion",
        req.body
      )
      .then((result) => {
        console.log("bon");
        if (result.data.connexion) {
          let client = result.data.client;
          req.session.Client = {
            connexion: true,
            client: {
              id: client.id,
              login: client.login,
            },
          };
          res.redirect("/index");
        } else {
          res.json(result.data);
        }
      })
      .catch((err) => {
        console.log("Error ", err);
      });
  }
};

exports.Users = async () => {
  let users = await axios.get(
    config.server.host + ":" + config.server.port + "/api/members"
  );
  let clients = [];
  if (users.data.success) {
    for (user of users.data.results) {
      clients.push({
        login: user.login,
        last: user.lastConnexion,
        connect: user.connect,
        id: user._id,
        messages: user.messages,
      });
    }
    return clients;
  }
};

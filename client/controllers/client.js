let axios = require("axios");

exports.Connexion = (req, res, next) => {
  if (req.body != undefined) {
    console.log("excute");

    axios
      .post("http://localhost:8001/connexion", req.body)
      .then((result) => {
        console.log(result.data);
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

exports.midle = (req, res, next) => {
  if (!req.session.Client) {
    req.session.Client = {};
  }

  next();
};

exports.Users = async () => {
  let users = await axios.get("http://localhost:8001/members");
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
    return new Promise((resolve, reject) => {
      if (clients.length > 0) {
        resolve(clients);
      } else {
        reject({ success: false });
      }
    });
  }
};

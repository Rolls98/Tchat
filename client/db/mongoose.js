const mongoose = require("mongoose");
const config = require("../config/config.json");

mongoose.connect(config.db.host, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("open", () => {
  console.log("Mongodb connected");
});

let clientSchema = mongoose.Schema({
  login: String,
  sexe: String,
  password: String,
  created: { type: Date, default: new Date() },
  connect: { type: Boolean, default: false },
  lastConnexion: { type: Date, default: new Date() },
  messages: { type: Array, default: [] },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;

exports.verifie = function (body) {
  let result = {
    success: true,
  };

  if (body.login == "") {
    result.success = false;
    result.message.login = "Le login ne doit pas etre vide";
  }

  if (body.password == "" || body.password.length < 8) {
    result.success = false;
    result.message.password =
      "le mot de passe doit contenir au moins 8 caratere";
  }

  if (body.sexe == "" || body.sexe == undefined) {
    result.success = false;
    result.message.sexe = "Veuillez selectionner votre sexe";
  }

  return result;
};

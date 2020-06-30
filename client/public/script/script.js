$(document).ready(function () {
  $("#action_menu_btn").click(function () {
    $(".action_menu").toggle();
  });

  let formInsc = $("#inscr");
  let formConnex = $("#connex");

  formInsc.submit((e) => {
    e.preventDefault();
    let v = verifie();

    if (v.success) {
      let client = v.infos;
      $.ajax({
        url: "http://localhost:8002/api/inscription",
        method: "post",
        data: client,
        typeData: "json",
        success: (r) => {
          if (r.inscription) {
            console.log(
              "inscription reussi, redirection sur la page de connexion automatique"
            );

            setTimeout(() => {
              location.replace("http://localhost:8002/connexion");
            }, 1500);
          }
        },
        error: (e) => {
          console.log(e);
        },
      });
    } else {
      /*** Traitement des erreurs */

      console.log(v.message);
    }
  });
});

function verifie() {
  let result = {
    success: true,
    message: {},
  };

  let login = $("#login")[0].value;
  let password = $("#password")[0].value;
  let cpassword = $("#cpassword")[0].value;

  let checks = $(".check");

  if (login == "") {
    result.success = false;
    result.message.login = "Le login ne doit pas etre vide";
  }

  if (password == "" || password.length < 8) {
    result.success = false;
    result.message.password =
      "le mot de passe doit contenir au moins 8 caratere";
  }

  if (!checks[0].checked && !checks[1].checked) {
    result.success = false;
    result.message.sexe = "Veuillez selectionner votre sexe";
  }

  if (cpassword == "" || cpassword.length < 8) {
    result.success = false;
    result.message.cpassword =
      "le mot de passe doit contenir au moins 8 caratere";
  } else if (cpassword != password) {
    result.success = false;
    result.message.cpassword = "veuillez confirmer le mot de passe";
  }

  if (result.success) {
    result.infos = {
      login,
      sexe: checks[0].checked ? checks[0].value : checks[1].value,
      password,
    };
  }

  return result;
}

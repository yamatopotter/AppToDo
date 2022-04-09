// Arquivo para manipulação de tarefas do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let token = sessionStorage.getItem('token');

    fetch(`${BASE_URL_API}/users/getMe/`, {
            headers: {
                authorization: `${token}`
            }
        })
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "El usuario no existe") {
                alert("O usuário não existe")
            } else if (resposta == "Error del servidor") {
                alert("Erro do servidor")
            } else {
                console.log("Resultado do getMe: ");
                console.log(resposta);
            }

        });
})();
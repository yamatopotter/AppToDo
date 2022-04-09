// Arquivo para manipulação de dados do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let formCadastroUsuario = document.getElementById('formCreateAccount');
    let formLogin = document.getElementById('formLogin');

    function validaVazio(campo) {

    }

    function validaSenha(campo1, campo2) {
        return campo1;
    }

    formCadastroUsuario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        let nome = evento.target['nome'].value;
        let sobrenome = evento.target['sobrenome'].value;
        let email = evento.target['email'].value;
        let senha = evento.target['senha'].value;

        let userData = {
            firstName: nome,
            lastName: sobrenome,
            email: email,
            password: senha
        }

        console.log(userData);

        const configuracoes = {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }


        fetch(`${BASE_URL_API}/users`, configuracoes)
            .then(function (respostaDoServidor) {
                var JSON = respostaDoServidor.json();
                return JSON;
            })
            .then(function (resposta) {
                if (resposta === "El usuario ya se encuentra registrado") {
                    console.log("O usuário já se encontra registrado")
                } else if (resposta === "Alguno de los datos requeridos está incompleto") {
                    console.log("Alguns dados requeridos estão incompletos.")
                } else if (resposta === "Error del servidor") {
                    console.log("Erro do servidor")
                } else {
                    console.log('Usuário criado com sucesso')
                }

            });
    });

    formLogin.addEventListener('submit', (evento) => {
        evento.preventDefault();

        let email = evento.target['emailLogin'].value;
        let senha = evento.target['senhaLogin'].value;

        let userData = {
            email: email,
            password: senha
        }

        //console.log(userData);

        const configuracoes = {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }

        fetch(`${BASE_URL_API}/users/login`, configuracoes)
            .then(function (respostaDoServidor) {
                var JSON = respostaDoServidor.json();
                return JSON;
            })
            .then(function (resposta) {
                if (resposta === "El usuario no existe") {
                    console.log("O usuário não existe")
                } else if (resposta === "Constraseña incorrecta") {
                    console.log("Senha incorreta")
                } else if (resposta === "Error del servidor") {
                    console.log("Erro do servidor")
                } else {
                    sessionStorage.setItem('token', resposta);
                    window.location.href("app.html")
                }

            });
    })
})();
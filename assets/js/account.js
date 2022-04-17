// Arquivo para manipulação de dados do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let formCadastroUsuario = document.getElementById('formCreateAccount');
    let formLogin = document.getElementById('formLogin');
    let modalMessage = document.getElementById('modalMessage');
    let modalMessageControl = new bootstrap.Modal(modalMessage);


    function showModalMessage(title, message, status, condition=false) {
        const modalMesasageTitle = document.getElementById('modalMessageTitle');
        const modalMesasageIcon = document.getElementById('modalMessageIcon');
        const modalMesasageDescription = document.getElementById('modalMessageBody');

        modalMesasageTitle.innerText = title;
        modalMesasageDescription.innerText = message;

        if (status) {
            modalMesasageIcon.classList.add('bi-info-circle');
            modalMesasageIcon.classList.remove('bi-exclamation-circle');
        } else {
            modalMesasageIcon.classList.add('bi-exclamation-circle');
            modalMesasageIcon.classList.remove('bi-info-circle');
        }

        if (condition){
            modalMessage.setAttribute('data-condition', true);
        }
        
        modalMessageControl.show();
    }

    function validaVazio(obj) {
        let values = Object.values(obj);
        values = values.filter(Boolean)
 
        return Object.keys(obj).length==values.length
    }

    function validaSenha(campo1, campo2) {
        if (campo1 === campo2)
            return true;
        else
            return false;
    }

    function fetchLogin(userData){
        const configuracoes = {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }

        return fetch(`${BASE_URL_API}/users/login`, configuracoes)
    }

    async function realizaLogin(userData){
        if(validaVazio(userData)){ 
            try{
                let respostaServer = await fetchLogin(userData);
                let chave = await respostaServer.json();
                let statusCode = await respostaServer.status;
               
                if(statusCode==201){
                    sessionStorage.setItem('token', chave.jwt);
                    window.location.href = "app.html";
                } else if (statusCode == 400){
                    showModalMessage("Oops, houve um erro", "A senha está incorreta.", false);
                }else if (statusCode == 404){
                    showModalMessage("Oops, houve um erro", "Tem certeza que o e-mail foi cadastrado na plataforma?", false);
                }
                else{
                    showModalMessage("Oops, houve um erro", "Houve um erro no processamento das informações, tente novamente.", false);
                }
            }
            catch(err){
                showModalMessage("Oops, houve um erro", "Houve um erro no processamento das informações, tente novamente.", false);
            }
        }
        else{
            showModalMessage("Oops, houve um erro", "Algum campo está vazio, verifique e tente o login novamente.", false);
        }
    }

    // Se o formulário de cadastro existir
    if (formCadastroUsuario) {
        formCadastroUsuario.addEventListener('submit', (evento) => {
                evento.preventDefault();

                let newUser = {
                    firstName: evento.target['nome'].value,
                    lastName: evento.target['sobrenome'].value,
                    email: evento.target['email'].value,
                    password: evento.target['senha'].value,
                }

                let confirmaSenha = evento.target['confirmaSenha'].value;

                if (validaVazio(newUser) && validaSenha(newUser.password, confirmaSenha)) {

                    const configuracoes = {
                        method: 'POST',
                        body: JSON.stringify(newUser),
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                        },
                    };

                    console.log(configuracoes)

                    fetch(`${BASE_URL_API}/users`, configuracoes)
                        .then(function (respostaDoServidor) {
                            const statusCode = respostaDoServidor.status;
                            return statusCode;
                        })
                        .then(function (resposta) {
                            console.log(resposta);
                            if(resposta==201){
                                showModalMessage("Sucesso", "Seu cadastro foi realizado! Seja bem vindo ao ToDo App!", true);
                            } else if (resposta == 400){
                                showModalMessage("Oops, houve um erro", "O usuário já se encontra registrado ou alguns dados estão incompletos", false);
                            }
                            else{
                                showModalMessage("Oops, houve um erro", "Houve um erro no processamento das informações, tente novamente.", false);
                            }
                        });
                } else {
                    showModalMessage("Oops, houve um erro", "Verifique se deixou de preencher algum dado ou se as senhas estão diferentes", false);
                }
        });
    }

// Se o formulário de login existir
if (formLogin) {
    formLogin.addEventListener('submit', (evento) => {
        evento.preventDefault();

        let userData = {
            email: evento.target['emailLogin'].value,
            password: evento.target['senhaLogin'].value
        }
        
        realizaLogin(userData);
    });
}

})();
// Arquivo para manipulação de dados do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let formCadastroUsuario = document.getElementById('formCreateAccount');
    let formLogin = document.getElementById('formLogin');
    let modalMessage = document.getElementById('modalMessage');
    let modalMessageControl = new bootstrap.Modal(modalMessage);

    function showModalMessage(title, message, status, condition=false) {
        const modalMessageTitle = document.getElementById('modalMessageTitle');
        const modalMessageIcon = document.getElementById('modalMessageIcon');
        const modalMessageDescription = document.getElementById('modalMessageBody');

        modalMessageTitle.innerText = title;
        modalMessageDescription.innerText = message;

        if (status) {
            modalMessageIcon.classList.add('bi-info-circle');
            modalMessageIcon.classList.remove('bi-exclamation-circle');
        } else {
            modalMessageIcon.classList.add('bi-exclamation-circle');
            modalMessageIcon.classList.remove('bi-info-circle');
        }

        if(condition){
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

    function fetchUserData(configuracaoFetch) {
        if(configuracaoFetch.body){
            delete configuracaoFetch.body
        }
        configuracaoFetch.method='GET';
        return fetch(`${BASE_URL_API}/users/getMe/`, configuracaoFetch)
    }

    async function showUserData(token){
        const configuracaoFetch = {
            headers: {
                authorization: `${token}`,
                'Content-type': 'application/json; charset=UTF-8',
            },
            method: 'GET'
        }

        const serverResponse = await fetchUserData(configuracaoFetch);
        const userData = await serverResponse.json();
        const serverStatus = await serverResponse.status;

        if (serverStatus==200){
            let userName = userData.firstName + ' ' + userData.lastName;
            let userEmail = userData.email;

            document.getElementById('iconUser').classList.toggle('d-none');
            document.getElementById("userName").innerText = userName;
            document.getElementById("userEmail").innerText = userEmail;
        }else if(serverStatus == 404){
            showModalMessage('Oops, houve um erro', 'Usuário inexistente', false)
        }else{
            showModalMessage('Oops, houve um erro', 'Houve um erro ao carregar as informações do usuário, mas isso não impede o funcionamento do app', false)
        }
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

    function deslogar(){
        sessionStorage.clear();
        showModalMessage("Logout", "Você será deslogado do sistema", true, true);
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

        const loginBtn = document.getElementById('loginBtn');
        loginBtn.innerText = "Entrar";
        loginBtn.disabled = false;
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
                                formCadastroUsuario.reset();
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

        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        
        let newSpinner = document.createElement('span');
        newSpinner.classList.add('spinner-border', 'text-success');
        
        loginBtn.innerText = "Carregando ... ";
        loginBtn.appendChild(newSpinner);

        let userData = {
            email: evento.target['emailLogin'].value,
            password: evento.target['senhaLogin'].value
        }
        
        realizaLogin(userData);
    });
}

window.addEventListener('load', ()=>{
   if(sessionStorage.getItem('token')!==null){
       let loginMenuBtn = document.getElementById('loginMenuBtn');
       loginMenuBtn.remove();

       let logoutMenuBtn = document.createElement('a');
       logoutMenuBtn.innerText = 'Logout';
       logoutMenuBtn.classList.add('nav-link'); 
       logoutMenuBtn.addEventListener('click', () => deslogar());

       let mainMenu = document.getElementById('main-menu');

       let appMenuBtn = document.createElement('li');
       appMenuBtn.classList.add('nav-item');

       let linkAppMenuBtn = document.createElement('a');
       linkAppMenuBtn.classList.add('nav-link');
       linkAppMenuBtn.href = "app.html"
       linkAppMenuBtn.innerText = "Ver Tarefas"

       appMenuBtn.appendChild(linkAppMenuBtn);
       mainMenu.appendChild(logoutMenuBtn);
       mainMenu.appendChild(appMenuBtn);

       showUserData(sessionStorage.getItem('token'));
   }
});

modalMessage.addEventListener('hidden.bs.modal', () => {
    let condition = modalMessage.getAttribute('data-condition');

    if(condition){
        modalMessage.setAttribute('data-condition', false);
        window.location.href="index.html";
    }
});

})();
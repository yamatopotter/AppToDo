// Arquivo para manipulação de tarefas do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let token = sessionStorage.getItem('token');
    let configuracaoFetch = {
        authorization: `${token}`
    }


    function getUserData(configuracaoFetch){
        fetch(`${BASE_URL_API}/users/getMe/`, configuracaoFetch)
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "El usuario no existe") {
                return("O usuário não existe")
            } else if (resposta == "Error del servidor") {
                return("Erro do servidor")
            } else {
                return(resposta);
            }

        });
    }

    function getUserTasks(configuracaoFetch){
        fetch(`${BASE_URL_API}/tasks`, configuracaoFetch)
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "Requiere Autorización") {
                return("Chave de autenticação incorreta")
            } else if (resposta == "Error del servidor") {
                return("Erro do servidor")
            } else {
                return(resposta);
            }
        });
    }
    
    function createTask(configuracaoFetch, data){
        configuracaoFetch.body = JSON.stringify(data)
        configuracaoFetch.method = 'POST';
        configuracaoFetch.header['Content-type'] = 'application/json; charset=UTF-8';
        
        fetch(`${BASE_URL_API}/tasks`, configuracaoFetch)
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "Alguno de los datos requeridos está incompleto") {
                return("Algum dado obrigatório está incompleto")
            }else if (resposta == "Requiere Autorización") {
                return("Chave de autenticação incorreta")
            }else if (resposta == "Error del servidor") {
                return("Erro do servidor")
            }else {
                return(resposta);
            }
        });
    }

    function getSpecifTask(configuracaoFetch, id){
        fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "ID Inválido") {
                return(resposta)
            }else if (resposta == "Requiere Autorización") {
                return("Chave de autenticação incorreta")
            }else if (resposta == "Tarea inexistente") {
                return("Tarefa Inexistente")
            }else if (resposta == "Error del servidor") {
                return("Erro do servidor")
            }else {
                return(resposta);
            }
        });
    }

    function updateTask(configuracaoFetch, data, id){
        configuracaoFetch.body = JSON.stringify(data)
        configuracaoFetch.method = 'PUT';
        configuracaoFetch.header['Content-type'] = 'application/json; charset=UTF-8';

        fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "ID Inválido") {
                return(resposta)
            }else if (resposta == "Requiere Autorización") {
                return("Chave de autenticação incorreta")
            }else if (resposta == "Tarea inexistente") {
                return("Tarefa Inexistente")
            }else if (resposta == "Error del servidor") {
                return("Erro do servidor")
            }else {
                return(resposta);
            }
        });
    }

    function deleteTask(configuracaoFetch, id){
        configuracaoFetch.method = 'DELETE';
        configuracaoFetch.header['Content-type'] = 'application/json; charset=UTF-8';

        fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
        .then(function (respostaDoServidor) {
            return respostaDoServidor.json();
        })
        .then(function (resposta) {
            if (resposta == "ID Inválido") {
                return(resposta)
            }else if (resposta == "Requiere Autorización") {
                return("Chave de autenticação incorreta")
            }else if (resposta == "Tarea inexistente") {
                return("Tarefa Inexistente")
            }else if (resposta == "Error del servidor") {
                return("Erro do servidor")
            }else {
                return('Tarefa Excluída com Sucesso');
            }
        });
    }
})();
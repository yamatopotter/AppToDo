// Arquivo para manipulação de tarefas do usuário
var num=0;

(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let formTarefa = document.getElementById('form-tarefa');
    let listaPendente = document.getElementById('tarefas-pendentes');
    let listaFinalizada = document.getElementById('tarefas-finalizadas');

    let token = sessionStorage.getItem('token');
    const configuracaoFetch = {
        headers: {
            authorization: `${token}`,
            'Content-type': 'application/json; charset=UTF-8',
        }
    }


    function getUserData(configuracaoFetch) {
        fetch(`${BASE_URL_API}/users/getMe/`, configuracaoFetch)
            .then(function (respostaDoServidor) {
                return respostaDoServidor.json();
            })
            .then(function (resposta) {
                if (resposta == "El usuario no existe") {
                    return ("O usuário não existe")
                } else if (resposta == "Error del servidor") {
                    return ("Erro do servidor")
                } else {
                    return (resposta);
                }

            });
    }

    function getUserTasks(configuracaoFetch) {
        fetch(`${BASE_URL_API}/tasks`, configuracaoFetch)
            .then(function (respostaDoServidor) {
                return respostaDoServidor.json();
            })
            .then(function (resposta) {
                if (resposta == "Requiere Autorización") {
                    return ("Chave de autenticação incorreta")
                } else if (resposta == "Error del servidor") {
                    return ("Erro do servidor")
                } else {
                    return (resposta);
                }
            });
    }

    function deleteTask(configuracaoFetch, id) {
        configuracaoFetch.method = 'DELETE';
        configuracaoFetch.body = '';
        return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch);
    }

    async function clickDeleteTask(id){
        try {
            const submitResponse = await deleteTask(configuracaoFetch, id);
            const data = await submitResponse.json();

            alert(data);
        } catch (err) {
            alert(`Oops! ${err}`);
        }
    }

    function createTask(configuracaoFetch, data) {
        configuracaoFetch.body = JSON.stringify(data)
        configuracaoFetch.method = 'POST';

        console.log(configuracaoFetch);

        return fetch(`${BASE_URL_API}/tasks`, configuracaoFetch);
    }

    async function submitCreateTask(body) {
        // document.getElementById('main-app').innerHTML += '<div class="spinner-grow" role="status"><span class="visually-hidden">Loading...</span></div>';

        try {
            const submitResponse = await createTask(configuracaoFetch, body);
            const data = await submitResponse.json();

            console.log(data);

            let idTarefa = data.id;
            let description = data.description;

            let elementTask = document.createElement('li');
            elementTask.name = `task-${idTarefa}`;
            elementTask.id = idTarefa;
            elementTask.innerText = description;

            let deleteButton = document.createElement('i');
            deleteButton.name = `btnDelete-${idTarefa}`;
            deleteButton.classList.add('bi', 'bi-clipboard-x');

            deleteButton.addEventListener('click', () => {
                clickDeleteTask(configuracaoFetch, idTarefa);
            });

            elementTask.appendChild(deleteButton);
            console.log(elementTask);

            listaPendente.appendChild(elementTask);

        } catch (err) {
            alert(`Oops! ${err}`);
        }
    }

    function getSpecifTask(configuracaoFetch, id) {
        fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
            .then(function (respostaDoServidor) {
                return respostaDoServidor.json();
            })
            .then(function (resposta) {
                if (resposta == "ID Inválido") {
                    return (resposta)
                } else if (resposta == "Requiere Autorización") {
                    return ("Chave de autenticação incorreta")
                } else if (resposta == "Tarea inexistente") {
                    return ("Tarefa Inexistente")
                } else if (resposta == "Error del servidor") {
                    return ("Erro do servidor")
                } else {
                    return (resposta);
                }
            });
    }

    function updateTask(configuracaoFetch, data, id) {
        configuracaoFetch.body = JSON.stringify(data)
        configuracaoFetch.method = 'PUT';
        configuracaoFetch.header['Content-type'] = 'application/json; charset=UTF-8';

        fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
            .then(function (respostaDoServidor) {
                return respostaDoServidor.json();
            })
            .then(function (resposta) {
                if (resposta == "ID Inválido") {
                    return (resposta)
                } else if (resposta == "Requiere Autorización") {
                    return ("Chave de autenticação incorreta")
                } else if (resposta == "Tarea inexistente") {
                    return ("Tarefa Inexistente")
                } else if (resposta == "Error del servidor") {
                    return ("Erro do servidor")
                } else {
                    return (resposta);
                }
            });
    }

    

    formTarefa.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const TAREFA = evento.target['inputNovaTarefa'].value;
        const BODY = {
            description: TAREFA,
            completed: false
        }

        submitCreateTask(BODY);
    });

})();
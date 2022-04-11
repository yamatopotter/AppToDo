// Arquivo para manipulação de tarefas do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let formTarefa = document.getElementById('form-tarefa');
    let formUpdate = document.getElementById('form-update-task');
    let listaPendente = document.getElementById('tarefas-pendentes');
    let listaFinalizada = document.getElementById('tarefas-finalizadas');
    let modalUpdateTask = document.getElementById('modalUpdateTask')
    let inputUpdateTarefa = document.getElementById('inputUpdateTarefa');

    let token = sessionStorage.getItem('token');
    const configuracaoFetch = {
        headers: {
            authorization: `${token}`,
            'Content-type': 'application/json; charset=UTF-8',
        }
    }

    function createElement(id, description){
        let elementTask = document.createElement('li');
        elementTask.name = `task-${id}`;
        elementTask.id = `task-${id}`;
        elementTask.innerText = description;

        let updateButton = document.createElement('i');
        updateButton.name = `btnUpdate-${id}`;
        updateButton.classList.add('bi', 'bi-pencil-square');
        updateButton.setAttribute('data-bs-toggle', 'modal');
        updateButton.setAttribute('data-bs-target', '#modalUpdateTask');
        updateButton.setAttribute('data-id', id);

        let checkButton = document.createElement('i');
        checkButton.name = `btnCheck-${id}`;
        checkButton.classList.add('bi', 'bi-clipboard-check');

        let deleteButton = document.createElement('i');
        deleteButton.name = `btnDelete-${id}`;
        deleteButton.classList.add('bi', 'bi-clipboard-x');

        updateButton.addEventListener('click', () => {
            clickUpdateTask(id);
        });

        checkButton.addEventListener('click', () => {
            clickCheckTask(id);
        });

        deleteButton.addEventListener('click', () => {
            clickDeleteTask(id);
        });

        elementTask.appendChild(updateButton);
        elementTask.appendChild(checkButton);
        elementTask.appendChild(deleteButton);

        return elementTask
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
            let elementExclusion = document.getElementById(`task-${id}`);
            
            alert(data);
            elementExclusion.remove();

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

    function clickUpdateTask(id, taskStatus){
        modalUpdateTask.setAttribute('data-id', id);
        modalUpdateTask.setAttribute('data-status', taskStatus);
    }

    async function submitCreateTask(body) {
        // document.getElementById('main-app').innerHTML += '<div class="spinner-grow" role="status"><span class="visually-hidden">Loading...</span></div>';

        try {
            const submitResponse = await createTask(configuracaoFetch, body);
            const data = await submitResponse.json();

            console.log(data);

            let idTarefa = data.id;
            let description = data.description;

            const elementTask = createElement(idTarefa, description)
            
            listaPendente.appendChild(elementTask);

        } catch (err) {
            alert(`Oops! ${err}`);
        }
    }

    // realiza o get para tarefa específica
    function getSpecifTask(configuracaoFetch, id) {
        configuracaoFetch.method = 'GET';
        delete configuracaoFetch.body;

        console.log(configuracaoFetch);

        return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
    }

    // preenche o Modal
    async function returnTaskToUpdate(configuracaoFetch, id){
        try {
            const getResponse = await getSpecifTask(configuracaoFetch, id);
            const data = await getResponse.json();

            console.log(data);

            let checkbox = document.getElementById('checkCompletedTask');
            inputUpdateTarefa.value = data.description;
            checkbox.checked = data.completed;

        } catch (err) {
            alert(`Oops! ${err}`);
        }
    }

    function updateTask(configuracaoFetch, data, id) {
        configuracaoFetch.body = JSON.stringify(data)
        configuracaoFetch.method = 'PUT';

        return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
    }

    async function submitUpdateTask(dataUser, id, lastState){
        try{
            const submitResponse = await updateTask(configuracaoFetch, dataUser, id);
            const data = await submitResponse.json();

            if(typeof(data)=='object'){
                const completedTask = data.completed;
                let elementTask = document.getElementById(`task-${id}`);
    
                if(completedTask === lastState){
                    elementTask.innerText = data.description;
                }
                else{
                    if(completedTask){
                        listaFinalizada.appendChild(elementTask);
                    }else{
                        listaPendente.appendChild(elementTask);
                    }
                }
            }
            else{
                alert(data);
            }
        }
        catch(err){
            alert(`Oops! ${err}`);
        }
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

    modalUpdateTask.addEventListener('shown.bs.modal', (e) => {
        console.log(e);
        let id = modalUpdateTask.getAttribute('data-id');
        returnTaskToUpdate(configuracaoFetch, id);
    })

    formUpdate.addEventListener('submit', (e)=>{
        e.preventDefault();

        const TAREFA = e.target['inputUpdateTarefa'].value;
        const CHECKBOX = e.target['checkCompletedTask'].checked;
        const ID = modalUpdateTask.getAttribute('data-id');

        const BODY = {
            description: TAREFA,
            completed: CHECKBOX
        }

        submitUpdateTask(BODY, ID, CHECKBOX);
    })

})();
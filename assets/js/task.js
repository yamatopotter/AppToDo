// Arquivo para manipulação de tarefas do usuário
(() => {
    let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

    let formTarefa = document.getElementById('form-tarefa');
    let formUpdate = document.getElementById('form-update-task');
    let listaPendente = document.getElementById('tarefas-pendentes');
    let listaFinalizada = document.getElementById('tarefas-finalizadas');
    let modalUpdateTask = document.getElementById('modalUpdateTask');
    let modalUpdateControl = new bootstrap.Modal(modalUpdateTask);
    let inputUpdateTarefa = document.getElementById('inputUpdateTarefa');

    let token = sessionStorage.getItem('token');
    const configuracaoFetch = {
        headers: {
            authorization: `${token}`,
            'Content-type': 'application/json; charset=UTF-8',
        }
    }

    // Cria os elementos
    function createElement(id, description, status){      
        let elementTask = document.createElement('li');
        elementTask.name = `task-${id}`;
        elementTask.id = `task-${id}`;
    
        let spanText = document.createElement('span');
        spanText.name = `task-description-${id}`;
        spanText.id = `task-description-${id}`;
        spanText.innerText = description;

        let divButtons = document.createElement('div');

        let updateButton = document.createElement('i');
        updateButton.name = `btnUpdate-${id}`;
        updateButton.classList.add('bi', 'bi-pencil-square');
        updateButton.setAttribute('data-bs-toggle', 'modal');
        updateButton.setAttribute('data-bs-target', '#modalUpdateTask');
        updateButton.setAttribute('data-id', id);


        let checkButton = document.createElement('i');
        checkButton.name = `btnCheck-${id}`;
        checkButton.id = `btnCheck-${id}`;
        if(status){
            checkButton.classList.add('bi', 'bi-arrow-90deg-left');
        }
        else{
            checkButton.classList.add('bi', 'bi-clipboard-check');
        }
        

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

        elementTask.appendChild(spanText)
        divButtons.appendChild(updateButton);
        divButtons.appendChild(checkButton);
        divButtons.appendChild(deleteButton);
        elementTask.appendChild(divButtons);

        return elementTask
    }

    async function firstLoad(){

        let response = await getUserTasks(configuracaoFetch);
        let data = await response.json();

        data.map( dado => {
            let statusTarefa = dado.completed;
            let description = dado.description;
            let id = dado.id;

            const liTarefa = createElement(id, description, statusTarefa);

            if(statusTarefa){
                listaFinalizada.appendChild(liTarefa);
            }
            else{
                listaPendente.appendChild(liTarefa);
            }
        })
    }

// ---------------------USER---------------------------

    // realiza o get para tarefa específica
    function getSpecifTask(configuracaoFetch, id) {
        configuracaoFetch.method = 'GET';
        delete configuracaoFetch.body;

        return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
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
        if(configuracaoFetch.body){
            delete configuracaoFetch.body
        }
        configuracaoFetch.method = 'GET'
        return fetch(`${BASE_URL_API}/tasks`, configuracaoFetch)
    }

    //------------------DELETE---------------------------

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

    // ---------------------CREATE------------------------

    function createTask(configuracaoFetch, data) {
        configuracaoFetch.body = JSON.stringify(data)
        configuracaoFetch.method = 'POST';
        return fetch(`${BASE_URL_API}/tasks`, configuracaoFetch);
    }

    async function submitCreateTask(body) {
        try {
            const submitResponse = await createTask(configuracaoFetch, body);
            const data = await submitResponse.json();

            let idTarefa = data.id;
            let description = data.description;

            const elementTask = createElement(idTarefa, description);
            
            listaPendente.appendChild(elementTask);
        } catch (err) {
            alert(`Oops! ${err}`);
        }
    }

    // -----------------UPDATE----------------------

    function clickUpdateTask(id){
        modalUpdateTask.setAttribute('data-id', id);
    }

    // preenche o Modal
    async function returnTaskToUpdate(configuracaoFetch, id){
        try {
            const getResponse = await getSpecifTask(configuracaoFetch, id);
            const data = await getResponse.json();

            let checkboxTask = document.getElementById('checkCompletedTask');
            let checkboxLastStatus = document.getElementById('checkboxFirstState');
            inputUpdateTarefa.value = data.description;
            checkboxTask.checked = data.completed;
            checkboxLastStatus.checked = data.completed;
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
                let descriptionTask = document.getElementById(`task-description-${id}`);
                let statusLastState = lastState.checked;

                if(completedTask == statusLastState){
                    descriptionTask.innerText = data.description;
                }
                else{
                    lastState.checked = completedTask;
                    checkButton = document.getElementById(`btnCheck-${id}`)
                    if(completedTask){
                        listaFinalizada.appendChild(elementTask);
                        checkButton.classList.remove('bi-clipboard-check');                        
                        checkButton.classList.add('bi-arrow-90deg-left');                        
                    }else{
                        listaPendente.appendChild(elementTask);
                        checkButton.classList.add('bi-clipboard-check');                        
                        checkButton.classList.remove('bi-arrow-90deg-left');
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

    // função OK
    formTarefa.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const TAREFA = evento.target['inputNovaTarefa'].value;
        const BODY = {
            description: TAREFA,
            completed: false
        }

        submitCreateTask(BODY);
    });

    // função OK
    modalUpdateTask.addEventListener('shown.bs.modal', (e) => {
        console.log(e);
        let id = modalUpdateTask.getAttribute('data-id');
        returnTaskToUpdate(configuracaoFetch, id);
    })

    // função Ok
    formUpdate.addEventListener('submit', (e)=>{
        e.preventDefault();

        const TAREFA = e.target['inputUpdateTarefa'].value;
        const CHECKBOX = e.target['checkCompletedTask'].checked;
        const ID = modalUpdateTask.getAttribute('data-id');
        const LAST_STATE = document.getElementById('checkboxFirstState');

        const BODY = {
            description: TAREFA,
            completed: CHECKBOX
        }

        submitUpdateTask(BODY, ID, LAST_STATE);

        modalUpdateControl.hide();
    });

    // Cria as tarefas de acordo com o pedido
    window.addEventListener('load', function () {
        firstLoad()
    })
})();
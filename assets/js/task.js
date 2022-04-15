// Arquivo para manipulação de tarefas do usuário
(() => {
        let BASE_URL_API = "https://ctd-todo-api.herokuapp.com/v1";

        // Formulário onde a tarefa nova é criada
        let formTarefa = document.getElementById('form-tarefa');
        // Formulário dentro do modal UpdateTask
        let formUpdate = document.getElementById('form-update-task');
        // UL de tarefas pendentes
        let listaPendente = document.getElementById('tarefas-pendentes');
        // UL de tarefas finalizadas
        let listaFinalizada = document.getElementById('tarefas-finalizadas');
        // Modal de edição da tarefa
        let modalUpdateTask = document.getElementById('modalUpdateTask');
        // Controle do modal de edição da tarefa
        let modalUpdateControl = new bootstrap.Modal(modalUpdateTask);

        // Captura do token e armazena na session storage
        let token = sessionStorage.getItem('token');

        // Objeto de configuração da API para uso do Fetch
        const configuracaoFetch = {
            headers: {
                authorization: `${token}`,
                'Content-type': 'application/json; charset=UTF-8',
            }
        }

        // Cria os elementos
        function createElement(id, description, status) {

            // Criação da LI
            let elementTask = document.createElement('li');
            elementTask.name = `task-${id}`;
            elementTask.id = `task-${id}`;

            // Criação da SPAN para descrição da tarefa, foi feito pois quando o texto é atualizado, os botões sumiam.
            let spanText = document.createElement('span');
            spanText.name = `task-description-${id}`;
            spanText.id = `task-description-${id}`;
            spanText.innerText = description;

            // Div criada para ajustar a separaçao dos botões
            let divButtons = document.createElement('div');

            // Criação do botão de editar a tarefa
            let updateButton = document.createElement('i');
            updateButton.name = `btnUpdate-${id}`;
            updateButton.classList.add('bi', 'bi-pencil-square');

            // Criação do botão de alterar o status da tarefa
            let checkButton = document.createElement('i');
            checkButton.name = `btnCheck-${id}`;
            checkButton.id = `btnCheck-${id}`;
            if (status) {
                checkButton.classList.add('bi', 'bi-arrow-90deg-left');
            } else {
                checkButton.classList.add('bi', 'bi-clipboard-check');
            }

            // Criação do botão de excluir a tarefa
            let deleteButton = document.createElement('i');
            deleteButton.name = `btnDelete-${id}`;
            deleteButton.classList.add('bi', 'bi-clipboard-x');

            // Adiciona o evento de edição de tarefa
            updateButton.addEventListener('click', () => {
                clickUpdateTask(id);
            });

            // Adiciona o evento que marca a tarefa como concluida
            checkButton.addEventListener('click', () => {
                clickCheckTask(id);
            });

            // Adiciona o evento que exclui a tarefa e remove ela da inteface
            deleteButton.addEventListener('click', () => {
                clickDeleteTask(id);
            });

            // Encapsulamos todos os objetos criados
            elementTask.appendChild(spanText)
            divButtons.appendChild(updateButton);
            divButtons.appendChild(checkButton);
            divButtons.appendChild(deleteButton);
            elementTask.appendChild(divButtons);

            // Retornamos o elemento LI
            return elementTask
        }

        // Função que realiza o carregamento das informações da tarefa assim que a página termina o carregamento
        async function firstLoad() {

            // Realizo a chamada para a função com o fetch configurado para retornar as tarefas do usuário
            let response = await getUserTasks(configuracaoFetch);
            // Realizo a conversão dos dados recebidos
            let data = await response.json();

            // Através do MAP realizo a varredura do array de objetos retornado, passando elemento a elemento
            data.map(dado => {
                // capturo os dados do status da tarefa, descrição e id da tarefa retornado pela API
                let statusTarefa = dado.completed;
                let description = dado.description;
                let id = dado.id;

                // crio uma LI referente a tarefa
                const liTarefa = createElement(id, description, statusTarefa);

                // defino em qual lista ela vai ser adicionada
                if (statusTarefa) {
                    listaFinalizada.appendChild(liTarefa);
                } else {
                    listaPendente.appendChild(liTarefa);
                }
            })
        }

        // ---------------------USER---------------------------

        // realiza uma chamada da API para obtermos uma tarefa específica
        function getSpecifTask(configuracaoFetch, id) {
            configuracaoFetch.method = 'GET';
            // se houver algum body da configuração do fetch, removemos para não haver problemas
            if (configuracaoFetch.body) {
                delete configuracaoFetch.body
            }
            return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)
        }

        function getUserData(configuracaoFetch) {
            return fetch(`${BASE_URL_API}/users/getMe/`, configuracaoFetch)
                .then(function(respostaDoServidor) {
                    return respostaDoServidor.json();
                })
                .then(function(resposta) {
                    if (resposta == "El usuario no existe") {
                        return { error: "O usuário não existe" }
                    } else if (resposta == "Error del servidor") {
                        return { error: "Erro do servidor" }
                    } else {
                        return { error: false, result: resposta }
                    }
                });
        }

        // realiza uma pesquisa completa nas tarefas do usuário
        function getUserTasks(configuracaoFetch) {
            // como reutilizamos o fetch constantemente, podemos ter um problema no body, pois GET não pode ter body, para evitar o erro, removemos o mesmo
            if (configuracaoFetch.body) {
                delete configuracaoFetch.body
            }
            configuracaoFetch.method = 'GET'
            return fetch(`${BASE_URL_API}/tasks`, configuracaoFetch)
        }
        //----------------- check --------------------
        function clickCheckTask(id) {
            try {
                const verificaTarefa = await getSpecifTask(configuracaoFetch, id);
                const respostaVerificaTarefa = await verificaTarefa.json();
                const tarefaCompleta = respostaVerificaTarefa.completed;
                const descricaoTarefa = respostaVerificaTarefa.description;
                const dadosTarefa = {
                    description: descricaoTarefa, 
                    completed: !tarefaCompleta,
                }
                const liTarefa = document.getElementById(`task-${id}`);

                const atualizaTarefa = await updateTask(configuracaoFetch, dadosTarefa, id);
                const respostaAtualizaTarefa = await atualizaTarefa.status;

                if (respostaAtualizaTarefa = 200){
                    if (tarefaCompleta){
                        listaPendente.appendChild(liTarefa);
                    } else { 
                        listaFinalizada.appendChild(liTarefa);
                    }
                }
                else {
                    alert (respostaAtualizaTarefa);
                }
            } 
            catch (err) {             
                alert(`Oops! ${err}`);         
            }

        }


        //------------------DELETE---------------------------

        // realiza a exclusão de uma tarefa
        function deleteTask(configuracaoFetch, id) {
            configuracaoFetch.method = 'DELETE';
            if (configuracaoFetch.body) {
                delete configuracaoFetch.body
            }
            return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch);


            // utilizamos a função assincrona pois estamos trabalhando com chamadas a API, o que nos retornará Promises. 
            async function clickDeleteTask(id) {
                try {
                    // realizamos a chamada a API e aguardamos ela ser resolvida
                    const submitResponse = await deleteTask(configuracaoFetch, id);
                    // realizamos a conversão dos dados recebidos da API
                    const data = await submitResponse.statusText
                        // capturamos a LI a ser removida
                    elementExclusion = document.getElementById(`task-${id}`);
                    // Exibimos a mensagem de retorno da API conforme a documentação, o ideal é tratar essa informação antes de ser exibida pois está em espanhol
                    alert(data);
                    // O elemento é removido da tela
                    elementExclusion.remove();
                    tcach(err) {
                        // Exibe uma mensagem de erro caso aconteceça alguma coisa na tentativa de execução
                        alert(`Oops! ${err}`);
                    }
                }

                // ---------------------CREATE------------------------

                // realiza a chamada a API para realizar a criação da tarefa
                function createTask(configuracaoFetch, data) {
                    // convertemos nosso dado para envio dele para API
                    configuracaoFetch.body = JSON.stringify(data);
                    // configuramos o metodo de chamada a API
                    configuracaoFetch.method = 'POST';
                    return fetch(`${BASE_URL_API}/tasks`, configuracaoFetch);


                    // função assincrona que realiza a criação de uma tarefa
                    async function submitCreateTask(body) {
                        try {
                            // realizamos a chamada a API através da função e aguardamos ela ser resolvida
                            const submitResponse = await createTask(configuracaoFetch, body);
                            // realizamos a conversão dos dados recebidos da API
                            const data = await submitResponse.json();

                            // capturamos as informações necessárias (ID e DESCRIÇÃO)
                            let idTarefa = data.id;
                            let description = data.description;

                            // criação da LI da tarefa recém criada
                            const elementTask = createElement(idTarefa, description);

                            // adicionamos a tarefa à lista
                            listaPendente.appendChild(elementTask);
                        }
                        ctch(err) {
                            // Exibe uma mensagem de erro caso aconteceça alguma coisa na tentativa de execução           
                            alert(`Oops! ${err}`);
                        }


                        // -----------------UPDATE----------------------

                        // Função que inicia o processo de edição da tarefa
                        function clickUpdateTask(id) {
                            // Foi utilizado o setAttribute aqui para que pudesse ser passado a ID da tarefa para dentro do modal
                            modalUpdateTask.setAttribute('data-id', id);
                            // Exibimos o modal de edição da tarefa
                            modalUpdateControl.show();
                        }

                        // função que preenche o modal com os dados da tarefa
                        async function returnTaskToUpdate(configuracaoFetch, id) {
                            try {
                                // Realizamos a chamada para API através da função e aguardamos a resposta
                                const getResponse = await getSpecifTask(configuracaoFetch, id);
                                // Aguardamos a resposta e convertemos
                                const data = await getResponse.json();

                                // capturamos o switch do formulario de edição
                                let checkboxTask = document.getElementById('checkCompletedTask');
                                // capturamos o checkbox escondido para guardar o estado em que a tarefa se encontra
                                let checkboxLastStatus = document.getElementById('checkboxFirstState');
                                // capturamos o input que receberá a descrição da tarefa
                                let inputUpdateTarefa = document.getElementById('inputUpdateTarefa');

                                // preenchemos os campos capturados com os valores retornado pela API
                                inputUpdateTarefa.value = data.description;
                                checkboxTask.checked = data.completed;
                                checkboxLastStatus.checked = data.completed;
                                tch(err) {

                                    // caso haja algum erro durante o processamento, um alerta será exibido.
                                    alert(`Oops! ${err}`);

                                }

                                // realiza uma chamada à API para atualização dos dados de uma tarefa
                                function updateTask(configuracaoFetch, data, id) {
                                    // Aicionamos os dados da tarefa e o convertemos em JSON
                                    configuracaoFetch.body = JSON.stringify(data)
                                        // Definimos o método de requisição
                                    iguracaoFetch.method = 'PUT';

                                    return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch)


                                    // realiza a atualização dos dados da tarefa tanto na API quanto na Interface
                                    async function submitUpdateTask(dataUser, id, lastState) {
                                        try {
                                            // realizamos o chamado da api e aguardamos sua resposta
                                            const submitResponse = await updateTask(configuracaoFetch, dataUser, id);
                                            // aguardamos a resolução da promise e processamos a resposta
                                            const data = await submitResponse.json();

                                            // verificamos se o tipo retornado é um objeto, pois em caso de erro, temos o retorno de uma string
                                            if (typeof(data) == 'object') {
                                                // capturamos os dados e elementos necessários para atualizar a interface
                                                const completedTask = data.completed;
                                                let statusLastState = lastState.checked;
                                                let elementTask = document.getElementById(`task-${id}`);
                                                let descriptionTask = document.getElementById(`task-description-${id}`);

                                                // Se não houve mudança do status, alteramos apenas o texto, caso contrário, mudamos os ícones, texto e posição do elemento
                                                if (completedTask == statusLastState) {
                                                    descriptionTask.innerText = data.description;
                                                }
                                                se {
                                                    lastState.checked = completedTask;
                                                    checkButton = document.getElementById(`btnCheck-${id}`)
                                                    if (completedTask) {
                                                        listaFinalizada.appendChild(elementTask);
                                                        checkButton.classList.remove('bi-clipboard-check');
                                                        checkButton.classList.add('bi-arrow-90deg-left');
                                                        se {
                                                            listaPendente.appendChild(elementTask);
                                                            checkButton.classList.add('bi-clipboard-check');
                                                            checkButton.classList.remove('bi-arrow-90deg-left');
                                                        }
                                                    }
                                                }
                                                se {
                                                    alert(data);

                                                    tch(err) {
                                                            alert(`Oops! ${err}`);



                                                            // função OK
                                                            formTarefa.addEventListener('submit', (evento) => {
                                                                        evento.preventDefault();

                                                                        const TAREFA = evento.target['inputNovaTarefa'].value;
                                                                        const BODY = {
                                                                                description: TAREFA,
                                                                                completed: false


                                                                                    submitCreateTask(BODY);


                                                                                // função OK
                                                                                modalUpdateTask.addEventListener('shown.bs.modal', (e) => {
                                                                                    console.log(e);
                                                                                    let id = modalUpdateTask.getAttribute('data-id');
                                                                                    returnTaskToUpdate(configuracaoFetch, id);
                                                                                })

                                                                                // função Ok
                                                                                formUpdate.addEventListener('submit', (e) => {
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
                                                                                    }

                                                                                    // Cria as tarefas de acordo com o pedido
                                                                                    window.addEventListener('load', function() {
                                                                                            firstLoad()

                                                                                            ;
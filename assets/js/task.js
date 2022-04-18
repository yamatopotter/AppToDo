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
    // Captura o modal de mensagem e seus filhos
    let modalMesasage = document.getElementById('modalMessage');
    // Cria o controle JS para o modal de mensagem=
    let modalMessageControl = new bootstrap.Modal(modalMesasage);
    // Captura do token e armazena na session storage
    let token = sessionStorage.getItem('token');
    // Adiciona a função de deslogar ao item do menu
    let btnLogout = document.getElementById('logout')
    
    btnLogout.addEventListener('click', () => deslogar())

    // Objeto de configuração da API para uso do Fetch
    const configuracaoFetch = {
        headers: {
            authorization: `${token}`,
            'Content-type': 'application/json; charset=UTF-8',
        }
    }

    // Realiza o logout do usuário exibindo uma popup pedindo confirmação e caso verdadeiro, destrói a sessionStorage
    function deslogar(){
        sessionStorage.clear();
        showModalMessage("Logout", "Você será deslogado do sistema", true, true);
    }

    // Cria os elementos
    function createElement(id, description, status=false) {
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
        elementTask.appendChild(spanText);
        divButtons.appendChild(updateButton);
        divButtons.appendChild(checkButton);
        divButtons.appendChild(deleteButton);
        elementTask.appendChild(divButtons);

        // Retornamos o elemento LI
        return elementTask
    }

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

    // Função que realiza o carregamento das informações da tarefa assim que a página termina o carregamento
    async function firstLoad() {
        try {
            // Realizo a chamada para a função com o fetch configurado para retornar as tarefas do usuário
            let response = await getUserTasks(configuracaoFetch);
            // Realizo a conversão dos dados recebidos
            let statusData = await response.status
            let data = await response.json();

            if (statusData == 200) {
                // Através do MAP realizo a varredura do array de objetos retornado, passando elemento a elemento
               
                showUserData()
                
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
            else if(statusData == 401){
                showModalMessage('Erro', 'Você não está autenticado', false, true);
            }
            else{
                showModalMessage('Erro no Serviço', 'Houve um erro no servidor, experimente atualizar a página.', false);
            }

        } catch (err) {
            showModalMessage('Erro gravíssimo', err, false);
        }
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

    function fetchUserData(configuracaoFetch) {
        if(configuracaoFetch.body){
            delete configuracaoFetch.body
        }
        configuracaoFetch.method='GET';
        return fetch(`${BASE_URL_API}/users/getMe/`, configuracaoFetch)
    }

    async function showUserData(){
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
    async function clickCheckTask(id) {
        try {
            // Capturamos os dados da tarefa que estamos para marcar como finalizada/pendente
            const verificaTarefa = await getSpecifTask(configuracaoFetch, id);
            // convertemos os dados de nossa resposta da tarefa
            const respostaVerificaTarefa = await verificaTarefa.json();
            // Verificamos o status de nossa requisição
            const statusVerificaTarefa = await verificaTarefa.status;

            // Caso haja sucesso na captura dos dados
            if(statusVerificaTarefa == 200){
                // salvamos o status da tarefa
                const tarefaCompleta = respostaVerificaTarefa.completed;
                // salvamos a descrição da tarefa
                const descricaoTarefa = respostaVerificaTarefa.description;
                // Montamos o body para realizar o update do status da tarefa
                const dadosTarefa = {
                    description: descricaoTarefa,
                    completed: !tarefaCompleta,
                }
                
                // capturamos a li a ser movida
                const liTarefa = document.getElementById(`task-${id}`);
                // realizamos a chamada a api
                const atualizaTarefa = await updateTask(configuracaoFetch, dadosTarefa, id);
                // aguardamos o status da nossa atualização lá na API
                const respostaAtualizaTarefa = await atualizaTarefa.status;
                // se a resposta do servidor for positiva quanto a atualização
                if (respostaAtualizaTarefa == 200) {
                    let checkButton = document.getElementById(`btnCheck-${id}`);
                    if (tarefaCompleta) {
                        listaPendente.appendChild(liTarefa);
                        checkButton.classList.add('bi-clipboard-check');
                        checkButton.classList.remove('bi-arrow-90deg-left');
                    } else {
                        listaFinalizada.appendChild(liTarefa);
                        checkButton.classList.remove('bi-clipboard-check');
                        checkButton.classList.add('bi-arrow-90deg-left');
                    }
                } else if(statusSubmitResponse == 400) {
                    showModalMessage("Oops, tivemos um erro", "ID da tarefa inválido.", false);
                } else if(statusSubmitResponse == 404){
                    showModalMessage("Oops, tivemos um erro", "Tarefa inexistente, atualize a aplicação por favor.", false)
                } else if(statusSubmitResponse == 401){
                    showModalMessage("Oops, tivemos um erro", "Houve um erro na autenticação, realize o login novamente por favor.", false)
                } else {
                    showModalMessage("Oops, tivemos um erro", "Houve um erro no servidor, tente novamente realizar a tarefa", false)
                }
            } else if(statusSubmitResponse == 400) {
                showModalMessage("Oops, tivemos um erro", "ID da tarefa inválido.", false);
            } else if(statusSubmitResponse == 404){
                showModalMessage("Oops, tivemos um erro", "Tarefa inexistente, atualize a aplicação por favor.", false)
            } else if(statusSubmitResponse == 401){
                showModalMessage("Oops, tivemos um erro", "Houve um erro na autenticação, realize o login novamente por favor.", false)
            } else {
                showModalMessage("Oops, tivemos um erro", "Houve um erro no servidor, tente novamente realizar a tarefa", false)
            }
        } catch (err) {
            showModalMessage("Erro na aplicação", err);
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
    }

    // utilizamos a função assincrona pois estamos trabalhando com chamadas a API, o que nos retornará Promises. 
    async function clickDeleteTask(id) {
        try {
            // realizamos a chamada a API e aguardamos ela ser resolvida
            const submitResponse = await deleteTask(configuracaoFetch, id);
            // realizamos a conversão dos dados recebidos da API
            const data = await submitResponse.status
            // capturamos a LI a ser removida
            console.log(data)
            if(data == 200){
                elementExclusion = document.getElementById(`task-${id}`);
                showModalMessage("Sucesso", "Tarefa excluída com sucesso!", true, false);
                // O elemento é removido da tela
                elementExclusion.remove();
            }else if(data == 400){
                showModalMessage("Oops, tivemos um erro", "ID da tarefa inválido.", false, false);
            }else if(data == 401){
                showModalMessage("Oops, tivemos um erro", "Houve um erro na autenticação, realize o login novamente por favor.", false)
            }else if(data == 404){
                showModalMessage("Oops, tivemos um erro", "Tarefa inexistente, atualize a aplicação por favor.", false)
            }else{
                showModalMessage("Oops, tivemos um erro", "Houve um erro no servidor, tente novamente realizar a tarefa", false)
            }
            
        } catch (err) {
            // Exibe uma mensagem de erro caso aconteceça alguma coisa na tentativa de execução
            showModalMessage('Erro na aplicação', err, false, false);
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
    }


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

            let newSpinner = document.getElementById('newTaskSpinner');
            newSpinner.classList.toggle('d-none');

            formTarefa.reset();
        } catch (err){
            // Exibe uma mensagem de erro caso aconteceça alguma coisa na tentativa de execução           
            showModalMessage('Erro na aplicação', err, false);
        }
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
            const statusGetResponse = await getResponse.status;
            const data = await getResponse.json();

            if(statusGetResponse==200){
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
            }else if(data == 400){
                modalUpdateControl.hide();
                showModalMessage("Oops, tivemos um erro", "ID da tarefa inválido.", false);
            }else if(data == 401){
                modalUpdateControl.hide();
                showModalMessage("Oops, tivemos um erro", "Houve um erro na autenticação, realize o login novamente por favor.", false)
            }else if(data == 404){
                modalUpdateControl.hide();
                showModalMessage("Oops, tivemos um erro", "Tarefa inexistente, atualize a aplicação por favor.", false)
            }else{
                modalUpdateControl.hide();
                showModalMessage("Oops, tivemos um erro", "Houve um erro no servidor, tente novamente realizar a tarefa", false)
            }
            
        } catch (err) {
            // caso haja algum erro durante o processamento, um alerta será exibido.
            showModalMessage('Erro na aplicação', err, false);
        }
    }

    // realiza uma chamada à API para atualização dos dados de uma tarefa
    function updateTask(configuracaoFetch, data, id) {
        // Aicionamos os dados da tarefa e o convertemos em JSON
        configuracaoFetch.body = JSON.stringify(data)
        // Definimos o método de requisição
        configuracaoFetch.method = 'PUT';

        return fetch(`${BASE_URL_API}/tasks/${id}`, configuracaoFetch);
    }


    // realiza a atualização dos dados da tarefa tanto na API quanto na Interface
    async function submitUpdateTask(dataUser, id, lastState) {
        try {
            // realizamos o chamado da api e aguardamos sua resposta
            const submitResponse = await updateTask(configuracaoFetch, dataUser, id);
            // aguardamos a resolução da promise e processamos a resposta
            const statusSubmitResponse = await submitResponse.status
            const data = await submitResponse.json();

            // verificamos se o tipo retornado é um objeto, pois em caso de erro, temos o retorno de uma string
            if (statusSubmitResponse == 200) {
                // capturamos os dados e elementos necessários para atualizar a interface
                const completedTask = data.completed;
                let statusLastState = lastState.checked;
                let elementTask = document.getElementById(`task-${id}`);
                let descriptionTask = document.getElementById(`task-description-${id}`);

                // Se não houve mudança do status, alteramos apenas o texto, caso contrário, mudamos os ícones, texto e posição do elemento
                if (completedTask == statusLastState) {
                    descriptionTask.innerText = data.description;
                } else {
                    lastState.checked = completedTask;
                    checkButton = document.getElementById(`btnCheck-${id}`)
                    if (completedTask) {
                        checkButton.classList.remove('bi-clipboard-check');
                        checkButton.classList.add('bi-arrow-90deg-left');
                        descriptionTask.innerText = data.description;
                        listaFinalizada.appendChild(elementTask);
                    } else {
                        checkButton.classList.add('bi-clipboard-check');
                        checkButton.classList.remove('bi-arrow-90deg-left');
                        descriptionTask.innerText = data.description;
                        listaPendente.appendChild(elementTask);
                    }
                }
            } else if(statusSubmitResponse == 400) {
                showModalMessage("Oops, tivemos um erro", "ID da tarefa inválido.", false);
            } else if(statusSubmitResponse == 404){
                showModalMessage("Oops, tivemos um erro", "Tarefa inexistente, atualize a aplicação por favor.", false)
            } else if(statusSubmitResponse == 401){
                showModalMessage("Oops, tivemos um erro", "Houve um erro na autenticação, realize o login novamente por favor.", false)
            } else {
                showModalMessage("Oops, tivemos um erro", "Houve um erro no servidor, tente novamente realizar a tarefa", false)
            }
        } catch (err) {
            showModalMessage("Erro na aplicação", err, false);
        }
    }


    // função OK
    formTarefa.addEventListener('submit', (evento) => {
        evento.preventDefault();

        let btnCreateTask = document.getElementById('createTaskBtn')
        btnCreateTask.disabled = true;

        let newSpinner = document.getElementById('newTaskSpinner');
        newSpinner.classList.toggle('d-none');

        const TAREFA = evento.target['inputNovaTarefa'].value;
        const BODY = {
            description: TAREFA,
            completed: false
        }

        submitCreateTask(BODY);
    });
    // função OK
    modalUpdateTask.addEventListener('show.bs.modal', () => {
        let id = modalUpdateTask.getAttribute('data-id');
        returnTaskToUpdate(configuracaoFetch, id);
    });

    modalMesasage.addEventListener('hidden.bs.modal', ()=> {
        let condition = modalMesasage.getAttribute('data-condition');

        if(condition){
            modalMesasage.setAttribute('data-condition', false)
            window.location.href="login.html";
        }
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
    });

    // Cria as tarefas de acordo com o pedido
    window.addEventListener('load', function () {
        firstLoad()
    })
})();
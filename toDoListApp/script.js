
/*TEST DATA*/
const data = [
    {
        "name" : "Default",
        "avatar" : "1.png",
        "id" : 1,
        "taskLists" : [
            {
                "id" : 0,
                "title": "Sample task list",
                "tasks": "Task 10,Task 20"
            }
        ]
    }
];


/*INIT VARIABLES*/
var users = [];
var currentUser = {};
var selectedTaskList = -1;
var currentTasks = [];

/*GLOBAL VARIABLES*/
let loggedIn = false;

/*LOGIN VIEW ACTIONS*/
function loginSelectedUser(caller){
    users.forEach(user => {
        if(caller.getAttribute("userId") == user.id){
            currentUser = user;
            return;
        }
    });
    toggleLoginView();
    setTimeout(toggleUserTasksView, 500);   
    loggedIn = true;
}

/*NEW USER VIEW ACTIONS*/
function returnFromNewUserView(){
    toggleNewUserView();
    if(loggedIn){
        setTimeout(toggleUserTasksView, 500);  
    }else{
        toggleLoginView();
    }
}

function saveUser(){
    const newUserNickname = document.getElementById("newUserNickname").value;
    const selectedAvatar = document.getElementsByClassName("avatar selected")[0].getAttribute("value");
    if(newUserNickname.replace(/\s/g, '').length <= 0){
        alert("The name field is empty!");
    }else{
        if(loggedIn){
            currentUser.name = newUserNickname;
            currentUser.avatar = selectedAvatar;
            users.forEach(user => {
                if(user.id == currentUser.id){
                    user = currentUser;
                }
            });
        }else{
            const newUser = {};
            newUser.name = newUserNickname;
            newUser.avatar = selectedAvatar;
            newUser.taskLists = [];
            if(users.length <= 0){
                newUser.id = 1;
            }else{
                newUser.id = users[users.length-1].id++;
            }
            users.push(newUser);
        }

        returnFromNewUserView();
    }
}

/*USER TASKS VIEW ACTIONS*/
function logout(){
    toggleUserTasksView();
    setTimeout(toggleLoginView, 200);   
    loggedIn = false;
}

function deleteUser(){
    toggleAlertOverlay();
    initAlertOverlay("Do you really want to delete this profile?",function(){
        logout();
        users.splice(users.indexOf(currentUser),1);
        toggleAlertOverlay();
    });
}

function editUser(){
    toggleNewUserView();
    toggleUserTasksView();
}

function createTaskList(){
    var innerAlert = '<input id="newTaskListName" class="roundedTextBox" type="text" placeholder="Enter new list title!"/>';
    initAlertOverlay(innerAlert, addNewTaskList);
    toggleAlertOverlay();
}

function addNewTaskList(){
    const newTaskListName = document.getElementById("newTaskListName").value;
    if(newTaskListName.replace(/\s/g, '').length <= 0){
        alert("Please write something in the text field");
    }else{

        let lastTaskListId = currentUser.taskLists.length <= 0 ? 0 : currentUser.taskLists[currentUser.taskLists.length-1].id;
        var newTaskList = {};
        newTaskList.id  = lastTaskListId+1;
        newTaskList.title = newTaskListName;
        newTaskList.tasks = "";

        currentUser.taskLists.push(newTaskList);

        initUserTasksView();
        toggleAlertOverlay();
        selectedTaskList = newTaskList.id;
        initSelectedListTasks(selectedTaskList, newTaskList.title, newTaskList.tasks);
        setSelectedListById(selectedTaskList,true);
    }

}

function createTask(){
    var innerAlert = '<input id="newTaskDescription" class="roundedTextBox" type="text" placeholder="Enter task here!"/>';
    initAlertOverlay(innerAlert, addNewTask);
    toggleAlertOverlay();
}

function addNewTask(){
    const newTaskName = document.getElementById("newTaskDescription").value;
    if(newTaskName.replace(/\s/g, '').length <= 0){
        alert("Please write something in the text field");
    }else{
        currentUser.taskLists.forEach(list => {
            if(list.id == selectedTaskList){
                if(list.tasks.length <= 0){
                    list.tasks+=newTaskName+0;
                }else{
                    list.tasks+=","+newTaskName+0;
                }
                initUserTasksView();
                initSelectedListTasks(selectedTaskList, list.title, list.tasks);
                return;
            }
        });
        toggleAlertOverlay();
    }
    
}

function deleteList(){
    const userTaksLists = currentUser.taskLists;

    initAlertOverlay("Do you really want to delete this list?",function(){
        userTaksLists.splice(userTaksLists.indexOf(selectedTaskList),1);
        initUserTasksView();
        toggleAlertOverlay();
    });
    toggleAlertOverlay();
}

function deleteTask(taskToDelete){
    const listTasks = currentUser.taskLists[selectedTaskList].tasks;
    const tasksArray = listTasks.split(',');
    
    initAlertOverlay("Do you really want to delete this task?",function(){
        var updatedTasks = "";
        tasksArray.forEach(task =>{
            if(task != taskToDelete){
                updatedTasks += task+",";
            }
        });
        updatedTasks = updatedTasks.substring(0, updatedTasks.length-1);
        currentUser.taskLists[selectedTaskList].tasks = updatedTasks;
        initUserTasksView();
        initSelectedListTasks(selectedTaskList,currentUser.taskLists[selectedTaskList].title,currentUser.taskLists[selectedTaskList].tasks);
        toggleAlertOverlay();
    });
    toggleAlertOverlay();
}

function checkTask(caller){
    const tasksArray = getSelectedListTasksArray();
    const checkedTask = caller.value;
    for(let i = 0; i < tasksArray.length; i++ ){
        if(tasksArray[i] == checkedTask){
            let state = tasksArray[i].slice(-1) == 1 ? 0 : 1;
            var task = tasksArray[i].slice(0, -1)+state;
            tasksArray[i] = task;
        }
    }
    currentUser.taskLists[selectedTaskList].tasks = tasksFromArrayToString(tasksArray);
    initUserTasksView();
    initSelectedListTasks(selectedTaskList,currentUser.taskLists[selectedTaskList].title,currentUser.taskLists[selectedTaskList].tasks);

}

/*UTILS*/
function getSelectedListTasksArray(){
    const listTasks = currentUser.taskLists[selectedTaskList].tasks;
    const tasksArray = listTasks.split(',');
    return tasksArray;
}

function tasksFromArrayToString(taskArray){
    tasksString = "";
    taskArray.forEach(task =>{
        tasksString += task + ",";
    });
    tasksString = tasksString.slice(0, -1);
    return tasksString;
}


/*INIT VIEW DATA*/
initToDoListApp();
function initToDoListApp(){
    initVariables();
    initLogin();
}

function initVariables(){
    data.forEach(user => {
        users.push(user);
    });
}

function initLogin(){
    const loginUserThumbnails = document.getElementById("loginUserThumbnails");
    var userThumbnail = '';
    users.forEach(user => {
        userThumbnail += '<div class="profile" onclick="loginSelectedUser(this)"'
                        +'userId="'
                        +user.id
                        +'" style="background-image: url(../assets/avatars/'
                        +user.avatar
                        +');">'
                        +'<h3>'
                        + user.name
                        +'</h3>'
                        +'</div>';
    });
    loginUserThumbnails.innerHTML = userThumbnail;
    loggedIn = false;
}

function initAlertOverlay(message,triggerFunction){
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.innerHTML = message;

    const alertOkButton = document.getElementById("alertOkButton");
    alertOkButton.onclick = triggerFunction;

}

function initUserTasksView(){
    const taskActions = document.getElementById("taskActions");
    taskActions.style.maxHeight = "0px";

    const taskListTitle = document.getElementById("taskListTitle");
    taskListTitle.innerHTML = "";

    const listTasks = document.getElementById("listTasks");
    listTasks.innerHTML = "<div style='margin: auto; text-align: center; padding: 5rem; padding-top: 0'>Choose a task list from the menu on the left or click on the plus sign to create a new one!</div>";


    var taskLists = currentUser.taskLists;
    const taskListsList = document.getElementById("taskListsList");
    var taskListsListInnerHtml = "";

    document.getElementById("currentUserName").innerHTML = currentUser.name;
    document.getElementById("currentUserAvatar").style.backgroundImage = "url("+"../assets/avatars/"+currentUser.avatar+")";

    taskLists.forEach(list => {
        taskListsListInnerHtml += '<div class="taskList"'
        +'listId="'+list.id+'"'
        +'onclick="initSelectedListTasks('
        +list.id
        +',\''
        +list.title
        +'\',\''
        +list.tasks
        +'\'); setSelectedList(this)">'
        +list.title
        +'</div>'
    });
    taskListsList.innerHTML = taskListsListInnerHtml;
}

function initSelectedListTasks(id,listTitle, tasks){
    selectedTaskList = id;

    const taskActions = document.getElementById("taskActions");
    taskActions.style.maxHeight = "fit-content";

    const taskListTitle = document.getElementById("taskListTitle");
    taskListTitle.innerHTML = listTitle;
    
    currentTasks = tasks;
    var tasksInnerHtml = "";

    const listTasks = document.getElementById("listTasks");
    const tasksArray = tasks.split(',');

    setSelectedListById(id);

    if(!tasks.length <= 0){
        tasksArray.forEach(task => {
            const isDone = task.slice(-1) == 1 ? "checked" : "";
            const actualTask = task.slice(0, -1);
            
            tasksInnerHtml += '<div class="task"><input type="checkbox"'+isDone+' onchange="checkTask(this)" value="'+task+'"/><p>'
                            +actualTask
                            +'</p><button class="customButton collapsed orange" onclick="deleteTask(\''+task+'\')"><img src="../assets/trashCan.svg"/>Delete</button>'
                            +'</div>';
        });
    }else{
        tasksInnerHtml = "<div style='margin: auto; text-align: center; padding: 5rem; padding-top: 0'>There are no tasks in this list... yet...</div>";
    }
    listTasks.innerHTML = tasksInnerHtml;
    
    
}

function initNewUserView(){
    const newUserNickname = document.getElementById("newUserNickname");
    
    if(loggedIn){
        newUserNickname.value = currentUser.name;
        setSelectedAvatar(currentUser.avatar);
        return;
    }
    newUserNickname.value = "";
    setSelectedAvatar();      
}

/*SELECTION CSS*/
function setSelectedAvatar(name){
    const availableAvatars = Array.from(document.getElementById('availableAvatars').children);
    availableAvatars.forEach(avatar => {
        avatar.classList.remove("selected");
        if(avatar.style.backgroundImage.includes(name)){
            avatar.classList.add("selected");
        }        
    });

    if(!name) {
        availableAvatars[0].classList.add("selected");
    }
    
}

function setSelectedList(listElement){
    Array.from(document.getElementsByClassName("taskList")).forEach(taskList => {
        taskList.classList.remove("selectedList");
    });
    listElement.classList.add("selectedList");
    toggleMenu();
}

function setSelectedListById(id,toggle){
    Array.from(document.getElementsByClassName("taskList")).forEach(taskList => {
        taskList.classList.remove("selectedList");
        if(taskList.getAttribute("listId").match(id)){
            taskList.classList.add("selectedList");
            if(toggle){
                toggleMenu();
            }
        }
    });
}

/*VIEW TOGGLING*/
function toggleAlertOverlay(){
    toggleView('alertOverlay');
}

function toggleLoginView(){
    initLogin();
    toggleView('loginView');
}

function toggleNewUserView(){
    initNewUserView();
    toggleView('newUserView');
      
}

function toggleUserTasksView(){
    initUserTasksView();
    toggleView('userTasksView');
}

function toggleView(id){
    const view = document.getElementById(id);
    const maxHeight = getComputedStyle(view).maxHeight;
    if(!maxHeight.includes("100%")){
        view.style.maxHeight = "100%";
    }else{
        view.style.maxHeight = "0%";
    }
}

function toggleMenu(){
    const menuIsActive = document.getElementById("menuIsActive");
    menuIsActive.checked = !menuIsActive.checked;
}
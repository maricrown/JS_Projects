
/*INIT VARIABLES*/
var users = [];
var currentUser = "";
var currentTaskLists = "";
var currentTaskList = "";
var currentTasks = [];

/*GLOBAL VARIABLES*/
let loggedIn = false;

/*LOGIN VIEW ACTIONS*/
function loginSelectedUser(caller){
    users.forEach(user => {
        if(caller.getAttribute("userId") == user.id){
            currentUser = user;
            currentTaskLists = user.taskLists;
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
    initAlertOverlay("Write your task list's title here!", function(){console.log("hi")});

    toggleAlertOverlay();
}

function addNewTask(){
    toggleAlertOverlay();
}

function editListTitle(){
    const taskListTitle = document.getElementById("taskListTitle");
}

function deleteList(){
    toggleAlertOverlay();
}

/*TEST DATA*/
const data = [
    {
        "name" : "test",
        "avatar" : "1.png",
        "id" : 0,
        "taskLists" : [
            {
                "title": "tasklist1",
                "tasks": ["Make something...0,Make something 1...1"]
            },
            {
                "title": "tasklist2",
                "tasks": ["Make something...1,Make something 2...0"]
                
            }
        ]
    },
    {
        "name" : "test2",
        "avatar" : "2.png",
        "id" : 1,
        "taskLists" : [
            {
                "title": "tasklist1",
                "tasks": ["Make something...0,Make something 2...0"]
            },
            {
                "title": "tasklist2",
                "tasks": ["Make second something...1,Make second something 2...1"]
            }
        ]
    }
];

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
    listTasks.innerHTML = "<div style='margin: auto; text-align: center; padding: 5rem;'>Choose a task list from the menu on the left or click on the plus sign to create a new one!</div>";


    var taskLists = currentUser.taskLists;
    const taskListsList = document.getElementById("taskListsList");
    var taskListsListInnerHtml = "";

    document.getElementById("currentUserName").innerHTML = currentUser.name;
    document.getElementById("currentUserAvatar").style.backgroundImage = "url("+"../assets/avatars/"+currentUser.avatar+")";

    taskLists.forEach(list => {
        taskListsListInnerHtml += '<div class="taskList"'
        +'onclick="initSelectedListTasks(\''
        +list.title
        +'\',\''
        +list.tasks
        +'\'); setSelectedList(this)">'
        +list.title
        +'</div>'
    });
    taskListsList.innerHTML = taskListsListInnerHtml;
}

function initSelectedListTasks(listTitle, tasks){
    const taskActions = document.getElementById("taskActions");
    taskActions.style.maxHeight = "fit-content";

    const taskListTitle = document.getElementById("taskListTitle");
    taskListTitle.innerHTML = listTitle;
    
    currentTasks = tasks;
    var tasksInnerHtml = "";
    const listTasks = document.getElementById("listTasks");
    const tasksArray = tasks.split(',');
    tasksArray.forEach(task => {
        const isDone = task.slice(-1) == 1 ? "checked" : "";
        const actualTask = task.slice(0, -1);
        
        tasksInnerHtml += '<div class="task"><input type="checkbox"'+isDone+'/><p>'
                        +actualTask
                        +'</p><button class="customButton collapsed orange" onclick="toggleAlertOverlay()"><img src="../assets/trashCan.svg"/>Delete</button>'
                        +'</div>';
    });
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
    })
    listElement.classList.add("selectedList");
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
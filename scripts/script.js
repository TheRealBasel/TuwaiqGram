let localPosition = "";
function switchForm (button){
    let loginForm = document.getElementById("login_form");
    let registerForm = document.getElementById("register_form");
    if ( button.id === "loginText"){
        loginForm.classList = "";
        registerForm.classList = "d-none";
    }else if ( button.id === "registerText"){
        loginForm.classList = "d-none";
        registerForm.classList = "";
    }
}

function register (){
    let username = document.getElementById("register_username").value;
    let password = document.getElementById("register_password").value;
    let alertArea = document.getElementById("register_alert_area");
    if ( username && password && username != "" && password != ""){
        fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/user?username=${username}`)
        .then((res) => res.json())
        .then(function (json) {
            if ( json[0] && json[0].username && json[0].username === username ){
                alertArea.innerHTML = `<div class="alert alert-danger" role="alert">
                Username <b>${username}</b> Already taken.
              </div>`;
            }else{
                fetch('https://616c999637f997001745d6ce.mockapi.io/api/v1/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username:username,
                    password:password,
                }),
                })
                .then(response => response.json())
                .then(data => {
                    alertArea.innerHTML = `<div class="alert alert-success" role="alert">
                    Account created with username <b>${username}</b>. You can login now.
                  </div>`;
                })
                .catch((error) => {
                    alertArea.innerHTML = `<div class="alert alert-success" role="alert">
                    Error: <b>${error}</b>.
                  </div>`;
                });

            }
        });
    }
}

function login (){
    let username = document.getElementById("login_username").value;
    let password = document.getElementById("login_password").value;
    let alertArea = document.getElementById("login_alert_area");
    if ( username && password && username != "" && password != ""){
        fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/user?username=${username}`)
        .then((res) => res.json())
        .then(function (json) {
            if ( json[0] && json[0].username && json[0].username === username && json[0].password === password ){
                sessionStorage.setItem("login", json[0].id);
                let logginBtn = document.getElementById("login_button");
                let logoutBtn = document.getElementById("logout_button");
                logginBtn.classList = "btn btn-outline-success d-none";
                logoutBtn.classList = "btn btn-outline-danger";
                var loginModal = document.getElementById('loginModal');
                var modal = bootstrap.Modal.getInstance(loginModal);
                modal.hide();
            }else{
                alertArea.innerHTML = `<div class="alert alert-danger" role="alert">
                Check your login info.
              </div>`;
            }
        });
    }
}

function logout (){
    if ( isLoggedIn() ){
        sessionStorage.removeItem("login");
        let logginBtn = document.getElementById("login_button");
        let logoutBtn = document.getElementById("logout_button");
        logginBtn.classList = "btn btn-outline-success";
        logoutBtn.classList = "btn btn-outline-danger d-none";
    }
}


function changeUiByUser (){
    let logginBtn = document.getElementById("login_button");
    let logoutBtn = document.getElementById("logout_button");
    if ( isLoggedIn() ){
        logginBtn.classList = "btn btn-outline-success d-none";
        logoutBtn.classList = "btn btn-outline-danger";
    }else{
        logginBtn.classList = "btn btn-outline-success";
        logoutBtn.classList = "btn btn-outline-danger d-none";
    }
}
changeUiByUser();

function isLoggedIn (){
    return sessionStorage.getItem("login");
}

function createNewPost(){
    if ( isLoggedIn() ){
        let imageFile = document.getElementById("postImageInput").files[0];
        let postCaption = document.getElementById("postCaptionInput");
        let postLocationCheck = document.getElementById("locationCheck");
        if ( imageFile && imageFile['type'].split('/')[0] === 'image' ){
            getBase64(imageFile).then(
                function (data){
                    if ( data && data != ""){
                        // GET Location name if checkbox is checked
                        postLocation = ""
                        if ( postLocationCheck.checked ){
                            postLocation = localPosition;
                        }
                        
                        // add post
                        fetch('https://616c999637f997001745d6ce.mockapi.io/api/v1/post', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                user:isLoggedIn(),
                                post:data,
                                caption:postCaption.value,
                                location:postLocation,
                            }),
                            })
                            .then(response => response.json())
                            .then(data => {
                                location.reload(); 
                            })
                            .catch((error) => {
                                console.log ( error );
                            }
                        );
                    }
                }
            );
        }
    }else{
        document.getElementById("post_alert_area").innerHTML = `<div class="alert alert-danger" role="alert">
        You need to login first.
      </div>`;
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function allowLocation (){
    navigator.geolocation.getCurrentPosition(success, error);
    function success (position){
        localPosition = [position.coords.latitude, position.coords.longitude];
    }
    function error (err){
        console.log ( err );
    }
}

function getUserLocation (){
    navigator.geolocation.getCurrentPosition(success, error);

    function success(position) {
        localPosition = [position.coords.latitude, position.coords.longitude];
    }

    function error(err) {
        console.log(err)
    }
    localPosition =  "";
}

function listPostsToHomePage (){
    let postsSection = document.getElementById("posts");
    fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post`)
    .then((res) => res.json())
    .then(function (json) {
        json.sort(function(x, y){
            return y.createdAt - x.createdAt;
        })
        for (let i = 0; i < json.length; i++) {
            const post = json[i];
            fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/user?id=${post.user}`)
            .then((res) => res.json())
            .then(function (userJson) {
                const user = userJson[0];
                let postRow = document.createElement("div");
                postRow.classList = "row justify-content-center";
                postsSection.appendChild(postRow);
                let postCard = document.createElement("div");
                postCard.classList = "col-12 col-lg-4 card mb-5";
                postCard.style = "";//"width: 32rem;";
                postCard.id = `post_${post.id}_card`;
                postCard.innerHTML = `
                <div class="card-body d-flex">
                    <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg" alt="" class="rounded-circle" width="10%">
                    <div class="d-grid align-self-center m-0">
                        <h6 id="post_creator_name" class="m-0">${user.username}</h6>
                        ${ (post.location != "") ? "<small><i class=\"fa fa-map-marker-alt me-1\"></i><span id=\"post_location_name\" class=\"text-primary\">Tuwaiq Bootcamp</span></small>" : "" }
                    </div>
                </div>
                <img id="post_image" src="${post.post}" class=" border-top border-bottom" alt="...">
                <div class="card-body pb-0 pt-1 d-flex align-items-center">
                    <span onclick="likePost(${post.id})"id="post_like_icon_${post.id}" style="font-size: 24px;">
                        <i class="far fa-heart"></i>
                    </span>
                    <span id="post_likes_count_${post.id}" class="ps-1">0</span>
                </div>
                <div class="card-body pt-0">
                    ${ (post.caption != "") ? '<span id="post_body">' + user.username + '   <small class="card-text pb-2">' + post.caption + '</small></span>' : "" }
                    <div class="pb-3"></div>
                    <small onclick="showComments(${post.id})" id="post_comments_input_${post.id}" class="text-secondary" role="button" data-bs-toggle="modal" data-bs-target="#commentsModal">0 Comments</small>
                    <hr class="m-0 p-0 mt-2">
                    <div class="input-group m-0 p-0">
                        <input id="comment_input_${post.id}" type="text" class="form-control border-0" placeholder="Add a comment..." >
                        <button onclick="addComment(${post.id})"id="comment_post_button" class="btn text-primary" type="button">Post</button>
                    </div>
                </div>`
                postRow.appendChild(postCard);
                initPostInfomation (post.id);
            });
        }
    });
}
function listMyPosts (){
    let postsSection = document.getElementById("posts");
    fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post?user=${isLoggedIn()}`)
    .then((res) => res.json())
    .then(function (json) {
        json.sort(function(x, y){
            return y.createdAt - x.createdAt;
        })
        for (let i = 0; i < json.length; i++) {
            const post = json[i];
            fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/user?id=${post.user}`)
            .then((res) => res.json())
            .then(function (userJson) {
                const user = userJson[0];
                let postRow = document.createElement("div");
                postRow.classList = "row justify-content-center";
                postsSection.appendChild(postRow);
                let postCard = document.createElement("div");
                postCard.classList = "col-12 col-lg-4 card mb-5";
                postCard.style = "";//"width: 32rem;";
                postCard.id = `post_${post.id}_card`;
                postCard.innerHTML = `
                <div class="card-body d-flex">
                    <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg" alt="" class="rounded-circle" width="10%">
                    <div class="d-grid align-self-center m-0">
                        <h6 id="post_creator_name" class="m-0">${user.username}</h6>
                        ${ (post.location != "") ? "<small><i class=\"fa fa-map-marker-alt me-1\"></i><span id=\"post_location_name\" class=\"text-primary\">Tuwaiq Bootcamp</span></small>" : "" }
                    </div>
                </div>
                <img id="post_image" src="${post.post}" class=" border-top border-bottom" alt="...">
                <div class="card-body pb-0 pt-1 d-flex align-items-center">
                    <span onclick="likePost(${post.id})"id="post_like_icon_${post.id}" style="font-size: 24px;">
                        <i class="far fa-heart"></i>
                    </span>
                    <span id="post_likes_count_${post.id}" class="ps-1">0</span>
                </div>
                <div class="card-body pt-0">
                    ${ (post.caption != "") ? '<span id="post_body">' + user.username + '   <small class="card-text pb-2">' + post.caption + '</small></span>' : "" }
                    <div class="pb-3"></div>
                    <small onclick="showComments(${post.id})" id="post_comments_input_${post.id}" class="text-secondary" role="button" data-bs-toggle="modal" data-bs-target="#commentsModal">0 Comments</small>
                    <hr class="m-0 p-0 mt-2">
                    <div class="input-group m-0 p-0">
                        <input id="comment_input_${post.id}" type="text" class="form-control border-0" placeholder="Add a comment..." >
                        <button onclick="addComment(${post.id})"id="comment_post_button" class="btn text-primary" type="button">Post</button>
                    </div>
                </div>`
                postRow.appendChild(postCard);
                initPostInfomation (post.id);
            });
        }
    });
}

function initPostInfomation (id){
    // Likes
    fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${id}/like`)
    .then((res) => res.json())
    .then(function (json) {
        document.getElementById("post_likes_count_"+id).innerHTML = `${json.length}`;
        for (let i = 0; i < json.length; i++) {
            const like = json[i];
            if ( like ){
                if ( like.user === isLoggedIn()){
                    document.getElementById("post_like_icon_"+id).style = "font-size: 24px; color: red;";
                }
            }
        }
    });

    // Comments
    fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${id}/comments`)
    .then((res) => res.json())
    .then(function (json) {
        document.getElementById("post_comments_input_"+id).innerHTML = `${json.length} Comments`;
    });
}

function likePost (post){
    if ( isLoggedIn() ){
        fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${post}/like?user=${isLoggedIn()}`)
        .then((res) => res.json())
        .then(function (json) {
            if ( json.length > 0 ){
                fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${post}/like/${json[0].id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    })
                    .then(response => response.json())
                    .then(data => {
                        initPostInfomation (post);
                        document.getElementById("post_like_icon_"+post).style = "font-size: 24px;";


                    })
                    .catch((error) => {
                        console.log ( error );
                    }
                );
            }else{
                fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${post}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user:isLoggedIn(),
                    }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        initPostInfomation (post);
                    })
                    .catch((error) => {
                        console.log ( error );
                    }
                );
            }
        });
    }
}

function showComments (post){
    let modalBody = document.getElementById("commentsModalBody");
    modalBody.innerHTML = "";
    fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${post}/comments`)
    .then((res) => res.json())
    .then(function (json) {
        if ( json.length > 0 ){
            for (let i = 0; i < json.length; i++) {
                const comment = json[i];
                if ( comment ){
                    fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/user?id=${comment.user}`)
                    .then((res) => res.json())
                    .then(function (userJson) {
                        let commentElement = document.createElement("div")
                        commentElement.innerHTML = `<b>${userJson[0].username}</b> : ${comment.comment}`;
                        modalBody.appendChild(commentElement);    
                    });
                }
            }
        }else{
            modalBody.innerHTML = "<h4>No Comments</h4>";
        }

    });
}


function addComment ( post ){
    if ( isLoggedIn() ){
        let commentText = document.getElementById("comment_input_"+post).value;
        if ( commentText && commentText != "" ){
            fetch(`https://616c999637f997001745d6ce.mockapi.io/api/v1/post/${post}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user:isLoggedIn(),
                    comment:commentText,
                }),
                })
                .then(response => response.json())
                .then(data => {
                    initPostInfomation (post);
                    commentText = "";
                })
                .catch((error) => {
                    console.log ( error );
                }
            );
        }
    }
}
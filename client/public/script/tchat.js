let socket = io.connect("http://localhost:8002/");

let contact = document.querySelector(".contacts");
let mylogin = document.querySelector("#me").textContent;
let chat = document;
let disc = document.querySelector(".disc");
let membres = null;
let AllLink = null;
let me = null;
let form = document.querySelector("#form");
let headerMessage = document.querySelector(".card-header.msg_head");
let bodyMessage = document.querySelector(".card-body.msg_card_body");

socket.emit("nvClient", mylogin);

disc.addEventListener("click", () => {
  socket.emit("deconnexion");
});
socket.on("allUsers", (users) => {
  contact.innerHTML = "";
  membres = [...users];
  for (user of users) {
    console.log(user.messages);
    if (user.login == mylogin) {
      me = user;
      continue;
    }
    let li = createBlock("li");
    let div1 = createBlock("div");
    let divImg = createBlock("div");
    let imgUser = createBlock("img");
    let span = createBlock("span");
    let divInfo = createBlock("div");
    let span2 = createBlock("span");
    let p = createBlock("p");
    let a = createBlock("a");

    a.href = "#" + user.id;

    imgUser.src = "images/profile.jpeg";
    imgUser.className = "rounded-circle user_img";
    span.className = user.connect ? "online_icon" : "online_icon offline";
    p.innerHTML =
      user.login + (user.connect ? "online" : " offline " + user.last);
    div1.className = "d-flex bd-highlight";
    divImg.className = "img_cont";
    divInfo.className = "user_info";
    span2.innerHTML = user.login;

    li.appendChild(div1);
    divImg.appendChild(imgUser);
    divImg.appendChild(span);
    div1.appendChild(divImg);
    divInfo.appendChild(span2);
    divInfo.appendChild(p);
    a.appendChild(divInfo);
    div1.appendChild(a);
    contact.appendChild(li);

    /***** Created Header Message */

    let card = createBlock("div");
    card.className = "card";
    let cardH = createBlock("div");
    cardH.className = "card_header";
  }
  AllLink = document.querySelectorAll(".d-flex.bd-highlight a");

  AllLink.forEach((link) => {
    let lien = link;
    let m_msg = "";
    link.addEventListener("click", (e) => {
      let p = lien.parentNode.parentNode;
      p.className = "active";
      disableAllLink(lien);
      bodyMessage.innerHTML = "";
      e.preventDefault();
      let userId = lien.href.substring(lien.href.indexOf("#") + 1);
      let user = membres.filter((m) => m.id == userId);
      let messagesMe = me.messages.filter(
        (m) => m.dest == user[0].id || m.env == user[0].id
      );
      let messageUser = user[0].messages.filter(
        (m) => m.dest == user[0].id || m.env == user[0].id
      );
      let messages = [...messagesMe, ...messageUser];

      let Header = `
      <div class="d-flex bd-highlight">
        <div class="img_cont">
          <img
            src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
            class="rounded-circle user_img"
          />
          <span class="online_icon"></span>
        </div>
        <div class="user_info" id="dest">
          <span>Chat with ${user[0].login}</span>
          <p>${messages.length}</p>
        </div>
        <div class="video_cam">
          <span><i class="fas fa-video"></i></span>
          <span><i class="fas fa-phone"></i></span>
        </div>
      </div>
      <span id="action_menu_btn"
        ><i class="fas fa-ellipsis-v"></i
      ></span>
      <div class="action_menu">
        <ul>
          <li><i class="fas fa-user-circle"></i> View profile</li>
          <li><i class="fas fa-users"></i> Add to close friends</li>
          <li><i class="fas fa-plus"></i> Add to group</li>
          <li><i class="fas fa-ban"></i> Block</li>
        </ul>
      </div>
      `;

      for (message of messages) {
        if (message.env == me.id) {
          m_msg += `
          <div class="d-flex justify-content-start mb-4">
          <div class="img_cont_msg">
            <img
              src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
              class="rounded-circle user_img_msg"
            />
          </div>
          <div class="msg_cotainer">
            ${message.msg}
            <span class="msg_time">${message.date}</span>
          </div>
        </div>`;
        } else if (message.dest == me.id) {
          m_msg += `
          <div class="d-flex justify-content-end mb-4">
          
          <div class="msg_cotainer_send">
            ${message.msg}
            <span class="msg_time_send">${message.date}</span>
          </div>
          <div class="img_cont_msg">
            <img
              src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
              class="rounded-circle user_img_msg"
            />
          </div>
        </div>`;
        }
      }

      headerMessage.innerHTML = Header;
      bodyMessage.innerHTML = m_msg;
      scrollBody();
    });
  });
});
("");

socket.on("nv_msg", (msg) => {
  let m_msg = "";
  if (msg.env == me.id) {
    m_msg = `
    <div class="d-flex justify-content-start mb-4">
    <div class="img_cont_msg">
      <img
        src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
        class="rounded-circle user_img_msg"
      />
    </div>
    <div class="msg_cotainer">
      ${msg.msg}
      <span class="msg_time">${msg.date}</span>
    </div>
  </div>`;
  } else if (msg.dest == me.id) {
    m_msg = `
    <div class="d-flex justify-content-end mb-4">
    
    <div class="msg_cotainer_send">
      ${msg.msg}
      <span class="msg_time_send">${msg.date}</span>
    </div>
    <div class="img_cont_msg">
      <img
        src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
        class="rounded-circle user_img_msg"
      />
    </div>
  </div>`;
  }

  bodyMessage.innerHTML += m_msg;
  scrollBody();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let dest = document.querySelector("#dest span").textContent.substr(10);
  let destId = membres.filter((m) => m.login == dest);
  let msg = document.querySelector("#msg");
  console.log(destId);
  socket.emit("nv_msg", {
    env: me.id,
    msg: msg.value,
    dest: destId[0].id,
    send: true,
    date: new Date(),
  });
  msg.value = "";
});

let search = document.querySelector("#search");

search.addEventListener("input", (e) => {
  let li = document.querySelectorAll("li .d-flex.bd-highlight");

  for (l of li) {
    let user = l.children[1].children[0].children[0].textContent.toLowerCase();

    if (!user.includes(search.value)) {
      l.parentNode.style.display = "none";
    } else {
      l.parentNode.style.display = "block";
    }
  }

  if (search.value === "") {
    for (l of li) {
      l.parentNode.style.display = "block";
    }
  }
});

function createBlock(b) {
  let block = document.createElement(b);
  return block;
}

function disableAllLink(l) {
  AllLink.forEach((link) => {
    if (l != link) {
      link.parentNode.parentNode.className = "";
    }
  });
}

function scrollBody() {
  bodyMessage.scroll(0, bodyMessage.scrollHeight);
}

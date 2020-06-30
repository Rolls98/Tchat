let socket = io();
let song_recv = new Audio("../musics/me-too.mp3");
let song_write = new Audio("../musics/time-is-now.mp3");
let typingTimer = null;
let doneTypingInterval = 1000;
let contact = document.querySelector(".contacts");
let mylogin = document.querySelector("#me").textContent;
//let chat = document;
let disc = document.querySelector(".disc");
let membres = null;
let AllLink = null;
let me = null;
let form = document.querySelector("#form");
let headerMessage = document.querySelector(".card-header.msg_head");
let bodyMessage = document.querySelector(".card-body.msg_card_body");
let linkActive = document.querySelector("a");

socket.emit("nvClient", mylogin);

disc.addEventListener("click", () => {
  socket.emit("deconnexion");
});
socket.on("allUsers", (users) => {
  contact.innerHTML = "";
  membres = [...users].sort(filterByOnline).sort(filterByHoursMessage);
  let tabme = membres.filter((m) => m.login == mylogin);
  me = tabme[0];
  for (user of membres) {
    if (user.login == mylogin) {
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
    let notif = createBlock("span");
    let lastMsg = createBlock("span");

    lastMsg.className = "lastMsg";
    let userLast = user.messages[user.messages.length - 1];

    a.href = "#" + user.id;

    lastMsg.innerHTML =
      userLast.msg.substr(0, 14) +
      (userLast.msg.length > 15 ? "..." : " ") +
      (userLast.env == me.id && userLast.see == false
        ? ' <i class="fa fa-eye" aria-hidden="true"></i>'
        : " ");

    console.log(userLast);
    if (linkActive.href.substr(linkActive.href.indexOf("#") + 1) == user.id) {
      console.log("test");
      li.className = "active";
    } else {
      li.className = "";
    }

    let notvisiteMessage = user.messages.filter(
      (m) => m.see == false && m.env == me.id
    );

    imgUser.src = "images/profile.jpeg";
    imgUser.className = "rounded-circle user_img";
    notif.className = "notif";
    span.className = user.connect ? "online_icon" : "online_icon offline";
    p.innerHTML =
      user.login +
      (user.connect
        ? " online"
        : " offline " + moment(new Date(user.last)).fromNow());
    div1.className = "d-flex bd-highlight";
    divImg.className = "img_cont";
    divInfo.className = "user_info";
    notif.innerHTML =
      notvisiteMessage.length > 0 ? notvisiteMessage.length : "";
    span2.innerHTML = user.login;

    li.appendChild(div1);
    divImg.appendChild(imgUser);
    divImg.appendChild(span);
    div1.appendChild(divImg);
    divInfo.appendChild(span2);
    divInfo.appendChild(p);
    divInfo.appendChild(notif);
    divInfo.appendChild(lastMsg);
    a.appendChild(divInfo);
    div1.appendChild(a);
    contact.appendChild(li);

    /***** Created Header Message */
  }
  AllLink = document.querySelectorAll(".d-flex.bd-highlight a");

  AllLink.forEach((link) => {
    let lien = link;

    link.addEventListener("click", (e) => {
      $("#msg")[0].value = "";
      linkActive = lien;
      ActualiseMsg(membres, lien, me);
      scrollBody();
    });
  });
});

function ActualiseMsg(all, lien, me) {
  let m_msg = "";
  bodyMessage.innerHTML = "";

  let userId = lien.href.substring(lien.href.indexOf("#") + 1);
  let user = all.filter((m) => m.id == userId);
  seeAllMessages(user[0]);
  let messagesMe = me.messages.filter(
    (m) => m.dest == user[0].id || m.env == user[0].id
  );

  let messages = [...messagesMe];

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
          <p>${messages.length} message(s)</p>
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
    if (message.dest == me.id) {
      m_msg += `
          <div class="d-flex justify-content-start mb-4">
          <div class="img_cont_msg">
            <img
              src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
              class="rounded-circle user_img_msg"
            />
          </div>
          <div class="msg_cotainer">
          ${
            message.msg +
            (message.see == true
              ? '  <i class="fa fa-eye" aria-hidden="true"></i>'
              : "")
          }
            <span class="msg_time">${moment(new Date(message.date)).format(
              "hh:mm:ss , dddd"
            )}</span>
          </div>
        </div>`;
    } else if (message.env == me.id) {
      m_msg += `
          <div class="d-flex justify-content-end mb-4">
          
          <div class="msg_cotainer_send">
            ${message.msg}
            <span class="msg_time_send">${moment(new Date(message.date)).format(
              "hh:mm:ss , dddd"
            )}</span>
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
  m_msg = "";
  scrollBody();
}

socket.on("nv_msg", (msg) => {
  let m_msg = "";
  if (msg.dest == me.id) {
    song_recv.play();
  }
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
        ${
          msg.msg +
          (msg.see == true
            ? '  <i class="fa fa-eye" aria-hidden="true"></i>'
            : "")
        }
        <span class="msg_time">${msg.date}</span>
      </div>
    </div>`;
  } else if (
    msg.dest == me.id &&
    linkActive.href.substr(linkActive.href.indexOf("#") + 1) == msg.env
  ) {
    let usr = membres.filter((user) => user.id == msg.env);
    seeAllMessages(usr[0]);
    ActualiseMsg(membres, linkActive, me);
    m_msg = `
      <div class="d-flex justify-content-end mb-4">
      
      <div class="msg_cotainer_send">
        ${msg.msg}
        <span class="msg_time_send">${moment(new Date(msg.date)).format(
          "hh:mm:ss, dddd"
        )}</span>
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
  ActualiseMsg(membres, linkActive, me);
  scrollBody();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let dest = document.querySelector("#dest span").textContent.substr(10);
  let destId = membres.filter((m) => m.login == dest);
  let msg = document.querySelector("#msg");

  if (msg.value.trim() != "") {
    socket.emit("nv_msg", {
      env: me.id,
      msg: msg.value,
      dest: destId[0].id,
      send: true,
      date: new Date(),
      see: false,
    });
  } else {
    msg.value = "";
  }
  msg.value = "";
});

let search = document.querySelector("#search");

search.addEventListener("input", (e) => {
  let li = document.querySelectorAll("li .d-flex.bd-highlight");

  for (l of li) {
    let user = l.children[1].children[0].children[0].textContent.toLowerCase();

    if (!user.includes(search.value.toLowerCase())) {
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

$("#msg")[0].oninput = () => {
  let destId = linkActive.href.substr(linkActive.href.indexOf("#") + 1);
  socket.emit("write", { id: me.id, dest: destId });
};

$("#msg").keyup(function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

socket.on("write", (client) => {
  if (client.dest == me.id) {
    let writen = `
    <div class="d-flex justify-content-end mb-4 user-writen">
    <div class="msg_cotainer_send">
      <div class="spinner">
        <div class="bounce1">
        </div>
        <div class="bounce2">
        </div>
        <div class="bounce3">
      </div>
</div>
    </div>
    <div class="img_cont_msg">
      <img
        src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
        class="rounded-circle user_img_msg"
      />
    </div>
    
  </div>
    
    `;

    if (linkActive.href.substr(linkActive.href.indexOf("#") + 1) == client.id) {
      if ($(".user-writen").length == 0) {
        song_write.play();
        bodyMessage.innerHTML += writen;
        scrollBody();
      } else {
        if (song_write.paused) {
          setTimeout(() => {
            song_write.play();
          }, 1000);
        }
      }
    }

    let meLink = [...AllLink].filter((a) => a.href.includes(client.id));
    meLink[0].children[0].children[1].innerHTML = "écrit...";
    meLink[0].children[0].children[1].style =
      "color:blue;font-size:22px;font-weight:bold";
  }
});

socket.on("nowrite", (client) => {
  if (client.dest == me.id) {
    let userWrite = $(".user-writen");
    if (userWrite.length > 0) {
      userWrite[0].classList.add("hidden");
      setTimeout(() => userWrite.remove(), 200);
    }
    let meLink = [...AllLink].filter((a) => a.href.includes(client.id));
    let user = [...membres].filter((a) => a.id == client.id);
    meLink[0].children[0].children[1].style = "";
    meLink[0].children[0].children[1].innerHTML =
      user[0].login +
      (user[0].connect
        ? " online"
        : " offline " + moment(new Date(user[0].last)).fromNow());
  }
});

function doneTyping() {
  let destId = linkActive.href.substr(linkActive.href.indexOf("#") + 1);
  socket.emit("nowrite", { id: me.id, dest: destId });
}

function createBlock(b) {
  let block = document.createElement(b);
  return block;
}

function disableAllLink(l) {
  AllLink.forEach((link) => {
    if (l.href != link.href) {
      link.parentNode.parentNode.className = "";
    }
  });
}

function scrollBody() {
  bodyMessage.scroll(0, bodyMessage.scrollHeight);
}

function filterByOnline(a, b) {
  if (a.connect == true && b.connect == false) return -1;
  if (b.connect == true && a.connect == false) return 1;
  return 0;
}

function filterByHoursMessage(a, b) {
  let lastA = a.messages[a.messages.length - 1];
  let lastB = b.messages[b.messages.length - 1];
  let dateA = new Date(lastA.date);
  let dateB = new Date(lastB.date);

  if (dateA > dateB) return -1;
  if (dateA < dateB) return 1;

  return 0;
}

function seeAllMessages(us) {
  if (us.messages != undefined) {
    us.messages.forEach((m) => {
      if (m.see == false && m.env == me.id) {
        m.see = true;
      }
    });
    socket.emit("updateMessage", { login: us.login, messages: us.messages });
  }
}

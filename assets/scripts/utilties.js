import { loader, main } from "./index.js";

// ---------- References ----------
const baseURL = "https://jsonplaceholder.typicode.com";
// -- parses --
const usersFromLS = JSON.parse(localStorage.getItem("usersLS"));
const postsFromLS = JSON.parse(localStorage.getItem("postsLS"));

async function createPostCard(user) {
  const userPosts = await mapPosts();
  const userPostsForThisUser = userPosts[user.id];

  if (!userPostsForThisUser || userPostsForThisUser.length === 0) {
    return "<p>No posts found.</p>";
  }

  // Card formatting for posts
  let card = "";
  for (let post of userPostsForThisUser) {
    card += /*html*/ `
      <article class="post-card" id="post-${post.id}">
        <h3 class="username">${user.username}</h3>
        <p class="post-title">Title: ${post.title}</p>
        <p class="post-content">"${post.body}"</p>
      </article>
    `;
  }
  return card;
}

// Card format for Users
function createUserCard(user) {
  const card = /*html*/ `
        <article class="card" id="${user.id}">
            <h3 class="name">${user.name}</h3>
            <p class="username">username: ${user.username}</p>
            <p class="phone">Phone: ${user.phone}</p>
            <p class="email">Email: ${user.email}</p>
            </article>
            `;

  return card;
}

// Individual User page
async function createUserPage(user) {
  const postCard = await createPostCard(user); // Await the result of createPostCard
  const userPage = /*html*/ `
    <section class="user-page">
      <h3 class="name">${user.name}</h3>
      <p class="username">username: ${user.username}</p>
      <p class="phone">Phone: ${user.phone}</p>
      <p class="email">Email: ${user.email}</p>
      <div class="address">
        <p>${user.address.city}</p>
        <p>${user.address.street}</p>
      </div>
      <div class="actions">
        <button id="back-btn">Back to user list</button>
        <button id="show-hide-button">Show posts</button>
      </div>
      <div class="user-posts">
        ${postCard}
      </div>
    </section>
  `;

  return userPage;
}

// Fetch posts
export async function getAllPosts() {
  if (!postsFromLS) {
    // I pretty much did the same function as for getAllUsers()
    const res = await fetch(baseURL + "/posts");
    const posts = await res.json();
    const postsLS = JSON.stringify(posts);
    localStorage.setItem("postsLS", postsLS);
    return posts;
  }
  return postsFromLS;
}

export async function getAllUsers() {
  // If localStorage users entry is empty,
  // fetch from API.
  if (!usersFromLS) {
    const res = await fetch(baseURL + "/users");
    const users = await res.json();
    const usersLS = JSON.stringify(users);
    localStorage.setItem("usersLS", usersLS);
    return users;
  }
  // Else fetch from LS.
  return usersFromLS;
}

// Get a user by ID primarily from LS, otherwise from API.
async function getUserById(userId) {
  const userLS = usersFromLS.find((e) => e.id == userId);
  if (!userLS) {
    const res = await fetch(baseURL + `/users/${userId}`);
    const user = await res.json();
    return user;
  }
  return userLS;
}

// Map posts from getAllPosts() by user ID.
export async function mapPosts() {
  const posts = await getAllPosts();

  let mappedPosts = {};
  for (let post of posts) {
    if (!mappedPosts[post.userId]) {
      mappedPosts[post.userId] = [];
    }
    mappedPosts[post.userId].push(post);
  }

  return mappedPosts;
}

// Direct user to individual page when a card is clicked.
async function handleOnCardClick(card) {
  insertLoaderToDOM();
  const user = await getUserById(card.id); // Wait for user data
  const userPageAsHtmlString = await createUserPage(user); // Await the result of createUserPage
  main.innerHTML = userPageAsHtmlString; // Now insert the resolved HTML string
}

// Handle backbutton by displaying loader before using existing commands to replace the dom again.
function handleBackClick(backBtn) {
  insertLoaderToDOM();
  getAllUsers().then((users) => {
    insertUsersToDOM(users);
  });
}

// Handle all clicks.
export function handleOnClick(event) {
  const { target } = event;

  const closestCard = target.closest(".card");
  const closestBackBtn = target.closest("#back-btn");
  const closestShowHideBtn = target.closest("#show-hide-button");

  if (closestCard) {
    handleOnCardClick(closestCard);
  }
  if (closestBackBtn) {
    handleBackClick(closestBackBtn);
  }
  if (closestShowHideBtn) {
    handleShowHideClick(closestShowHideBtn);
  }
}

function handleShowHideClick(button) {
  const userPostsContainer = document.querySelector(".user-posts");
  userPostsContainer.classList.toggle("show");

  // Change button text depending on visibility
  if (userPostsContainer.classList.contains("show")) {
    button.textContent = "Hide posts";
  } else {
    button.textContent = "Show posts";
  }
}

function insertLoaderToDOM() {
  main.innerHTML = loader.outerHTML;
}

export function insertUsersToDOM(users) {
  const usersAsHtmlString = users.map((user) => createUserCard(user)).join("");
  main.innerHTML = usersAsHtmlString;
}

'use strict';

// Практическое задание 3Б.
// Справочник пользователей с использованием REST API.

const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadUsersBtn = document.getElementById('load-users-btn');
const searchInput = document.getElementById('search-input');
const statusEl = document.getElementById('status');
const userList = document.getElementById('user-list');
const postsStatusEl = document.getElementById('posts-status');
const postsList = document.getElementById('posts-list');

let allUsers = [];
let postsLoading = false;

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = type ? `status ${type}` : 'status';
}

function setPostsStatus(message, type = '') {
  postsStatusEl.textContent = message;
  postsStatusEl.className = type ? `status ${type}` : 'status';
}

function clearElement(element) {
  element.textContent = '';
}

function createMessage(text, className = 'message') {
  const message = document.createElement('p');
  message.textContent = text;
  message.className = className;
  return message;
}

function setPostButtonsDisabled(disabled) {
  const buttons = userList.querySelectorAll('button');

  buttons.forEach((button) => {
    button.disabled = disabled;
  });
}

function renderUsers(users) {
  clearElement(userList);

  if (!users.length) {
    userList.appendChild(createMessage('Пользователи не найдены'));
    return;
  }

  users.forEach((user) => {
    const card = document.createElement('article');
    card.className = 'user-card';

    const name = document.createElement('h3');
    name.textContent = user.name;

    const email = document.createElement('p');
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement('p');
    const cityValue = user.address && user.address.city ? user.address.city : 'Не указан';
    city.textContent = `Город: ${cityValue}`;

    const postsButton = document.createElement('button');
    postsButton.type = 'button';
    postsButton.textContent = 'Показать публикации';
    postsButton.disabled = postsLoading;

    postsButton.addEventListener('click', () => {
      loadPosts(user.id, user.name);
    });

    card.append(name, email, city, postsButton);
    userList.appendChild(card);
  });
}

function renderPosts(posts) {
  clearElement(postsList);

  if (!posts.length) {
    postsList.appendChild(createMessage('Публикации не найдены'));
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'post-card';

    const title = document.createElement('h3');
    title.textContent = post.title;

    const body = document.createElement('p');
    body.textContent = post.body;

    card.append(title, body);
    postsList.appendChild(card);
  });
}

async function loadUsers() {
  loadUsersBtn.disabled = true;
  searchInput.value = '';

  setStatus('Загрузка...');
  setPostsStatus('');

  clearElement(userList);
  clearElement(postsList);

  try {
    const response = await fetch(USERS_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const users = await response.json();

    allUsers = users;
    renderUsers(allUsers);

    setStatus(`Загружено пользователей: ${users.length}. HTTP ${response.status}`, 'success' );
  } catch (error) {
    allUsers = [];

    clearElement(userList);
    userList.appendChild(
      createMessage('Не удалось загрузить пользователей. Попробуйте ещё раз.', 'message error')
    );

    setStatus(`Ошибка загрузки: ${error.message}. Можно нажать кнопку ещё раз.`, 'error');
  } finally {
    loadUsersBtn.disabled = false;
  }
}

function filterUsers() {
  if (!allUsers.length) {
    clearElement(userList);
    userList.appendChild(createMessage('Сначала загрузите пользователей.'));
    setStatus('Список пользователей ещё не загружен.');
    return;
  }

  const query = searchInput.value.trim().toLowerCase();

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(query)
  );

  renderUsers(filteredUsers);

  if (filteredUsers.length) {
    setStatus(`Найдено пользователей: ${filteredUsers.length}.`, 'success');
  } else {
    setStatus('Пользователи не найдены.');
  }
}

async function loadPosts(userId, userName) {
  if (postsLoading) {
    return;
  }

  postsLoading = true;
  loadUsersBtn.disabled = true;
  setPostButtonsDisabled(true);

  setPostsStatus(`Загрузка публикаций пользователя ${userName}...`);
  clearElement(postsList);

  try {
    const url = new URL(POSTS_URL);
    url.searchParams.set('userId', userId);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    const firstThreePosts = posts.slice(0, 3);

    renderPosts(firstThreePosts);

    setPostsStatus(
      `Показаны первые ${firstThreePosts.length} публикации пользователя ${userName}. HTTP ${response.status}`,
      'success'
    );
  } catch (error) {
    clearElement(postsList);
    postsList.appendChild(
      createMessage('Не удалось загрузить публикации. Попробуйте ещё раз.', 'message error')
    );

    setPostsStatus(`Ошибка загрузки публикаций: ${error.message}.`, 'error');
  } finally {
    postsLoading = false;
    loadUsersBtn.disabled = false;
    setPostButtonsDisabled(false);
  }
}

loadUsersBtn.addEventListener('click', loadUsers);
searchInput.addEventListener('input', filterUsers);
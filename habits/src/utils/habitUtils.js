const API_URL_BASE = process.env.REACT_APP_API_URL_BASE || ''; // https://api.joshcullen.co

export function generateHabit(id, body, dates) {
  const habitObject = {
    id: id,
    title: body,
    doneDates: dates
  };

  return habitObject;
}

function debounce(func, wait) {
  let timeout;
  let resolvePromise;

  return function(...args) {
      clearTimeout(timeout);
      if (resolvePromise) resolvePromise();
      return new Promise((resolve) => {
        resolvePromise = resolve;
        timeout = setTimeout(() => {
          func.apply(this, args).then(resolve);
        }, wait);
      });
  };
}

export async function checkUserExists(username) {
  if (username) {
    return fetchUserInfo(username).then(resp => {
      if (!resp)
        return false
      else
        return true;
    })
  }
}

export async function fetchUserInfo(username) {
  return fetch(`${API_URL_BASE}/users?username=${username}`)
    .then(resp => {
      if (resp.ok)
        return resp.json();
      else if (resp.status === 404)
        return null
      else
        throw new Error('error fetching user info');
    })
    .catch(error => { throw error });
}

export async function createUser(username, password) {
  const bodyJson = {
    "username" : username,
    "password" : password
  }

  const options = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify(bodyJson)
  }

  return fetch(`${API_URL_BASE}/users`, options)
    .then(resp => {
      if (!resp.ok)
        throw new Error('could not create user');
      else
        return resp.json();
    })
    .catch(error => { throw error })
    .then(() => { fetchRemoteHabitsForUser(username); })
}

export async function verifyPassword(username, password) {
  const bodyJson = {
    "username" : username,
    "password" : password
  }

  const options = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify(bodyJson)
  }

  return fetch(`${API_URL_BASE}/login`, options).then(resp => {
    if (resp.ok)
      return true
    else
      return false
  })
}

export async function fetchRemoteHabitsForUser(username) {
  return fetch(`${API_URL_BASE}/habits/habits?username=${username}`)
    .then(resp => {
      if (!resp.ok)
        throw new Error('error fetching habits for user');
      return resp.json();
    })
    .catch(error => { throw error });
}

const debouncedPutHabits = debounce(async (url, options) => {
  return fetch(url, options)
    .then(resp => {
      if (!resp.ok)
        throw new Error('error writing habits for user');
      return resp.json();
    })
    .catch(error => { throw error });
}, 2000);

// overwrites the remote habits with whatever is the current state of local
export async function pushHabitsForUser(username, habits) {
  const cleanHabits = habits.map(habit => ({
    _id: habit._id,
    title: habit.title,
    doneDates: habit.doneDates.map(date => `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`)
  }));

  const bodyJson = {
    username: username,
    habits: cleanHabits
  }

  const options = {
    method: 'PUT',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify(bodyJson)
  }

  return debouncedPutHabits(`${API_URL_BASE}/habits/habits`, options);
}

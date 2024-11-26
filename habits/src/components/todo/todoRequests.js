const API_URL_BASE = process.env.REACT_APP_API_URL_BASE || ''; // https://api.joshcullen.co

export async function fetchRemoteTodosForUser(username) {      
  return fetch(`${API_URL_BASE}/todos?username=${username}`)
    .then(resp => {
      if (!resp.ok)
        throw new Error('error fetching todos for user');
      return resp.json();
    })
    .catch(error => { throw error });
}

export async function postNewTodo(username, todo) {
  const bodyJson = {
    username: username,
    todo: todo
  }
  const options = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify(bodyJson)
  }
  return fetch(`${API_URL_BASE}/todos/`, options)
    .then(resp => {
      if (!resp.ok)
        throw new Error('error adding todo');
      return resp.json();
    })
    .catch(error => { throw error });
}

export async function deleteTodoReq(todoId) {
  const bodyJson = { id: todoId }
  const options = {
    method: 'DELETE',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify(bodyJson)
  }
  return fetch(`${API_URL_BASE}/todos/`, options)
    .then(resp => {
      if (!resp.ok)
        throw new Error('error deleting todo');
      return resp.json();
    })
    .catch(error => { throw error });
}

export async function updateTodo(todo) {
  const options = {
    method: 'PATCH',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify(todo)
  }
  return fetch(`${API_URL_BASE}/todos/`, options)
    .then(resp => {
      if (!resp.ok)
        throw new Error('error updating todo');
      return resp.json();
    })
    .catch(error => { throw error });
}
import React, { useState, useContext, useEffect } from 'react';
import { detectDevice } from '../../App.js';
import { Context } from '../../Context.js'
import { fetchRemoteTodosForUser, updateTodo } from './todoRequests.js';

export const TodoContext = React.createContext();

export const TodoProvider = ({ children }) => {  
  const { loggedInUser } = useContext(Context); // Get loggedInUser from Context

  const [todos, setTodos] = useState([]);

  // XXX: debug purposes delete me
  // useEffect(() => {
  //   console.log('State change detected');
  //   console.log({ todos, newTodoText, newCategory, newDueDate });
  // }, [todos, newTodoText, newCategory, newDueDate]);

  function checkSnoozeTimes(todos) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const updTodos = todos.map((todo) => {
      if (todo.snooze_date) {
        if (new Date(todo.snooze_date) < startOfToday) {
          const updatedTodo = {
            ...todo,
            snooze_date: null,
            status: 'incomplete'
          }
          updateTodo(updatedTodo)
          return updatedTodo;
        }
      }
      return todo;
    })
    return updTodos;
  }

  function fetchAndSetTodosForCurrentUser() {
    if (loggedInUser) {
      fetchRemoteTodosForUser(loggedInUser).then(resp => {
        if (resp)
          setTodos(checkSnoozeTimes(resp));
      });
    }
  }

  useEffect(() => {
    fetchAndSetTodosForCurrentUser();
  }, [loggedInUser]);

  // useEffect(() => {
  //   console.log('updated todos');
  //   console.log(todos);
  // }, [todos]);

  return (
    <TodoContext.Provider value={{
      todos, setTodos,
      loggedInUser
    }}>
      { children }
    </TodoContext.Provider>
  );
};
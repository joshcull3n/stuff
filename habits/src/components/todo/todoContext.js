import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../Context.js'
import { fetchRemoteTodosForUser, updateTodo } from './todoRequests.js';

export const TodoContext = React.createContext();

export const TodoProvider = ({ children }) => {  
  const { loggedInUser } = useContext(Context); // Get loggedInUser from Context

  const [todos, setTodos] = useState([]);
  // default sorting is by due date, then by created date
  const [ordering, setOrdering] = useState('default');
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [showFilterInput, setShowFilterInput] = useState(null);
  const [filterString, setFilterString] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categoryFilterEnabled, setCategoryFilterEnabled] = useState(false);
  const [editingTitleIndex, setEditingTitleIndex] = useState('');

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

  useEffect(() => {
    if (loggedInUser) {
      fetchRemoteTodosForUser(loggedInUser).then(resp => {
        if (resp)
          setTodos(checkSnoozeTimes(resp));
      });
    }
  }, [loggedInUser]);

  return (
    <TodoContext.Provider value={{
      todos, setTodos,
      filteredTodos, setFilteredTodos,
      showFilterInput, setShowFilterInput,
      filterString, setFilterString,
      ordering, setOrdering,
      newCategory, setNewCategory,
      categoryFilterEnabled, setCategoryFilterEnabled,
      editingTitleIndex, setEditingTitleIndex,
      loggedInUser
    }}>
      { children }
    </TodoContext.Provider>
  );
};
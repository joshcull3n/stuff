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
  const [categorySelected, setCategorySelected] = useState('');
  const [editingTitleIndex, setEditingTitleIndex] = useState('');
  const [titleFieldWidth, setTitleFieldWidth] = useState('');
  const [laterExpanded, setLaterExpanded] = useState(false);
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [doneExpanded, setDoneExpanded] = useState(false);

  function checkPinTimes(todos) {
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
          setTodos(checkPinTimes(resp));
      });
    }
  }, [loggedInUser]);

  useEffect(() => {
    setFilterString('');
    if (showFilterInput) { document.getElementById("filterInput").focus(); }
  }, [showFilterInput])

  useEffect(() => {
    if (filterString) {
      setLaterExpanded(true)
      setArchivedExpanded(true)
      setDoneExpanded(true)
    } else {
      setLaterExpanded(false)
      setArchivedExpanded(false)
      setDoneExpanded(false)
    }
  }, [filterString])

  useEffect(() => {
    if (!categoryFilterEnabled) {
      setFilterString('');
      setTodos(todos);
      setFilteredTodos(todos);
      setNewCategory('');
      setArchivedExpanded(false);
    }
    else {
      let openTodos = filteredTodos.filter((todo) => todo.status === 'incomplete' )
      let archivedTodos = filteredTodos.filter((todo) => todo.status === 'archived' )

      if (!openTodos.length && archivedTodos.length)
        setArchivedExpanded(true)
      else
        setArchivedExpanded(false)
    }
  }, [categoryFilterEnabled])

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
      titleFieldWidth, setTitleFieldWidth,
      categorySelected, setCategorySelected,
      loggedInUser,
      laterExpanded, setLaterExpanded,
      archivedExpanded, setArchivedExpanded,
      doneExpanded, setDoneExpanded,
    }}>
      { children }
    </TodoContext.Provider>
  );
};
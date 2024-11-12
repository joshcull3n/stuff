import React, { useState, useContext } from 'react';
import { detectDevice } from '../../App.js';
import { Context } from '../../Context.js'

export const TodoContext = React.createContext();

export const TodoProvider = ({ children }) => {  
  // todo
  const [todos, setTodos] = useState([]);
  const [newTodoText, setTodoText] = useState('');

  return (
    <TodoContext.Provider value={{
      todos, setTodos,
      newTodoText, setTodoText
    }}>
      { children }
    </TodoContext.Provider>
  );
};
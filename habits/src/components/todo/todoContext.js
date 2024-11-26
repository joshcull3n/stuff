import React, { useState, useContext, useEffect } from 'react';
import { detectDevice } from '../../App.js';
import { Context } from '../../Context.js'
import { fetchRemoteTodosForUser, updateTodo } from './todoRequests.js';

export const TodoContext = React.createContext();

// TEST DATA
const testData = [
  {
    '_id': '1a2b3c',
    'title': 'Fix Bug #345',
    'status': 'incomplete',
    'description': 'Resolve a critical bug in the authentication system.',
    'category': 'Development',
    'due': 1739399691566,
    'completed_date': null,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1731386491566,
    'order': 1,
    '__v': 1
  },
  {
    '_id': '2d3e4f',
    'title': 'Write Unit Tests',
    'status': 'complete',
    'description': 'Cover all edge cases for the payment processing module.',
    'category': 'Testing',
    'due': 1738399691566,
    'completed_date': 1738599691566,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1738599691566,
    'order': 2,
    '__v': 1
  },
  {
    '_id': '3g4h5i',
    'title': 'Prepare Presentation',
    'status': 'snoozed',
    'description': 'Prepare slides for the upcoming client meeting.',
    'category': 'Meetings',
    'due': 1740399691566,
    'completed_date': null,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1739386491566,
    'order': 3,
    '__v': 1
  },
  {
    '_id': '4j5k6l',
    'title': 'Archive Old Data',
    'status': 'archived',
    'description': 'Move old logs and database entries to the archive.',
    'category': 'Maintenance',
    'due': 1737399691566,
    'completed_date': 1737399691566,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1737399691566,
    'order': 4,
    '__v': 1
  },
  {
    '_id': '5m6n7o',
    'title': 'Update Documentation',
    'status': 'incomplete',
    'description': 'Add API changes to the developer documentation.',
    'category': 'Documentation',
    'due': 1741399691566,
    'completed_date': null,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1731386491566,
    'order': 5,
    '__v': 1
  },
  {
    '_id': '6p7q8r',
    'title': 'Design Wireframes',
    'status': 'complete',
    'description': 'Create wireframes for the new landing page.',
    'category': 'Design',
    'due': 1739398691566,
    'completed_date': 1739398791566,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1739398791566,
    'order': 6,
    '__v': 1
  },
  {
    '_id': '7s8t9u',
    'title': 'Schedule Team Meeting',
    'status': 'snoozed',
    'description': 'Find a time for the team to discuss the project roadmap.',
    'category': 'Meetings',
    'due': 1740398691566,
    'completed_date': null,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1739386691566,
    'order': 7,
    '__v': 1
  },
  {
    '_id': '8v9w0x',
    'title': 'Optimize Database Queries',
    'status': 'archived',
    'description': 'Improve the performance of the analytics queries.',
    'category': 'Optimization',
    'due': 1737398691566,
    'completed_date': 1737398691566,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1737398691566,
    'order': 8,
    '__v': 1
  },
  {
    '_id': '9y0z1a',
    'title': 'Refactor Login Module',
    'status': 'incomplete',
    'description': 'Improve the code structure for the login module.',
    'category': 'Development',
    'due': null, // No due date
    'completed_date': null,
    'username': 'josh',
    'created_date': 1731386491566,
    'updated_date': 1731386491566,
    'order': 9,
    '__v': 1
  },
  {
    '_id': '0b1c2d',
    'title': 'Fix Outdated Dependencies',
    'status': 'snoozed',
    'description': 'Update the project dependencies to the latest versions.',
    'category': 'Maintenance',
    'due': 1639399691566, // Due date in the past
    'completed_date': null,
    'username': 'josh',
    'created_date': 1638399691566,
    'updated_date': 1638399691566,
    'order': 10,
    '__v': 1
  },
  {
    '_id': '2e3f4g',
    'title': 'Create Error Pages',
    'status': 'archived',
    'description': 'Design custom 404 and 500 error pages for the app.',
    'category': 'Design',
    'due': null, // No due date
    'completed_date': 1637386491566,
    'username': 'josh',
    'created_date': 1631386491566,
    'updated_date': 1637386491566,
    'order': 11,
    '__v': 1
  },
  {
    '_id': '3h4i5j',
    'title': 'Clean Up Unused Code',
    'status': 'complete',
    'description': 'Remove unused variables and methods from the project.',
    'category': 'Optimization',
    'due': 1637399691566, // Due date in the past
    'completed_date': 1637599691566,
    'username': 'josh',
    'created_date': 1631386491566,
    'updated_date': 1637599691566,
    'order': 12,
    '__v': 1
  }
];

export const TodoProvider = ({ children }) => {  
  const { loggedInUser } = useContext(Context); // Get loggedInUser from Context

  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDueDate, setNewDueDate] = useState(Date.now())

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
      newTodoText, setNewTodoText,
      newCategory, setNewCategory,
      newDueDate, setNewDueDate,
      loggedInUser
    }}>
      { children }
    </TodoContext.Provider>
  );
};
import React, {useEffect, useState, useRef} from 'react';
import { detectDevice } from './App';
import { fetchRemoteHabitsForUser, pushHabitsForUser, fetchUserInfo, createUser } from './utils/habitUtils';

const mobile = detectDevice();

export const Context = React.createContext();
export const ContextProvider = ({ children }) => {

  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-2)

  function convertToYYYYMMDD(date) {
    const tempYear = date.getFullYear();
    const tempMonth = date.getMonth()+1;
    const tempDay = date.getDate();

    return tempYear + '/' + tempMonth + '/' + tempDay;
  }

  const localStorage = window.localStorage;
  const lightModeStorage = localStorage.getItem('habits_lightMode');

  // user
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('habits_userid'));
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [newUser, setNewUser] = useState(false);
  const [askForPassword, setAskForPassword] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const VIEW_MODES = {
    TODO: 'todo',
    HABITS: 'habits',
    OVERVIEW: 'overview'
  };

  // current view
  const [viewMode, setViewMode] = useState(VIEW_MODES.HABITS)

  // appearance
  const [lightMode, setLightMode] = useState(Boolean(lightModeStorage));
  const [graphFontColor, setGraphFontColor] = useState('rgb(0,0,0)');
  const [graphLineColor, setGraphLineColor] = useState('rgb(0,0,0)');
  const [graphBgColor, setGraphBgColor] = useState('rgb(0,0,0)');
  const [graphStepSize, setGraphStepSize] = useState('0.2');
  const [graphGridColor, setGraphGridColor] = useState('rgb(0,0,0)');

  // habits
  const [habits, setHabits] = useState([]);
  const habitsRef = useRef(habits);
  const [newHabitText, setNewHabitText] = useState('');

  // dates
  const [endDate, setEndDate] = useState(new Date());
  var tempEnd = new Date(endDate);
  var start = new Date();
  if (mobile)
    start.setDate(tempEnd.getDate() - 3);
  else
    start.setDate(tempEnd.getDate() - 21);
  const [startDate, setStartDate] = useState(start);

  function convertHabitDateStringsToDate(habits) {
    if (habits) {
      return habits.map(habit => ({
        ...habit,
        doneDates: habit.doneDates.map(date => new Date(date))
      }));
    }
  }

  function fetchAndSetHabitsForCurrentUser() {
    if (loggedInUser) {
      fetchRemoteHabitsForUser(loggedInUser).then(resp => {
        if (resp) {
          const cleanDateHabits = convertHabitDateStringsToDate(resp);
          if (JSON.stringify(habitsRef.current) !== JSON.stringify(cleanDateHabits))
            setHabits(cleanDateHabits);
        }
      });
    }
  }

  function fetchUserInfoAndCreateIfNotExist(username, password) {
    if (username) {
      fetchUserInfo(username).then(resp => {
        if (!resp && !password)
          createUser(username).then(() => { setLoggedInUser(username); });
        else if (!resp && password)
          createUser(username, password).then(() => { setLoggedInUser(username); })
        else {
          if (resp.password_protected)
            setAskForPassword(true)
          else
            fetchAndSetHabitsForCurrentUser();
        }
      })
    }
  }

  useEffect(() => {
    // check if user already exists
    if (loggedInUser) {
      fetchUserInfoAndCreateIfNotExist(loggedInUser, passwordInput);
      localStorage.setItem('habits_userid', loggedInUser);
      fetchAndSetHabitsForCurrentUser();
    }
  }, [loggedInUser]);
  
  const [updateRemote, setUpdateRemote] = useState(false);
  useEffect(() => {
    if (updateRemote) {
      setUpdateRemote(false);
      pushHabitsForUser(loggedInUser, habits).then((resp) => {
        if (resp) {
          const cleanDateHabits = convertHabitDateStringsToDate(resp.habits);
          setHabits(cleanDateHabits);
        }
      })
    }

    const intervalId = setInterval(() => {
      fetchAndSetHabitsForCurrentUser() // updates local habits from remote every 5 seconds
    }, 5000);
    return () => clearInterval(intervalId);
  }, [updateRemote, loggedInUser])

  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  return (
    <Context.Provider value={{ 
      habits, setHabits,
      newHabitText, setNewHabitText, 
      endDate, setEndDate,
      startDate, setStartDate,
      lightMode, setLightMode,
      graphFontColor, setGraphFontColor,
      graphLineColor, setGraphLineColor,
      graphBgColor, setGraphBgColor,
      graphStepSize, setGraphStepSize,
      graphGridColor, setGraphGridColor,
      updateRemote, setUpdateRemote,
      loggedInUser, setLoggedInUser,
      usernameInput, setUsernameInput,
      passwordInput, setPasswordInput,
      newUser, setNewUser,
      askForPassword, setAskForPassword,
      loginFailed, setLoginFailed,
      viewMode, setViewMode }}>
      { children }
    </Context.Provider>
  );
};

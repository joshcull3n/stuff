import React, { useContext } from 'react';
import './App.css';
import './styles/dark.css';
import './styles/light.css';
import './styles/mobile.css';
import MainPanel, { AppBar } from './components/mainPanel.js';
import UsernamePrompt from './components/userPrompt.js';
import { generateHabit } from './utils/habitUtils.js';
import { Context } from './Context';
import { TodoContext } from './components/todo/todoContext.js';

export function detectDevice() {
  const agent = window.navigator.userAgent.toLowerCase()
  //var isIpad = /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
  let mobile = false;

  if (agent.includes('iphone') || agent.includes('android') || agent.includes('blackberry') || agent.includes('webOS')) {
    document.body.classList.add('mobile');
    mobile = true;
  }
  
  return mobile
}

const App = () => {
  
  /* - DEBUG OPTIONS - */
  //console.error = () => {}; // disable if you want to see console errors
  //console.log('rendering');
  /* -- -- -- -- -- -- */

  const localStorage = window.localStorage;
  const { 
    habits, setHabits, newHabitText, setNewHabitText, lightMode, setLightMode, 
    setGraphGridColor, setUpdateRemote, loggedInUser, setLoggedInUser, setAskForPassword,
    setUsernameInput, setPasswordInput, setNewUser
  } = useContext(Context);

  const { setTodos } = useContext(TodoContext);

  // set body class
  document.body.classList.remove('lightMode');
  document.body.classList.remove('darkMode');
  if (lightMode)
    document.body.classList.add("lightMode");
  else
    document.body.classList.add('darkMode');

  const handleHabitInputChange = (e) => {
    setNewHabitText(e.target.value);
  }

  const handleHabitInputEnter = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      setNewHabitText(event.target.value);
      addHabit();
    }
  }

  const handleHabitInputBtnClick = () => {
    if (newHabitText)
      addHabit();
  }

  const handleLogoutClick = () => {
    localStorage.setItem('habits_userid','');
    setLoggedInUser('');
    setUsernameInput('');
    setPasswordInput('');
    setNewUser(false);
    setHabits([]);
    setTodos([]);
    setAskForPassword(false);
  }

  const handleLightMode = (e) => {
    setGraphGridColor(null);
    if (lightMode) {
      localStorage.setItem('habits_lightMode', '');
      setLightMode(false);
    }
    else {
      localStorage.setItem('habits_lightMode', 'true');
      setLightMode(true);
    }
  }

  function addHabit() {
    if (newHabitText.trim()) {
      setUpdateRemote(true);
      const habit = generateHabit(habits.length + 1, newHabitText.trim(), []);
      const tempArray = [...habits];
      tempArray.push(habit);
      setHabits(tempArray);
    }
    setNewHabitText('');
  }

  const LogoutButton = ({handleLogoutClick}) => {
    if (loggedInUser) {
      return <div className='logout' id='logoutBtn' onClick={handleLogoutClick}>logout</div>
    }
  }

  const LightModeSwitch = ({handleLightMode}) => {
    return (
      <div>
        <input type="checkbox" onChange={handleLightMode} id="lightModeSwitch"/>
        <label htmlFor="lightModeSwitch"></label>
      </div>
    )
  }

  const TopBanner = () => {
    return (
      <div className='topBanner'>
        <div className='topBannerLeft'>
          <a href='/' style={{display:'flex', justifyContent:'center'}}><img id='homeImg' decoding='async' alt='home'/></a>
        </div>
        <div className='topBannerCenter'>
          <AppBar loggedIn={loggedInUser}/>
        </div>
        <div className='topBannerRight'>
          <div className='sidebarOption'>
            <LightModeSwitch handleLightMode={handleLightMode} />
          </div>
          <div className='sidebarOption'>
            <LogoutButton handleLogoutClick={handleLogoutClick} />
          </div>
        </div>
      </div>
    )
  }

  const AppIntro = () => (
    <div className='appIntro fadeIn'>
      stuff is for managing your stuff.<br/><br/>it is a simple, noise-free way to organize your life.
    </div>
  )
  
  if (loggedInUser) {
    return (
      <div className="App">
        <TopBanner />
        <MainPanel 
          mobile={detectDevice()}
          handleHabitInputEnter={handleHabitInputEnter}
          handleHabitInputChange={handleHabitInputChange}
          handleHabitInputBtnClick={handleHabitInputBtnClick}
          handleLogoutClick={handleLogoutClick}/>
      </div>
    );
  } 
  else {
    return (
      <div className="App">
        <TopBanner />
        <AppIntro />
        <UsernamePrompt />
      </div>
    )
  }
}

export default App;


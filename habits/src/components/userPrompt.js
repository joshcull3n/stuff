import { Context } from '../Context.js';
import { useContext, useEffect, useRef, useState } from 'react';
import { checkUserExists, fetchUserInfo, verifyPassword } from '../utils/habitUtils.js';

const InitialEnterUsername = ({usernameInput, inputRef, handleUsernameInputEnter, handleUsernameInputChange}) => {
  return (
    <div id="habitListContainer" className='slowFadeIn' style={{padding:'0.5rem 0', maxWidth:'200px'}}>
      <div style={{textAlign: 'center', fontFamily:'monospace'}}>
        please enter a username to login or create an account.
      </div>
      <div style={{ paddingTop:'0.5rem'}} className='centered'>
        <div>
          <input ref={inputRef} id="usernameInput" placeholder="username" 
          style={{textAlign:'center', padding: '0'}}  
          value={usernameInput} autofocus
          onKeyDown={handleUsernameInputEnter} 
          onChange={handleUsernameInputChange}/>
        </div>
      </div>
    </div>
  )
}

const CreateUserPrompt = ({usernameAttempt, inputRef, usernameInput, handleUsernameInputEnter, handleUsernameInputChange, passwordInput, handlePasswordInputEnter, handlePasswordInputChange}) => {
  return ( // if user does not exist yet
    <div id="habitListContainer" style={{padding:'15px 10px 0px'}}>
      <div style={{opacity:0.9, textAlign: 'center', fontFamily:'monospace'}}>
        user {usernameAttempt} does not exist. create?
      </div>
      <div style={{ padding:'1rem 0', fontFamily:'monospace'}}>
        <div style={{display: 'inline-flex'}}>
          <input id="usernameInput" style={{textAlign:'center', padding: '0 0px'}}  
          value={usernameInput} type="username" placeholder="username"
          onKeyDown={handleUsernameInputEnter} 
          onChange={handleUsernameInputChange}/>
        </div>
        <div style={{display: 'inline-flex'}}>
          <input id="passwordInput" style={{textAlign:'center', margin: '5px 0px 0px 0px', padding: '0 0px'}} ref={inputRef}
          value={passwordInput} type="password" placeholder="password"
          onKeyDown={handlePasswordInputEnter}
          onChange={handlePasswordInputChange}/>
        </div>
        <div style={{fontSize:'0.45rem', textAlign: 'center', padding: '2px 5px 0px', fontFamily:'monospace'}}>
        leave password blank to continue without setting a password.
        </div>
      </div>
    </div>
  )
}

const EnterPasswordPrompt = ({usernameAttempt, inputRef, usernameInput, handleUsernameInputEnter, handleUsernameInputChange, passwordInput, handlePasswordInputEnter, handlePasswordInputChange, loginFailed}) => {
  const FailedMsg = ({message}) => <div style={{padding: '5px 0',fontSize: '0.55rem', opacity:0.9, textAlign: 'center', fontFamily:'monospace'}}>{message}</div>;

  var failMessage = '';
  if (loginFailed)
    failMessage = 'wrong...';

  return ( // if user exists but requires password
    <div>
    <div id="habitListContainer" style={{padding:'15px 10px 0'}}>
      <div style={{opacity:0.9, textAlign: 'center', fontFamily:'monospace'}}>
        user {usernameAttempt} requires a password. enter it below.
      </div>
      <div style={{ padding:'1rem 0px 0rem', fontFamily:'monospace'}}>
        <div style={{display: 'inline-flex'}}>
          <input id="usernameInput" style={{textAlign:'center', padding: '0 0px'}}  
          value={usernameInput} type="username" placeholder="username"
          onKeyDown={handleUsernameInputEnter} 
          onChange={handleUsernameInputChange}/>
        </div>
        <div style={{display: 'inline-flex'}}>
          <input id="passwordInput" style={{textAlign:'center', margin: '5px 0px 0px 0px', padding: '0 0px'}} ref={inputRef}
          value={passwordInput} type="password" placeholder="password"
          onKeyDown={handlePasswordInputEnter}
          onChange={handlePasswordInputChange}/>
        </div>
      </div>
      <FailedMsg message={failMessage}/>
    </div>
    </div>
  )
}

const UsernamePrompt = () => {
    const { usernameInput, newUser, setUsernameInput, passwordInput, setPasswordInput, setNewUser, setLoggedInUser, askForPassword, setAskForPassword, loginFailed, setLoginFailed } = useContext(Context);
    const inputRef = useRef(null);
    const [usernameAttempt, setUsernameAttempt] = useState('');

    useEffect(() => {
      inputRef.current.focus();
    }, [newUser, askForPassword]);

  function loginOrPromptCreateUser(username) {
    checkUserExists(username).then(resp => {
      if (!resp)
        setNewUser(true);
      else {
        fetchUserInfo(username).then(user => {
          if (user.password_protected)
            setAskForPassword(true);
          else
            setLoggedInUser(username);
        });
      }
    })
  }

  const handleUsernameInputChange = (e) => {
    setUsernameInput(e.target.value)
    setNewUser(false);
    setAskForPassword(false);
  }

  const handleUsernameInputEnter = (e) => {
    if (e.key === 'Escape') {
      setUsernameInput('');
      setPasswordInput('');
      setNewUser(false);
      setAskForPassword(false);
    }
    if (e.key === 'Enter' && e.target.value.trim()) {
      setUsernameInput(e.target.value);
      setUsernameAttempt(e.target.value);
      loginOrPromptCreateUser(usernameInput);
    }
  }

  const handlePasswordInputChange = (e) => {
    setPasswordInput(e.target.value);
    setLoginFailed(false)
  }

  const handlePasswordInputEnter = (e) => {
    if (e.key === 'Escape') {
      setUsernameInput('');
      setPasswordInput('');
      setNewUser(false);
      setAskForPassword(false);
    }
    else if (e.key === 'Enter') {
      setPasswordInput(e.target.value);
      if (askForPassword) {
        verifyPassword(usernameInput, passwordInput).then(success => {
          if (success) {
            setLoggedInUser(usernameInput);
            setLoginFailed(false);
          }
          else {
            setPasswordInput('');
            setLoginFailed(true);
          }
        });
      }
      else {
        setLoggedInUser(usernameInput);
      }
    }
  }

  if (newUser) {
    return <CreateUserPrompt inputRef={inputRef} newUser={newUser} usernameAttempt={usernameAttempt} usernameInput={usernameInput} handleUsernameInputEnter={handleUsernameInputEnter} handleUsernameInputChange={handleUsernameInputChange} passwordInput={passwordInput} handlePasswordInputEnter={handlePasswordInputEnter} handlePasswordInputChange={handlePasswordInputChange} />
  }
  else if (askForPassword) {
    return <EnterPasswordPrompt usernameAttempt={usernameAttempt} inputRef={inputRef} usernameInput={usernameInput} handleUsernameInputEnter={handleUsernameInputEnter} handleUsernameInputChange={handleUsernameInputChange} passwordInput={passwordInput} handlePasswordInputEnter={handlePasswordInputEnter} handlePasswordInputChange={handlePasswordInputChange} askForPassword={askForPassword} loginFailed={loginFailed}/>
  }
  else {
    return <InitialEnterUsername 
      usernameInput={usernameInput} 
      handleUsernameInputChange={handleUsernameInputChange}
      handleUsernameInputEnter={handleUsernameInputEnter} 
      inputRef={inputRef}/>
  }

}

export default UsernamePrompt;
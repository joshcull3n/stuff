import { useContext, useState } from 'react'
import { TodoContext } from './todoContext.js'
import { postNewTodo, deleteTodoReq, updateTodo } from './todoRequests.js';

/* DB SCHEMA
const testTask4 = {
  '_id'            : ObjectId('...'),
  'title'          : '...', // required
  'status'         : {'incomplete' || 'complete' || 'archived' || 'snoozed'}, // required
  'description'    : '...',
  'category'       : '...',
  'due'            : 1739399691566, // milliseconds
  'completed_date' : 1731386491666, // milliseconds
  'username'       : '...', // required
  'created_date'   : 1731386491566, // milliseconds, required
  'updated_date'   : 1731386491566, // milliseconds, required
  'snooze_date'    : null,
  'order'          : 12,
  '__v'            : 1 // version
}
 */

// helper functions
function getDueDateString(dueMillis=null) {
  if (dueMillis === null)
    return 'someday'
  const now = new Date();
  const duedate = new Date(dueMillis);
  const difference = Math.ceil((duedate - now) / (1000 * 60 * 60 * 24))
  if (difference < 0) {
    return 'overdue'
  } else if (difference === 0) {
    return 'due today'
  } else if (difference > 365) {
    let diffYear = Math.ceil(difference / 365)
    return `${diffYear} years left`
  }
  else {
    return `${difference} days left`
  }
}

function getAgeString(createdMillis) {
  const now = new Date();
  const ageDate = new Date(createdMillis);
  const difference = Math.floor((now - ageDate) / (1000 * 60 * 60 * 24));
  return `${difference} days old`
}

// sub-components
const BaseButtonElement = ({text, type, onclick}) => {
  const buttonTypes = {
    fin: { 
      className: "checkboxContainer", 
      content: <input type="checkbox" /> 
    }, 
    finDone: { 
      className: "checkboxContainer", 
      content: <input type="checkbox" checked="true"/>
    },
    del: { 
      className: "todoButton deleteButton", 
      imgId: "deleteButton", 
      alt: "x"
    },
    snz: { 
      className: "todoButton", 
      imgId: "snzButton", 
      alt: "snz" 
    },
    arc: { 
      className: "todoButton", 
      imgId: "archiveButton", 
      alt: "archive" 
    },
    unarc: { 
      className: "todoButton", 
      imgId: "unarchiveButton", 
      alt: "archive" 
    }
  };
  const buttonConfig = buttonTypes[type];

  if (buttonConfig) {
    return (
      <div className={buttonConfig.className} onClick={onclick}>
        { buttonConfig.content || (<img id={buttonConfig.imgId} alt={buttonConfig.alt} />) }
      </div>
    )
  }

  return ( <div className="todoBtn">{text}</div>)
}

const TodoRow = ({todo, showSnoozeBtn, showArchiveBtn, done}) => {
  const Title = () => <div className={done && "todoCell doneTitle" || "todoCell"}>{todo.title}</div>
  const DueDate = () => <div className="todoCell todoLabel">{getDueDateString(todo.due)}</div>
  const Category = () => <div className="todoCell todoLabel">{todo.category}</div>
  //const Notes = () => <div className="todoCell">{todo.notes}</div>
  //const Age = () => <div className="todoCell">{getAgeString(todo.created)}</div>

  const CompleteBtn = () => <BaseButtonElement text="fin" type={done && "finDone" || "fin"} onclick={() => changeStatus(todo, 'complete', 'incomplete')}/>
  const SnoozeBtn = () => <BaseButtonElement text="snz" type="snz" onclick={() => changeStatus(todo, 'snoozed', 'incomplete')}/>
  const ArchiveBtn = () => <BaseButtonElement text="arc" type="arc" onclick={() => changeStatus(todo, 'archived')}/> 
  const UnarchiveBtn = () => <BaseButtonElement text="unarc" type="unarc" onclick={() => changeStatus(todo, 'incomplete')}/> 
  const DeleteBtn = () => <BaseButtonElement text="del" type="del" onclick={() => deleteTodo(todo)}/>

  const {todos, setTodos} = useContext(TodoContext);

  function deleteTodo(todoToDelete) {
    setTodos(todos.filter(todo => todo._id !== todoToDelete._id));
    deleteTodoReq(todoToDelete._id);
  }

  // if task status is already status, use altStatus
  function changeStatus(todoToUpdate, status, altStatus) {
    let changeStatus = status;
    if (todoToUpdate.status === status)
      changeStatus = altStatus;
    const newTodos = todos.map(todo => {
      if (todo._id === todoToUpdate._id) {
        todo.status = changeStatus
        if (changeStatus === 'incomplete') {
          todo.snooze_date = null;
          todoToUpdate.snooze_date = null;
        }
        else if (changeStatus === 'snoozed') {
          todo.snooze_date = Date.now();
          todoToUpdate.snooze_date = todo.snooze_date;
        }
      };
      return todo;
    });
    updateTodo(todoToUpdate);
    setTodos(newTodos);
  }

  return(
    <div className='todoRow'>
      <CompleteBtn />
      <Title />
      <DueDate />
      <Category />
      { showSnoozeBtn === true && <SnoozeBtn /> || <div></div> }
      { showArchiveBtn === true && <ArchiveBtn /> || showArchiveBtn === false && <UnarchiveBtn /> || <div></div>}
      <DeleteBtn />
    </div>
  )
}

const StatsRow = ({open, snoozed, done, archived}) => {
  const total = open + snoozed + done + archived;
  return (
    <div>
      <div className="statsRow">
        <div className="statsCell">{open} opened</div>
        <div className="statsCell">{snoozed} snoozed</div>
        <div className="statsCell">{archived} archived</div>
      </div>
      <div className="statsRow">
        <div className="statsCell">{done} completed</div>
        <div className="statsCell">{total} total</div>
      </div>
    </div>
  )
}

const TodoInput = () => {
  const { todos, setTodos,
    newTodoText, setNewTodoText,
    newCategory, setNewCategory,
    newDueDate, setNewDueDate,
    loggedInUser // Get loggedInUser from TodoContext
  } = useContext(TodoContext);

  const [validSelection, setValidSelection] = useState(false); // used for styling

  const handleTodoInputChange = (e) => {
    setNewTodoText(e.target.value);
  }

  const handleTodoCategoryChange = (e) => {
    setValidSelection(e.target.value !== "");
  }

  const handleTodoInputEnter = async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTodo = {
        id: todos.length + 1,
        title: e.target.value.trim(),
        status: 'incomplete',
        description: null,
        due: newDueDate || null,
        category: newCategory || null,
        completed_date: null,
        username: loggedInUser,
        created_date: Date.now(),
        updated_date: Date.now(),
        order: todos.length + 1,
        snooze_date: null
      };
      const tempArray = [...todos];
      const newTodoResp = await postNewTodo(loggedInUser, newTodo);
      tempArray.push(newTodoResp);
      setTodos(tempArray);
      setNewTodoText('');
    }
  }

  return (
    <div id="todoInput">
        <input style={{"width":"100%", "padding":"0 10px"}} 
          placeholder="add a todo..."
          value={newTodoText}
          onKeyDown={handleTodoInputEnter}
          onChange={handleTodoInputChange} />
      <div style={{"display":"flex","justifyContent":"center"}}>
        <select className={`categoryDropdown ${validSelection ? "valid" : ""}`}
          onChange={handleTodoCategoryChange}>
          <option value="" selected>none</option>
          <option value="chores">chores</option>
          <option value="other">other</option>
        </select>
        <input style={{"width": "5em"}} type="date"/>
      </div>
    </div>
  )
}

const PanelTitle = ({title, count, count2}) => {
  if (count2)
    return ( <div className='panelTitle'>{title}<span style={{fontSize: 'x-small', marginLeft: '5px'}}>{count} ({count2})</span></div> )
  if (count || count === 0)
    return ( <div className='panelTitle'>{title}<span style={{fontSize: 'x-small', marginLeft: '5px'}}>{count}</span></div> )
  else
    return ( <div className='panelTitle'>{title}</div> )
} 

// main components
const TodoList = () => {
  const { todos, setTodos } = useContext(TodoContext);
  const openTodos = todos.filter((todo) => todo.status === 'incomplete');
  const snoozedTodos = todos.filter((todo) => todo.status === 'snoozed');
  const archivedTodos = todos.filter((todo) => todo.status === 'archived');
  const completedTodos = todos.filter((todo) => todo.status === 'completed');

  const openCount = openTodos.length;

  return (
    <div>
      <div className="todoListContainer">
        <TodoInput />
      </div>
      <div className="todoListContainer">
      <PanelTitle title='todo' count={openCount} /*count2={openCount != totalCount && totalCount}*//>
        <div className="todoGrid">
          { 
            openTodos.length > 0 ? openTodos.map((todo, index) => (
              <TodoRow todo={todo} showSnoozeBtn={true} showArchiveBtn={true} key={index} />
            )) : <div className='todoRow noTasks'></div>
          }
        </div>
        { snoozedTodos.length > 0 && (
          <div className="todoGrid" style={{ padding: '5px 0' }}>
            <div className="fadedContainer"> 
            <div style={{fontSize:'x-small'}}><PanelTitle title='snoozed until tmr...' count={snoozedTodos.length}/></div>
              { snoozedTodos.length > 0 ? snoozedTodos.map((todo, index) => (
                <TodoRow todo={todo} showSnoozeBtn={true} showArchiveBtn={true} key={index} />
              )) : <></> }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const DoneList = () => {
  const { todos } = useContext(TodoContext);
  const doneTodos = todos.filter((todo) => todo.status === 'complete');

  return (
    <div className="todoListContainer">
      <PanelTitle title='done' count={doneTodos.length} />
      <div className="todoGrid">
        { doneTodos.length > 0 ? doneTodos.map((todo, index) => (
            <TodoRow todo={todo} showSnoozeBtn={false} done={true} key={index} />
          )) : <div className='todoRow' style={{'padding': '0px'}}></div> }
      </div>
    </div>
  )
}

const ArchiveList = () => {
  const { todos } = useContext(TodoContext);
  const archivedTodos = todos.filter((todo) => todo.status === 'archived');
  return (
    <div className="todoListContainer">
      <PanelTitle title='archived' count={archivedTodos.length} />
      <div className="todoGrid">
        {
          archivedTodos.length > 0 ? archivedTodos.map((todo, index) => (
            <TodoRow todo={todo} showSnoozeBtn={false} showArchiveBtn={false} key={index} />
          )) : <div className='todoRow' style={{'padding': '0px'}}></div>
        }
      </div>
    </div>
  )
}

const StatsPanel = (dateRange) => {
  const { todos } = useContext(TodoContext);
  const statCounts = todos.reduce((acc, todos) => {
    // TODO: filter by given date range
    acc[todos.status] = (acc[todos.status] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="todoListContainer" style={{'padding':'0px'}}>
      <div style={{'display':'flex', "justifyContent":"space-evenly", "fontSize": "0.8em"}}>
        this weeks stats
      </div>
      <StatsRow open={statCounts.incomplete}
        snoozed={statCounts.snoozed}
        done={statCounts.complete} 
        archived={statCounts.archived} />
    </div>
  )
}

export {TodoList, DoneList, ArchiveList, StatsPanel};
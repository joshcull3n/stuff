import { useContext } from 'react'
import { TodoContext } from './todoContext.js'

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
const BaseButtonElement = ({text, type}) => {
  const buttonTypes = {
    fin:   { className: "checkboxContainer", content: <input type="checkbox" /> },
    del:   { className: "todoButton deleteButton", imgId: "deleteButton", alt: "x" },
    snz:   { className: "todoButton", imgId: "snzButton", alt: "snz" },
    arc:   { className: "todoButton", imgId: "archiveButton", alt: "archive" },
    unarc: { className: "todoButton", imgId: "unarchiveButton", alt: "archive" },
  };
  const buttonConfig = buttonTypes[type];

  if (buttonConfig) {
    return (
      <div className={buttonConfig.className}>
        { buttonConfig.content || (<img id={buttonConfig.imgId} alt={buttonConfig.alt} />) }
      </div>
    )
  }

  return ( <div className="todoBtn">{text}</div>)
}

const TodoRow = ({todo, snooze, archive}) => {
  const Title = () => <div className="todoCell">{todo.title}</div>
  const Notes = () => <div className="todoCell">{todo.notes}</div>    // task description/notes
  const DueDate = () => <div className="todoCell" style={{"display":"flex", "justifyContent":"center"}}>{getDueDateString(todo.due)}</div>  // task due date
  const Category = () => <div className="todoCell">{todo.category}</div> // task category
  const Age = () => <div className="todoCell">{getAgeString(todo.created)}</div> // task age

  const CompleteBtn = () => <BaseButtonElement text="fin" type="fin" />
  const SnoozeBtn = () => <BaseButtonElement text="snz" type="snz" />
  const DeleteBtn = () => <BaseButtonElement text="del" type="del" />
  const ArchiveBtn = () => <BaseButtonElement text="arc" type="arc" /> 
  const UnarchiveBtn = () => <BaseButtonElement text="unarc" type="unarc" /> 

  return(
    <div className='todoRow'>
      <CompleteBtn />
      <Title />
      <DueDate />
      <Category />
      { snooze === true && <SnoozeBtn /> || <div></div> }
      { archive === true && <ArchiveBtn /> || archive === false && <UnarchiveBtn /> || <div></div>}
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
    newDueDate, setNewDueDate 
  } = useContext(TodoContext);

  const { loggedInUser } = useContext(TodoContext);

  const handleTodoInputChange = (e) => {
    console.log(e.key);
    setNewTodoText(e.target.value);
  }

  const handleTodoInputEnter = (e) => {
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
      };
      const tempArray = [...todos];
      tempArray.push(newTodo);
      setTodos(tempArray);
      setNewTodoText('');
    }
  }

  return (
    <div style={{"margin":"0 0 10px 0", "padding":"2px 2px"}}>
      <div className="todoInput">
          <input style={{"width":"100%", "padding":"0 10px", "margin": "0px 5px"}} 
            placeholder="add a todo..."
            value={newTodoText}
            onKeyDown={handleTodoInputEnter}
            onChange={handleTodoInputChange} />
        <div style={{"display":"flex","justifyContent":"center"}}>
          <select style={{"margin": "0px 2px"}}>
            <option value="category">category</option>
            <option value="chores">chores</option>
            <option value="other">other</option>
          </select>
          <input style={{"margin": "0px 2px", "width": "5em"}} type="date"/>
        </div>
      </div>
    </div>
  )
}

// main components
const TodoList = () => {
  const { todos } = useContext(TodoContext);
  const openTodos = todos.filter((todo) => todo.status === 'incomplete');
  const snoozedTodos = todos.filter((todo) => todo.status === 'snoozed');
  // TODO: check if items should be un-snoozed

  return (
    <div>
      <div id="mainContainer">
        <TodoInput />
        <div className="todoGrid">
          {openTodos.map((todo, index) => (
            <TodoRow todo={todo} snooze={true} archive={true} key={index} />
          ))}
        </div>
        <div className="todoGrid" style={{'paddingTop':'20px'}}>
          {snoozedTodos.map((todo, index) => (
            <div className="fadedContainer">
              <TodoRow todo={todo} snooze={true} archive={true} key={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DoneList = () => {
  const { todos } = useContext(TodoContext);
  const doneTodos = todos.filter((todo) => todo.status === 'complete');

  return (
    <div id="mainContainer" className="fadedContainer">
      done
      <div className="todoGrid">
        {doneTodos.map((todo, index) => (
          <TodoRow todo={todo} snooze={false} key={index} />
        ))}
      </div>
    </div>
  )
}

const ArchiveList = () => {
  const { todos } = useContext(TodoContext);
  const archivedTodos = todos.filter((todo) => todo.status === 'archived');
  return (
    <div id="mainContainer" className="fadedContainer">
      archive
      <div className="todoGrid">
        {archivedTodos.map((todo, index) => (
          <TodoRow todo={todo} snooze={false} archive={false} key={index} />
        ))}
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
    <div id="mainContainer" style={{'padding':'0px'}}>
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

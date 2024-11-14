import { useContext } from 'react'
import { TodoContext } from './todoContext.js'

/* DB SCHEMA
 {
   todo._id      : ObjectId('...'),
   todo.title    : '...',
   todo.notes    : '... ... ...',
   todo.due      : Date,
   todo.category : '...',
   todo.user    : '...',
   todo.created  : 1731386491566,
   todo.updated  : 1731386491566,
   todo.completed : 1731386491666,
   todo.__v      : 0
 }
 */

// TEST DATA
const testTask = {
  '_id'      : 'fdsfdsfdsfas21348124s',
  'title'    : 'take out trash fdshjflhdsajklfhdsjkalfhjdkalshfjkldsahjkfdhjkal',
  'notes'    : 'regular trash every week, compost every other week',
  'due'      : new Date('2024-11-13'),
  'category' : 'chores',
  'user'     : 'josh_username',
  'created'  : 1731386491566,
  'updated'  : 1731387119881,
  'completed' : 1731386491766,
  '__v'      : 1
}
const testTask2 = {
  '_id'      : 'fdsfdsfdsfas21348124s',
  'title'    : 'SLO',
  'notes'    : 'regular trash every week, compost every other week',
  'due'      : new Date('2039-11-18'),
  'category' : 'ppppppppppppppppppppppppppppppppppppppppppppppppp',
  'user'     : 'josh_username',
  'created'  : 1731389999966,
  'updated'  : 1731389119881,
  'completed' : null,
  '__v'      : 1
}
const testTask3 = {
  '_id'      : 'fdsfdsfdsfas21348124s',
  'title'    : 'SLO',
  'notes'    : 'regular trash every week, compost every other week',
  'due'      : null,
  'category' : 'work',
  'user'     : 'josh_username',
  'created'  : 1731389999966,
  'updated'  : 1731389119881,
  'completed' : null,
  '__v'      : 1
}
const todos = [testTask, testTask2, testTask3, testTask, testTask, testTask, testTask, testTask, testTask, testTask]
const doneTodos = [testTask, testTask2, testTask3]
const shelfTodos = [testTask3, testTask]


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
const BaseButtonElement = ({text, type, image}) => {
  if (type === "fin") {
    return (
      <div className="checkboxContainer">
        <input type="checkbox" />
      </div>
    )
  } else if (type === "del") {
    return (
      <div className="todoButton deleteButton">
        <img id="deleteButton" alt="x"/>
      </div>
    )
  } else if (type === "snz") {
    return(
      <div className="todoButton">
        <img id="snzButton" alt="snz"/>
      </div>
    )
  } else if (type === "arc") {
    return(
      <div className="todoButton">
        <img id="archiveButton" alt="archive"/>
      </div>
    )
  } else if (type === "unarc") {
    return(
      <div className="todoButton">
        <img id="unarchiveButton" alt="archive"/>
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

const StatsRow = ({open, done}) => {
  const total = open + done;
  return (
    <div className="statsRow">
      <div className="statsCell">{open} open</div>
      <div className="statsCell">{done} complete</div>
      <div className="statsCell">{total} total</div>
    </div>
  )
}

const TodoInput = () => {
  return (
    <div style={{"border":"black dotted 1px", "margin":"0 0 10px 0", "padding":"2px 2px"}}>
    <div className="todoInput">
        <input style={{"width":"100%", "textAlign":"center", "padding":"0 10px", "border":"black dotted 1px"}} placeholder="add a todo..."/>
      <div style={{"display":"flex","justifyContent":"center"}}>
        <select>
          <option value="category">category</option>
          <option value="bloop">chores</option>
          <option value="custom">custom</option>
        </select>
        <input type="date"/>
      </div>
    </div>
    </div>
  )
}

// main components
const TodoList = () => {
  //const { todos } = useContext(TodoContext);
  const openCnt = todos.length
  const doneCnt = doneTodos.length

  return (
    <div>
      <div id="mainContainer">
        <TodoInput />
        <div className="todoGrid">
          {todos.map((todo, index) => (
            <TodoRow todo={todo} snooze={true} archive={true} key={index} />
          ))}
        </div>
      </div>
      <div id="mainContainer" style={{'padding':'0px'}}>
        <div style={{'display':'flex', "justifyContent":"space-evenly", "fontSize": "0.8em"}}>
          weekly stats
        </div>
        <StatsRow open={openCnt} done={doneCnt} />
      </div>
    </div>
  )
}

const DoneList = () => {
  return (
    <div id="mainContainer">
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
  return (
    <div id="mainContainer">
      archive
      <div className="todoGrid">
        {shelfTodos.map((todo, index) => (
          <TodoRow todo={todo} snooze={false} archive={false} key={index} />
        ))}
      </div>
    </div>
  )
}

export {TodoList, DoneList, ArchiveList};

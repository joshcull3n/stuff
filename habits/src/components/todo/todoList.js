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
   todo.__v      : 0
 }
 */

// TEST DATA
const testTask = {
  '_id'      : 'fdsfdsfdsfas21348124s',
  'title'    : 'take out trash',
  'notes'    : 'regular trash every week, compost every other week',
  'due'      : new Date('2024-11-13'),
  'category' : 'chores',
  'user'     : 'josh_username',
  'created'  : 1731386491566,
  'updated'  : 1731387119881,
  '__v'      : 1
}
const todos = [testTask, testTask, testTask, testTask, testTask, testTask, testTask, testTask, testTask, testTask]
const doneTodos = [testTask]


// helper functions
function getDueDateString(dueMillis) {
  const now = new Date();
  const duedate = new Date(dueMillis);
  const difference = Math.ceil((duedate - now) / (1000 * 60 * 60 * 24));
  return `${difference} days left`
}

function getAgeString(createdMillis) {
  const now = new Date();
  const ageDate = new Date(createdMillis);
  const difference = Math.floor((now - ageDate) / (1000 * 60 * 60 * 24));
  return `${difference} days old`
}

// sub-components
const BaseButtonElement = ({text, image}) => {
  return ( <div className="todoBtn">{text}</div>)
}

const TodoRow = ({todo}) => {
  const Title = () => <div className="todoCell">{todo.title}</div>
  const Notes = () => <div className="todoCell">{todo.notes}</div>    // task description/notes
  const DueDate = () => <div className="todoCell">{getDueDateString(todo.created)}</div>  // task due date
  const Category = () => <div className="todoCell">{todo.category}</div> // task category
  const Age = () => <div className="todoCell">{getAgeString(todo.created)}</div> // task age

  const CompleteBtn = () => <BaseButtonElement text="fin" /> // complete button
  const SnoozeBtn = () => <BaseButtonElement text="snz" />   // snooze button
  const DeleteBtn = () => <BaseButtonElement text="del" />  // delete button

  return(
    <div className='todoRow'>
      <CompleteBtn />
      <Title />
      <DueDate />
      <Category />
      <SnoozeBtn />
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

// main components
const TodoList = () => {
  //const { todos } = useContext(TodoContext);
  const openCnt = todos.length
  const doneCnt = doneTodos.length

  return (
    <div>
      <div id="mainContainer">
        <div className="todoGrid">
          {todos.map((todo, index) => (
            <TodoRow todo={todo} key={index} />
          ))}
        </div>
      </div>
      <div id="mainContainer" style={{'padding':'0px'}}>
        <StatsRow open={openCnt} done={doneCnt} />
      </div>
    </div>
  )
}

const DoneList = () => {
  return (
    <div id="mainContainer" className="doneContainer">
      <div className="todoGrid">
        {doneTodos.map((todo, index) => (
          <TodoRow todo={todo} key={index} />
        ))}
      </div>
    </div>
  )
}

export {TodoList, DoneList};

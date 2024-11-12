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

// main component
const TodoList = () => {
  //const { todos } = useContext(TodoContext);
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
  const todos = [testTask]

  const totalCounter = ( <></> )
  const doneCounter = ( <></> )
  const openCounter = ( <></> )

  return (
    <div id="mainContainer">
      <div className="todoGrid">
        {todos.map((todo, index) => (
          <TodoRow todo={todo} key={index} />
        ))}
      </div>
    </div>
  )
}

// sub-components
const TodoRow = ({todo}) => {
  const Title = () => <div className="todoCell">{todo.title}</div>
  const Notes = () => <div className="todoCell">{todo.notes}</div>    // task description/notes
  const DueDate = () => <div className="todoCell">{getDueDateString(todo.created)}</div>  // task due date
  const Category = () => <div className="todoCell">{todo.category}</div> // task category
  const Age = () => <div className="todoCell">{getAgeString(todo.created)}</div> // task age

  const CompleteBtn = ( <></> ) // complete button
  const SnoozeBtn = ( <></> )   // snooze button
  const DeleteBtn = ( <></> )   // delete button

  return(
    <div className='todoRow'>
      <Title />
      <Notes />
      <DueDate />
      <Category />
      <Age />
    </div>
  )
}

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

export default TodoList;

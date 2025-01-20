import { useContext, useState, useRef, useEffect } from 'react'
import { Context } from '../../Context.js'
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
    return ''
    // return 'someday'
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
  else if (difference === 1) {
    return 'tomorrow';
  }
  else {
    return `${difference} days left`
  }
}

// due dates take precedent. when no due date, fallback to updated date.
function sortTodos(todosToSort, order='default', ignore_duedate=false) {
  return [...todosToSort].toSorted((a, b) => {
    const duedateA = a.due_date || Infinity;
    const duedateB = b.due_date || Infinity;

    if (!ignore_duedate && (duedateA !== duedateB))
      return duedateA - duedateB; // lowest due date first (soonest)
    
    const updatedA = a.updated_date || 0;
    const updatedB = b.updated_date || 0;

    if (order === 'desc')
      return updatedB - updatedA // last updated_date at top
    return updatedA - updatedB   // (default) first updated_date at top
  });
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
    },
    filter: {
      className: "todoButton",
      imgId: "filterButton",
      alt: "filter"
    },
    category: {
      className: "categoryButton todoCell todoLabel",
      content: text
    },
    edit: {
      className: "todoButton",
      imgId: "editButton",
      alt: "edit"
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
  const { mobile } = useContext(Context);
  const { todos, setTodos, 
    setNewCategory, setFilterString, 
    filterString, setFilteredTodos, 
    setCategoryFilterEnabled, setShowFilterInput,
    editingTitleIndex, setEditingTitleIndex,
    titleFieldWidth, setTitleFieldWidth, 
    categorySelected, setCategorySelected
  } = useContext(TodoContext);
  const [editingTitleValue, setEditingTitleValue] = useState(todo.title);

  const DueDate = () => <div className="todoCell todoLabel dueDate">{getDueDateString(todo.due_date)}</div>
  const CompleteBtn = () => <BaseButtonElement text="fin" type={(done && "finDone") || "fin"} onclick={() => changeStatus(todo, 'complete', 'incomplete')}/>
  const SnoozeBtn = () => <BaseButtonElement text="snz" type="snz" onclick={() => changeStatus(todo, 'snoozed', 'incomplete')}/>
  const ArchiveBtn = () => <BaseButtonElement text="arc" type="arc" onclick={() => changeStatus(todo, 'archived')}/> 
  const UnarchiveBtn = () => <BaseButtonElement text="unarc" type="unarc" onclick={() => changeStatus(todo, 'incomplete')}/> 
  const DeleteBtn = () => <BaseButtonElement text="del" type="del" onclick={() => deleteTodo(todo)}/>
  const CategoryBtn = () => <BaseButtonElement text={todo.category} type="category" onclick={() => handleCategoryBtnClick(todo.category)}/>
  const EditBtn = () => <BaseButtonElement text="edit" type="edit" onclick={()=> {}}/>
  const Title = () => {
    const titleFieldRef = useRef(null);
    const editFieldRef = useRef(null);

    const handleTitleDoubleClick = (todo) => {
      if (!todo.title)
        return
      if (String(todos.indexOf(todo)) !== editingTitleIndex) {
        setEditingTitleIndex(String(todos.indexOf(todo)));
        setEditingTitleValue(todo.title);
        setTitleFieldWidth(`${titleFieldRef.current.offsetWidth - 6}px`);
      }
    }
  
    const handleEditingTitleKeyDown = (e, todo) => {
      if (e.code === 'Enter') {
        changeTitle(todo, e.target.value);
        setEditingTitleIndex('');
        setEditingTitleValue('');
        setTitleFieldWidth('');
      }
      if (e.code === 'Escape') {
        setEditingTitleIndex('');
        setEditingTitleValue('');
        setTitleFieldWidth('');
      }
    }
  
    const handleEditingTitleChange = (e) => {
      setEditingTitleValue(e.target.value);
    }

    useEffect(() => {
      if (editFieldRef.current && titleFieldWidth)
        editFieldRef.current.style.width = titleFieldWidth; // required because the input field is not width bound by the field content
    }, [titleFieldWidth]);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (editFieldRef.current && !editFieldRef.current.contains(e.target)) {
          setEditingTitleIndex('');
          setEditingTitleValue('');
          setTitleFieldWidth('');
        }
      };
  
      if (editingTitleIndex === String(todos.indexOf(todo))) {
        document.addEventListener('mousedown', handleClickOutside);
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [editingTitleIndex])

    if (editingTitleIndex === String(todos.indexOf(todo)))
      return (
        <input 
          ref={editFieldRef}
          className={(done && "todoCell doneTitle") || "todoCell"} 
          onDoubleClick={handleTitleDoubleClick} 
          onKeyDown={(e) => handleEditingTitleKeyDown(e, todo)}
          autoFocus 
          defaultValue={editingTitleValue}
        />
      )
    return (
      <div
        ref={titleFieldRef}
        className={(done && "todoCell doneTitle") || "todoCell"} 
        onDoubleClick={() => handleTitleDoubleClick(todo)}
      >
          {/* <div>{todo.title}</div>
          <div style={{'maxWidth':'15px'}}><EditBtn /></div> */}
          {todo.title}
        </div>
    )
  }

  function deleteTodo(todoToDelete) {
    let newTodoArray = todos.filter(todo => todo._id !== todoToDelete._id)
    setTodos(newTodoArray);
    setFilteredTodos(newTodoArray.filter((todo) => {
      let categorySelectedStr = categorySelected ? categorySelected.toLowerCase() : null;
      return (todo.title.toLowerCase().includes(categorySelectedStr) || todo.category && todo.category.toLowerCase().includes(categorySelectedStr))
    }));
    deleteTodoReq(todoToDelete._id);
  }


  // if task status is already status, use altStatus
  function changeStatus(todoToUpdate, status, altStatus) {
    let changeStatus = status;
    if (todoToUpdate.status === status)
      changeStatus = altStatus;
    const newTodos = todos.map(todo => {
      if (todo._id === todoToUpdate._id) {
        todo.updated_date = Date.now();
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

  function changeTitle(todoToUpdate, newTitle) {
    if (newTitle === todoToUpdate.title)
      return
    const newTodos = todos.map(todo => {
      if (todo._id === todoToUpdate._id) {
        todo.updated_date = Date.now();
        todo.title = newTitle;
      }
      return todo;
    })
    updateTodo(todoToUpdate)
    setTodos(newTodos);
  }

  function handleCategoryBtnClick(category) {
    setCategoryFilterEnabled(true);
    setFilterString(category);
    setCategorySelected(category);
    setNewCategory(category);
  }

  return (
    <div className='todoRow'>
      <CompleteBtn />
      <Title />
      {/* { (mobile !== true && <EditBtn />) || <div></div> } */}
      { (mobile !== true && <DueDate />) || <div></div> }
      { (mobile !== true && todo.category && <CategoryBtn />) || <div></div> }
      { showSnoozeBtn === true && <SnoozeBtn /> }
      { (mobile !== true && showArchiveBtn === true && <ArchiveBtn />) || (showArchiveBtn === false && <UnarchiveBtn />) }
      { (mobile !== true && <DeleteBtn />) }
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
  const { 
    todos, setTodos, 
    loggedInUser, 
    newCategory, setNewCategory, 
    categorySelected, 
    setFilteredTodos, 
    categoryFilterEnabled,
    setShowFilterInput
  } = useContext(TodoContext);
  const [newTodoText, setNewTodoText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const inputRef = useRef(null);

  const handleTodoInputChange = (e) => { setNewTodoText(e.target.value); }
  // const handleTodoDueDateSelectionChange = (e) => { setNewDueDate(e.target.value) }

  const handleTodoInputEnter = async (e) => {
    if (e.key === 'Enter') {
      await inputTodo();
    }
  }

  const handleTodoInputBtnClick = async (e) => {
    await inputTodo();
  }

  async function inputTodo() {
    if (newTodoText.trim()) {
      const dueDate = new Date(newDueDate).getTime();
      const newTodo = {
        id: todos.length + 1,
        title: newTodoText,
        status: 'incomplete',
        description: null,
        due: dueDate || null,
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
      setNewDueDate('');
      setFilteredTodos(tempArray.filter((todo) => {
        let categorySelectedStr = categorySelected ? categorySelected.toLowerCase() : null;
        return (todo.title.toLowerCase().includes(categorySelectedStr) || todo.category && todo.category.toLowerCase().includes(categorySelectedStr))
      }));
      if (!categoryFilterEnabled)
        setNewCategory('');

      inputRef.current?.focus();
    }
  }


  const CategoryDropdown = () => {
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [creatingCategoryValue, setCreatingCategoryValue] = useState('');
    const { categorySelected, setCategorySelected,
      setCategoryFilterEnabled, setNewCategory, setFilterString
    } = useContext(TodoContext);
    const { lightMode } = useContext(Context);

    const existingCategories = [];
    todos.forEach(todo => {
      if (todo.category && !existingCategories.includes(todo.category))
        existingCategories.push(todo.category);
    });

    const handleCategoryDropdownClick = () => {
      setShowCategoryList(!showCategoryList);
    }

    const handleCategoryOptionClick = (e) => {
      setCategorySelected(e.target.innerHTML);
      setNewCategory(e.target.innerHTML);
      setCategoryFilterEnabled(true);
      setFilteredTodos(
        todos.filter((todo) => { return (todo.category && todo.category.toLowerCase().includes(e.target.innerHTML.toLowerCase()))})
      );
    }

    const handleNewCategoryOptionClick = (e) => {
      setCreatingCategory(true);
    }

    const handleClearCategoryClick = (e) => {
      e.stopPropagation();
      setCategoryFilterEnabled(false);
      setCategorySelected('');
    }

    const createCategory = (e) => {
      if (e.key === 'Enter') {
        setNewCategory(e.target.value);
        setCategorySelected(e.target.value);
        setCategoryFilterEnabled(true);
      }
    }

    const handleCreateCategoryChange = (e) => {
      setCreatingCategoryValue(e.target.value);
    }

    const categoryDropdownStyle = {
      borderBottom: (showCategoryList && !lightMode && 'unset'),
      borderBottomLeftRadius: (showCategoryList && !lightMode && 'unset'),
      borderBottomRightRadius: (showCategoryList && !lightMode && 'unset'),
      borderColor: showCategoryList && 'var(--main-font-color)'
    }

    const categoryDropdownOptionsStyle = {
      borderTopLeftRadius: (showCategoryList && !lightMode && 'unset'),
      borderTopRightRadius: (showCategoryList && !lightMode && 'unset'),
    }

    return (
      <div>
        <div className='categoryDropdown' onClick={handleCategoryDropdownClick} style={categoryDropdownStyle}>
          {(categorySelected && <span className='selectedCategory'>{categorySelected}</span>) || <span className='unselectedCategory' onClick={handleCategoryDropdownClick}>list</span>}
          {categorySelected && <span className='clearCategoryBtn' onClick={handleClearCategoryClick}>x</span>}
        </div>
        {showCategoryList && (
          <div className='categoryDropdownOptions' style={categoryDropdownOptionsStyle}>
            {existingCategories.map(cat => <div className='categoryOption' onClick={handleCategoryOptionClick}>{cat}</div>)}
            {!creatingCategory && <div className='newCategoryOption categoryOption' onClick={handleNewCategoryOptionClick}>+</div> 
              || <div className='newCategoryInput'><input type='text' placeholder='new list' autoFocus 
              onChange={handleCreateCategoryChange} onKeyDown={createCategory} value={creatingCategoryValue}/></div>
            }
          </div>
        )}
      </div>
    )
  }

  return (
    <div id="todoInput">
      <input style={{'width':'100%', 'padding':'0 10px', 'margin':'1px 0' }} 
        placeholder='add a todo...'
        value={newTodoText}
        ref={inputRef}
        onKeyDown={handleTodoInputEnter}
        onChange={handleTodoInputChange} 
      />
      <div style={{'display':'flex','justifyContent':'center', 'paddingBottom':'1px', 'marginTop':'1px' }}>
        <CategoryDropdown />
        {/* <input type='date' className='dateSelector' value={newDueDate}
          onChange={handleTodoDueDateSelectionChange} onKeyDown={handleTodoInputEnter} 
        /> */}
        <div id='inputBtn' onClick={handleTodoInputBtnClick}>+</div>
      </div>
    </div>
  )
}

const PanelTitle = ({title, count, count2}) => {
  if (count2)
    return ( <div className='panelTitle'><span>{title}</span><span>{count} ({count2})</span></div> )
  if (count || count === 0)
    return ( <div className='panelTitle'><span>{title}</span><span>{count}</span></div> )
  else
    return ( <div className='panelTitle'><span>{title}</span></div> )
}

const FilterInput = () => {
  const { 
    todos, 
    showFilterInput, setShowFilterInput,
    filterString, setFilterString, 
    setFilteredTodos,
    setCategorySelected
  } = useContext(TodoContext);

  useEffect(() => { filterTodoList(filterString); }, [filterString])

  const handleFilterChange = (e) => { 
    setCategorySelected('');
    setFilterString(e.target.value);
  }

  const handleFilterKeyDown = (e) => {
    if (e.code === 'Escape') {
      setShowFilterInput(false);
    }
  }

  function filterTodoList(filterString) {
    setFilteredTodos(
      todos.filter((todo) => {
        return (todo.title.toLowerCase().includes(filterString) || (todo.category && todo.category.toLowerCase().includes(filterString)))
      })
    );
  };

  return ( 
    <input 
      className={`filterInput ${showFilterInput ? '' : 'hidden disabled'}`}
      type='text'
      placeholder='filter' 
      onChange={handleFilterChange}
      value={filterString}
      onKeyDown={handleFilterKeyDown}
      id="filterInput"
      />
  )
}

// filter overall todos by given status and search query, and sort them
function filterAndSort(todos, filteredTodos, filterString, status, ordering, ignore_duedate=false) {
  const statusFilteredTodos = todos.filter((todo) => todo.status === status);
  if (!filteredTodos.length && !filterString.length)
    return sortTodos(statusFilteredTodos, ordering, ignore_duedate) 
  return sortTodos(filteredTodos.filter((todo) => todo.status === status), ordering, ignore_duedate);
}

// main components
const TodoList = () => {
  const { todos, setTodos, ordering, 
    showFilterInput, setShowFilterInput,
    filteredTodos, setFilteredTodos,
    filterString, setFilterString,
    setNewCategory
  } = useContext(TodoContext);

  const openTodos = filterAndSort(todos, filteredTodos, filterString, 'incomplete', ordering);
  const snoozedTodos = filterAndSort(todos, filteredTodos, filterString, 'snoozed', ordering);
  const openCount = openTodos.length;

  function switchShowFilterInput() {
    setShowFilterInput(!showFilterInput);
    if (showFilterInput) {
      setFilterString('');
      setTodos(todos);
      setFilteredTodos(todos);
      setNewCategory('');
    }
  }

  const FilterButton = () => {
    return ( <BaseButtonElement text="filter" type="filter" onclick={() => switchShowFilterInput()}/> )
  }

  return (
    <div>
      <div className='onTop'>
        <div className='todoListContainer fadeIn'>
          <TodoInput />
        </div>
      </div>
      <div className='todoListContainer fadeIn'>
        <div className='todoListHeader'>
          <PanelTitle title='todo' count={openCount} /*count2={openCount != totalCount && totalCount}*//>
          <FilterButton /><FilterInput />
        </div>
        <div className='todoGrid'>
          { 
            openTodos.length > 0 ? openTodos.map((todo, index) => (
              <TodoRow todo={todo} showSnoozeBtn={true} showArchiveBtn={true} key={index} />
            )) : <div className='todoRow noTasks'></div>
          }
        </div>
        { snoozedTodos.length > 0 && (
          <div className='todoGrid' style={{ padding: '5px 0' }}>
            <div className='fadedContainer'> 
              <div style={{fontSize:'x-small'}}><PanelTitle title='snoozed' count={snoozedTodos.length}/></div>
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
  const { todos, filteredTodos, filterString } = useContext(TodoContext);
  const doneTodos = filterAndSort(todos, filteredTodos, filterString, 'complete', 'desc', true);

  return (
    <div className="todoListContainer fadedContainer fadeInHalf">
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
  const { todos, ordering, filteredTodos, filterString} = useContext(TodoContext);
  const archivedTodos = filterAndSort(todos, filteredTodos, filterString, 'archived', ordering);
  
  return (
    <div className="todoListContainer fadeIn">
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

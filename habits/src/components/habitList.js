import { useContext } from 'react'
import { Context } from '../Context.js'

import Habit from './habit.js'
import HabitDates from './habitDates.js'

const HabitList = ({ dateLabels, mobile }) => {
  const { habits, setHabits, startDate, setStartDate, 
    endDate, setEndDate, setUpdateRemote } = useContext(Context);

  // generate list of date strings between two given dates
  function genDates(startDate, endDate) {
    var dates = [];
    const currDate = new Date(startDate);

    while (currDate <= endDate) {
      dates.unshift(currDate.toDateString());
      currDate.setDate(currDate.getDate() + 1);
    }

    return dates;
  }

  // paginate dates 1 day into the past
  function datePageLeftDay() {
    var tempStart = new Date(startDate);
    var tempEnd = new Date(endDate);
    var today = new Date();

    if (tempEnd.toDateString() !== today.toDateString()) {
      tempStart.setDate(tempStart.getDate() + 1);
      setStartDate(tempStart);
      tempEnd.setDate(tempEnd.getDate() + 1);
      setEndDate(tempEnd);
    }
  }

  // paginate dates 1 day into the future
  function datePageRightDay() {
    var tempStart = new Date(startDate);
    var tempEnd = new Date(endDate);
    
    tempStart.setDate(tempStart.getDate() - 1);
    setStartDate(tempStart);
    tempEnd.setDate(tempEnd.getDate() - 1);
    setEndDate(tempEnd);
  }

  function setLabelOpacity(habit) {
    const habitLabelElements = document.querySelectorAll(".habitItem");
    habitLabelElements.forEach (habitElement => {
      let opacityValue = 1.0;
      let transitionValue = "opacity 0.2s ease-in-out"
      if (habit) {
        if (habitElement.textContent !== habit.title) {
          opacityValue = 0.5;
          transitionValue = "";
        }
      }
      habitElement.style.opacity = opacityValue;
      habitElement.style.transition = transitionValue;
    })
  }

  function deleteHabit(habitToDel) {
    setUpdateRemote(true);
    setHabits(habits.filter(habit => habit._id !== habitToDel._id));
  }

  const DeleteButton = (props) => {
    return (
      <div className='deleteButton' onMouseEnter={() => setLabelOpacity(props.habit)} 
        onMouseLeave={() => setLabelOpacity(null)} onClick={() => deleteHabit(props.habit)}>
        <img alt='x' id="deleteButton" style={{verticalAlign: 'baseline'}}/>
      </div>
    )
  }

  const DatePageButtonLeft = (props) => {
    if (props.mobile) {
      return ( 
        <div>
          <img alt='date page left' id="calendarLeft" className="datePaginator" 
            style={{width: '25px', float: 'right', marginRight: '-5px', paddingTop: '2px'}} 
            onClick={() => { datePageLeftDay() }}/>
        </div>
      )
    }
    else {
      return ( 
        <div>
          <img alt='date page left' id="calendarLeft" className="datePaginator" 
            style={{width:'15px', float:'right'}} 
            onClick={() => { datePageLeftDay() }}/>
        </div>
      )
    }
  }

  const DatePageButtonRight = (props) => {
    if (props.mobile) {
      return (
        <div>
          <img alt='date page right' id="calendarRight" className="datePaginator" 
            style={{width:'25px', float:'left', marginLeft: '-1px', paddingTop: '2px'}} 
            onClick={() => { datePageRightDay() }}/>
        </div>
      )
    }
    else {
      return (
        <div>
          <img alt='date page right' id="calendarRight" className="datePaginator" 
            style={{width:'15px', float:'left', paddingLeft: '1px'}} 
            onClick={() => { datePageRightDay() }}/>
        </div>
      )
    }
  }

  const EmptyHabitList = () => {
    return (
    <div className='centered'>
      <div style={{opacity:0.7, textAlign: 'center', fontFamily:'monospace'}}>
        add a habit below.<br/>(quit smoking, floss everyday, etc.)
      </div>
    </div>
    )
  }

  const FullHabitList = () => {
    if (mobile) {
      return (
        <div className="habitGrid">
          <div className="dateLabelsRow">
            <DatePageButtonLeft mobile={true} />
            {dateLabels.map((label, index) => (
              <span className="mobileDateLabel" id={label} key={index}>
                {label}
              </span>
            ))}
            <DatePageButtonRight mobile={true} />
          </div>
          {habits.map((habit, index) => (
            <div className="habitRow" key={index}>
              <div className="habitLabel"
                onMouseEnter={() => setLabelOpacity(habit)}
                onMouseLeave={() => setLabelOpacity(null)}
              >
                <Habit habit={habit} />
              </div>
              <HabitDates habit={habit} dateRangeDates={genDates(startDate, endDate)} />
              <DeleteButton className="deleteButton" id={habit.id} habit={habit} />
            </div>
          ))}
        </div>
      )
    }
    else {
      return (
        <div className="habitGrid">
          <div className="dateLabelsRow">
            <DatePageButtonLeft mobile={false} />
            {dateLabels.map((label, index) => (
              <span className="dateLabel" id={label} key={index}>
                {label}
              </span>
            ))}
            <DatePageButtonRight mobile={false} />
          </div>
          {habits.map((habit, index) => (
            <div className="habitRow" key={index}>
              <div className="habitLabel"
                onMouseEnter={() => setLabelOpacity(habit)}
                onMouseLeave={() => setLabelOpacity(null)}
              >
                <Habit habit={habit} />
              </div>
              <HabitDates habit={habit} dateRangeDates={genDates(startDate, endDate)} />
              <DeleteButton className="deleteButton" id={habit.id} habit={habit} />
            </div>
          ))}
        </div>
      )
    }
  }

  if (habits.length < 1)
    return <EmptyHabitList />;
  else
    return <FullHabitList />;

}

export default HabitList;

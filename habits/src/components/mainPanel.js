import HabitList from './habitList.js';
import { TodoList, DoneList, ArchiveList, StatsPanel } from './todo/todoList.js'
import Graph from './graph.js';
import { Context } from '../Context.js';
import { useContext, useMemo } from 'react';

function setElementOpacityById(elemId, opacityValue, fade=true) {
  let id = '#' + elemId
  const element = document.querySelector(id);
  if (fade) { element.style.transition = "opacity 0.2s ease-in-out" }
  element.style.opacity = opacityValue;
}

export const AppBar = () => {
  const { viewMode, setViewMode, VIEW_MODES } = useContext(Context);

  const ViewTitle = ({title, selected=false}) => {
    let viewmode = Object.values(VIEW_MODES).find(value => title === value);

    return selected ? (
      <div className="selectedViewTitle">{title}</div>
    ) : (
      <div id={`${title}Title`} className="unselectedViewTitle viewTitle"
        onMouseEnter={(e) => setElementOpacityById(e.currentTarget.id, 1)}
        onMouseLeave={(e) => setElementOpacityById(e.currentTarget.id, 0.5)}
        onClick={() => setViewMode(viewmode)}>{title}
      </div>
    )
  }

  return (
    <div className="titleGrid">
      {Object.keys(VIEW_MODES).map((key) => { return <ViewTitle key={key} title={VIEW_MODES[key]} selected={viewMode === VIEW_MODES[key]} /> })}
    </div>
  );
};

const HabitInput = ({mobile, handleHabitInputChange, handleHabitInputEnter, handleHabitInputBtnClick}) => {
  const { habits, newHabitText } = useContext(Context);
    
  return (
    <div className="centered" style={{ paddingTop:'1rem'}}>
      <div style={{display: 'inline-flex'}}>
        <input style={{textAlign:'center'}} 
          placeholder='add a new habit' 
          value={newHabitText} 
          onKeyDown={handleHabitInputEnter} 
          onChange={handleHabitInputChange}/>
        <div id='inputBtn' onClick={handleHabitInputBtnClick}>＋</div>
      </div>
    </div>
  )
};

const MainPanel = ({ mobile, handleHabitInputChange, handleHabitInputEnter, handleHabitInputBtnClick }) => {
  const { habits, startDate, endDate, viewMode, VIEW_MODES } = useContext(Context);

  const dateLabels = useMemo(() => {
    var tempDate = new Date(startDate);
    var labels = [];

    while (tempDate <= endDate) {
      var tempLabel = tempDate.getDate();
      if (tempLabel < 10)
        tempLabel = '0' + tempLabel.toString();
      labels.unshift(tempLabel.toString());
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return labels
  }, [startDate, endDate]);

  return (
    <div className='mainPanelContainer'>
      <div className="mainPanel" style={{padding:'5px 10px 10px'}}>
        {viewMode === VIEW_MODES.HABITS && (
            <div id="mainContainer">
              <HabitList mobile={mobile} habits={habits} dateLabels={dateLabels} />
              <HabitInput
                mobile={mobile}
                handleHabitInputEnter={handleHabitInputEnter}
                handleHabitInputChange={handleHabitInputChange}
                handleHabitInputBtnClick={handleHabitInputBtnClick}
              />
            </div>            
        )}
        {viewMode === VIEW_MODES.HABITS && habits.length > 0 && (
          <div>
            <Graph />
          </div>
        )}
        {viewMode === VIEW_MODES.TODO && (<div><TodoList /><ArchiveList /><DoneList /></div>)}
        {viewMode === VIEW_MODES.OVERVIEW && (<></>)}
      </div>
    </div>
  );
};

export default MainPanel;

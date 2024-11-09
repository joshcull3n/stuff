import HabitList from './habitList.js';
import Graph from './graph.js';
import { Context } from '../Context.js';
import { useContext } from 'react';

function setElementOpacityById(elemId, opacityValue, fade=true) {
  let id = '#' + elemId
  const element = document.querySelector(id);
  if (fade) { element.style.transition = "opacity 0.2s ease-in-out" }
  element.style.opacity = opacityValue;
}

const TopBar = () => {
  const { viewMode, setViewMode, VIEW_MODES } = useContext(Context);

  const ViewTitle = ({title, selected=false}) => {
    let viewmode = Object.values(VIEW_MODES).find(value => title === value);

    return selected ? (
      <div className="selectedViewTitle"><h2>{title}</h2></div>
    ) : (
      <div id={`${title}Title`} className="unselectedViewTitle viewTitle"
        onMouseEnter={(e) => setElementOpacityById(e.currentTarget.id, 1)}
        onMouseLeave={(e) => setElementOpacityById(e.currentTarget.id, 0.5)}
        onClick={() => setViewMode(viewmode)}>
        <h2>{title}</h2>
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
  const { newHabitText } = useContext(Context);
    
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

  function generateDateLabels() {
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
  }

  const CurrentView = () => {
    if (viewMode === VIEW_MODES.HABITS) {
      return (
        <div>
          <div id="habitListContainer">
            <HabitList mobile={mobile} habits={habits} dateLabels={generateDateLabels()} />
            <HabitInput mobile={mobile}
              handleHabitInputEnter={handleHabitInputEnter}
              handleHabitInputChange={handleHabitInputChange}
              handleHabitInputBtnClick={handleHabitInputBtnClick} />
          </div>
        </div>
      )
    }
    else if (viewMode === VIEW_MODES.TODO)
      return <div></div>
    else {
      return <div></div>
    }
  }

  return (
    <div className='mainPanelContainer'>
      <div className="mainPanel" style={{padding:'10px'}}>
        <TopBar currentView={viewMode} />
        <CurrentView />
        {viewMode === VIEW_MODES.HABITS && <Graph />}
      </div>
    </div>
  );
};

export default MainPanel;

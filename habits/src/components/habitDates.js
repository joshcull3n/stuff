import { useContext } from "react";
import { Context } from "../Context";

const HabitDates = ({ habit, dateRangeDates }) => {
  const { habits, setHabits, setUpdateRemote } = useContext(Context);

  function setLabelOpacity(date, habit) {
    const dateLabelElements = document.querySelectorAll(".dateLabel");
    const habitLabelElements = document.querySelectorAll(".habitItem");
    dateLabelElements.forEach(labelElement => {
      let opacityValue = 1;
      let transitionValue = "opacity 0.2s ease-in-out"
      if (date) {
        const day = new Date(date).getDate();
        const labelDistance = Math.abs(Number(labelElement.id) - day)
        if (labelDistance !== 0) {
          opacityValue = 0.5;
          transitionValue = "";
        }
      }
      labelElement.style.opacity = opacityValue;
      labelElement.style.transition = transitionValue;
    });
    habitLabelElements.forEach(habitElement => {
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

  // checkbox component - determines whether or not to display checked based on given date and completed dates
  const Checkbox = (props) => {
    var checked = false;

    props.doneDates.forEach(date => {
      if (date.toDateString() === props.date)
        checked = true;
    });

    function handleCheck(e) {
      setUpdateRemote(true);
      var tempDates = Array.from(props.doneDates);
      var habitIndex = habits.indexOf(props.habit);

      if (!e.target.checked) {
        // remove date from habit.doneDates
        tempDates.forEach(date => {
          if (date.toDateString() === props.date) {
            var index = props.habit.doneDates.indexOf(date);
            if (index > -1)
              props.habit.doneDates.splice(index, 1);
          }
          var tempHabitsArr = Array.from(habits);
          if (habitIndex > -1)
            tempHabitsArr[habitIndex] = props.habit;
          setHabits(tempHabitsArr);
        })
      }
      else {
        // add date to habit.doneDates
        tempDates.push(new Date(props.date));
        var tempHabitsArr = Array.from(habits);
        tempHabitsArr[habitIndex].doneDates = tempDates;
        setHabits(tempHabitsArr);
      }
    }

    return (
      <div className="checkboxContainer" onMouseEnter={() => setLabelOpacity(props.date, props.habit)} onMouseLeave={() => setLabelOpacity(null)}>
        <input type="checkbox" checked={checked} onChange={handleCheck} />
      </div>
    )
  }

  return (
    <>
      { dateRangeDates.map((date, index) => <Checkbox key={index} index={index} habit={habit} date={date} doneDates={habit.doneDates} />) }
    </>
  )
}

export default HabitDates;

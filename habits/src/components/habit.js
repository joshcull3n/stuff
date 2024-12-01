/*
 * {
 *   habit._id : ObjectId('...'),
 *   habit.body : '...', 
 *   habit.doneDates : [Date,Date,Date]
 * }
 */

const Habit = ({ habit }) => {
  if (habit.title === 'XXX_INIT_XXX')
    return
  else
    return (
      <div className="habitItem">{habit.title}</div>
    )}

export default Habit;

// START SERVER
const express = require('express');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const app = express();
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}`));

const cors = require('cors');
app.use(cors());

const uri = (!process.argv.includes('--localdb') && process.env.MONGODB_URI) ? process.env.MONGODB_URI : 'mongodb://127.0.0.1:27017/habits';

console.log('connecting to : ', uri)

// CONNECT TO MONGODB
const { mongoose } = require('mongoose');
mongoose.connect(uri);

// CREATE SCHEMAS & MODELS
const userSchema = new mongoose.Schema({
  username : { type: String, required: true, unique: true },
  //email : { type: String, required: false, unique: false },
  created_date : { type: Number, required: true },
  updated_date : { type: Number, required: true },
  password_hash : { type: String, required: false }
});

userSchema.methods.hashPassword = async function(password) {
  return bcrypt.hash(password, saltRounds);
};

const User = mongoose.model('User', userSchema);
User.init().then(() => {
  console.log('User indexes created');
});

const habitSchema = new mongoose.Schema({
  owner_username : { type : String, required : true },
  title : { type: String, required: true },
  doneDates: { type: [String], required: true },
  frequency : String,
  status : String,
  created_date : { type: Number, required: true },
  updated_date : { type: Number, required: true }
});

const Habit = mongoose.model('Habit', habitSchema);
Habit.init().then(() => {
  console.log('Habit indexes created');
});

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["incomplete", "complete", "archived", "snoozed"] },
  description: String,
  category: String,
  due_date: Number,
  completed_date: Number,
  username: { type: String, required: true },
  created_date: { type: Number, required: true },
  updated_date: { type: Number, required: true },
  snooze_date: Number,
  order: Number
});

const Todo = mongoose.model('Todo', todoSchema);
Todo.init().then(() => {
  console.log('Todo indexes created');
})

// ALLOW APP TO PROCESS JSON IN REQUEST BODY
app.use(express.json());

// ROUTE ENDPOINTS
// base 'u up?' checks
app.get(`/habits/`, async (req, res) => {
  try {
    res.status(200).json('I\'m up wyd');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// ACCOUNT URLS
async function verifyUser(username, password) {
  const user = await User.findOne({username});
  try {
    if (user && await bcrypt.compare(password, user.password_hash))
      return true
    else
      return false
  } catch (error) {
    console.error('Error verifying user: ', error);
    return false;
  }
}

// verify password
app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message : 'User not found' })
    const verified = await verifyUser(username, password);
    if (verified) {
      console.log('user login success:', username);
      return res.status(200).json({ message: 'login successful'})
    }
    else {
      console.log('user login failed:', username);
      return res.status(401).json({message: 'incorrect password'})
    }
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// create new user
app.post('/habits/users/', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const date = new Date().getTime();
    const user = new User({ 
      username: username, 
      created_date: date, 
      updated_date: date 
    });
    if (password)
      user.password_hash = await user.hashPassword(password)
    await user.save();
    console.log('user created:', username);
    res.status(201).json(user.username);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get user info
app.get('/habits/users/', async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message : 'User not found' })
    const userResp = {
      username : user.username,
      created_date: user.created_date,
      updated_date: user.updated_date,
      password_protected: Boolean(user.password_hash)
    }
    console.log(username, 'is using habits');
    return res.json(userResp);
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// HABITS URLS
// get all habits for user
app.get('/habits/habits/', async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message : 'User not found' })
    const user_habits = await Habit.find({ owner_username: username });
    res.json(user_habits);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create new habit for user
app.post('/habits/habits/', async (req, res) => {
  try {
    const username = req.body.username;
    const newHabitTitle = req.body.title;
    const date = new Date().getTime();

    // check user exists
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message: 'User not found'});

    const newHabit = new Habit({ 
      owner_username: username, 
      title: newHabitTitle, 
      doneDates: [], 
      created_date: date, 
      updated_date: date 
    });
    await newHabit.save();

    res.status(201).json(newHabit);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update habit dates
app.patch('/habits/habits/', async (req, res) => {
  try {
    const habitId = req.body.id;
    const newDates = req.body.dates;
    const updated_date = new Date().getTime();
    
    // validation
    if (!Array.isArray(newDates))
      return res.status(400).json('Dates must be in an array');
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    for (const date of newDates) {
      const tempDate = new Date(date);
      if (!regex.test(date) || !(tempDate instanceof Date && !isNaN(tempDate)))
        return res.status(400).json('Invalid date in date array');
    };
    
    const updatedHabit = await Habit.findByIdAndUpdate(habitId, { 
      $set: { doneDates: newDates , updated_date: updated_date },
      $inc: { __v: 1 }
    }, { new: true });
    if (!updatedHabit)
      return res.status(404).json({ message: 'Habit not found' });

    res.json(updatedHabit);
  } 
  catch (error) {
    res.status(500).json('Error updating habit');
  }
});

app.put('/habits/habits', async (req, res) => {
  try {
    const username = req.body.username;
    const newHabits = req.body.habits;
    
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message : 'User not found' });
    const existingHabits = await Habit.find({ owner_username: username });

    // delete habits not in the new set
    const habitsToDelete = existingHabits.filter(oldHabit => !newHabits.some(newHabit => newHabit._id === oldHabit._id.toString()));
    await Habit.deleteMany({_id: {$in: habitsToDelete.map(habit => habit._id)}});

    // update habits that are in both sets
    const habitsToUpdate = existingHabits.filter(oldHabit => newHabits.some(newHabit => newHabit._id === oldHabit._id.toString()));
    var updatedHabits = 0;
    for (let habit of habitsToUpdate) {
      const updatedData = newHabits.find(newHabit => newHabit._id == habit._id.toString());

      // if date arrays are different, update the object
      function dateArraysAreEqual() {
        var arr1 = habit.doneDates;
        var arr2 = updatedData.doneDates;
        if (arr1.length !== arr2.length) {
          return false;
        }
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) {
              return false;
          }
        }
        return true;
      }

      if (!dateArraysAreEqual()) {
        const updatedDate = new Date().getTime();
        habit.doneDates = updatedData.doneDates;
        habit.updated_date = updatedDate;
        updatedHabits++;
      }
      
      await habit.save();
    }

    // create habits that are not in the existing set
    const habitsToCreate = newHabits.filter(newHabit => !existingHabits.some(oldHabit => newHabit._id === oldHabit._id.toString()));
    const date = new Date().getTime();
    await Habit.insertMany(habitsToCreate.map(habit => ({
      ...habit,
      owner_username: username,
      created_date: date,
      updated_date: date
    })));
    const outHabits = await Habit.find({ owner_username: username });
    res.status(200).json({
      changes: { deleted: habitsToDelete.length, updated: updatedHabits, created: habitsToCreate.length},
      habits : outHabits
    });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete habit
app.delete('/habits/habits/', async (req, res) => {
  try {
    const habitId = req.query.id;
    const result = await Habit.findByIdAndDelete(habitId);

    if (result)
      res.json(`Habit ${habitId} was deleted`);
    else
      res.status(404).json(`Habit with ID ${habitId} was not found`);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TODOS URLS
// get all todos for user
app.get('/todos/', async (req, res) => {
  if (req.query.username === undefined) {
    try {
      res.status(200).json('I\'m up wyd');
    } catch (error) {
      res.status(500);
    }
  }
  try {
    const username = req.query.username;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message : 'User not found' })
    const user_todos = await Todo.find({ username: username });
    res.json(user_todos);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create new todo for user
app.post('/todos/', async (req, res) => {
  try {
    const username = req.body.username;
    const todoBody = req.body.todo;

    // check user exists
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(404).json({ message: 'User not found'});

    const todo = new Todo({ 
      username: username, 
      title: todoBody.title,
      status: todoBody.status,
      description: todoBody.description,
      category: todoBody.category,
      due_date: todoBody.due,
      completed_date: todoBody.completed_date,
      created_date: todoBody.created_date, 
      updated_date: todoBody.updated_date,
      snooze_date: todoBody.snooze_date,
      order: todoBody.order,
    });
    await todo.save();

    res.status(201).json(todo);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update todo
app.patch('/todos/', async (req, res) => {
  try {
    const date = new Date().getTime();
    const todoId = req.body._id;
    const newTitle = req.body.title;
    const newStatus = req.body.status;
    const newDescription = req.body.description;
    const newCategory = req.body.category;
    const newDueDate = req.body.dueDate;
    const newOrder = req.body.order;
    const newSnoozeDate = req.body.snooze_date;

    const updateData = {
      title: newTitle,
      status: newStatus,
      description: newDescription,
      category: newCategory,
      due_date: newDueDate,
      order: newOrder,
      updated_date: date,
      snooze_date: newSnoozeDate
    }
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    const updatedTodo = await Todo.findByIdAndUpdate(todoId, { $set: cleanUpdateData, $inc: { __v: 1 } }, { new: true });
    if (!updatedTodo)
      return res.status(404).json({ message: 'Todo not found' });

    res.json(updatedTodo);
  } 
  catch (error) {
    res.status(500).json('Error updating todo');
  }
});

// delete todo
app.delete('/todos/', async (req, res) => {
  try {
    const todoId = req.body.id;
    const result = await Todo.findByIdAndDelete(todoId);

    if (result)
      res.json(`Todo ${todoId} was deleted`);
    else
      res.status(404).json(`Todo with ID ${todoId} was not found`);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});
require('dotenv').config(); // Load environment variables

const express = require('express');

const mongoose = require('mongoose');
const classroomRoutes = require("./classroomRoutes")
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json())
app.use("/", classroomRoutes)



// Root Endpoint
app.get('/', (req, res) => {
  res.send('Quiz Generation API is running.');
});
const PORT = process.env.PORT || 8000;
 
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}) 
.catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
});

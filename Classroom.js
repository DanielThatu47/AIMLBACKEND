const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    student: [] ,
    teacher: { 
        type: String, 
        required: true
     },
    profile:{
        type: String, 
        required: true
    },
    name:{
        type:String ,
        required:true
    },
    quiz: [
        {
            heading: String,
            assigned:{
                type:Boolean,
                default:false
            },
            questions: Array
        }
    ]
});
// const Classroom = mongoose.model('Classroom', classroomSchema);
module.exports = mongoose.model('Classroom', classroomSchema);

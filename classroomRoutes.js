const express = require('express');
const router = express.Router();
const Classroom = require('./Classroom');
const axios = require ('axios');

// Create a classroom
router.post('/classrooms', async (req, res) => {
    try {
        console.log(req.body);
        const classroom = await Classroom.create(req.body);
        console.log(classroom)
        res.status(201).json({ classroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create classroom' });
    }
});

// Get all classrooms
router.get('/classrooms', async (req, res) => {
    try {
        const classrooms = await Classroom.find();
        res.json({ classrooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch classrooms' });
    }
});

// Join user to a classroom
router.post('/classrooms/join', async (req, res) => {
    try {
        const { className, code, userEmail } = req.body;
        console.log("1",className, code, userEmail)
        console.log("2",req.body)
        const classroom = await Classroom.findOne({ code: code });
        console.log("3",classroom)
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        const updatedClassroom = await Classroom.updateOne({_id:classroom._id},{ $push: { student: userEmail } },{new:true})
        // Store user's email along with classroom data
        // const updatedClassroom = await Classroom.findByIdAndUpdate(classroom._id,
        //     {
        //         userEmail: userEmail
        //     },
        //     {
        //         new: true
        //     });
            console.log("4",updatedClassroom)
        res.status(200).json({ message: 'User joined to classroom successfully', classroom: updatedClassroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to join user to classroom' });
    }
});

router.get('/joined/:student',async(req,res)=>{
    try {
        const student = req.params.student;
        const classrooms = await Classroom.find({student:student});
         res.status(200).json({ message: 'User joined classrooms', classrooms:classrooms });
    } catch (error) {
        res.status(500).json({ message: 'User has not joined classroom' });
    }
})
router.get('/created/:teacher',async(req,res)=>{
    try {
        const teacher = req.params.teacher;
        const classrooms = await Classroom.find({teacher:teacher});
         res.status(200).json({ message: 'Teacher created classrooms', classrooms:classrooms });
    } catch (error) {
        res.status(500).json({ message: 'User has not joined classroom' });
    }
})



router.get('/classrooms/bycode/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const classroom = await Classroom.findOne({ code: code });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        console.log(classroom)
        res.json({ classroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch classroom by code' });
    }
});

module.exports = router;

router.get('/classrooms/user/:email', async (req, res) => {
    try {

        const userEmail = req.params.email;
        const classrooms = await Classroom.find({ userEmail: userEmail });

        res.json({ classrooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch user classrooms' });
    }
});



router.get('/classrooms/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        
        res.json({ classroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch classroom by ID' });
    }
});


router.get('/classrooms/user/:code' , async (req , res)=>{

    try{
       
        const classroom = await classroom.find({
            code : classCode
        });
        res.json(classroom.title , classroom.description ,classroom.code);

    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: 'Not able to find actual classroom' });

    }
}
)


router.post('/generate', async (req, res) => {
    try {
        const { input_text, code, heading } = req.body;

        const classroom = await Classroom.findOne({ code });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        const hfResponse = await axios.post(
            "https://danielthatu12-ezquiz.hf.space/generate_questions",
            { input_text },
            { timeout: 60000 } // VERY IMPORTANT
        );

        if (!hfResponse.data || !hfResponse.data.questions) {
            return res.status(502).json({
                message: 'AI failed to generate questions'
            });
        }

        await Classroom.updateOne(
            { _id: classroom._id },
            {
                $push: {
                    quiz: {
                        heading,
                        questions: hfResponse.data.questions,
                        assigned: false
                    }
                }
            }
        );

        const updated = await Classroom.findOne({ code });
        res.status(201).json({ quiz: updated.quiz });

    } catch (error) {
        console.error("Generate error:", error.message);
        res.status(500).json({
            message: 'Quiz generation failed. Please try again.'
        });
    }
});


router.get('/quizzes/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const classroom = await Classroom.findOne({ code });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json({ quizzes: classroom.quiz });
        console.log(classroom.quiz)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
});

router.get('/quiz/:code/:heading', async (req, res) => {
    try {
        const code = req.params.code;
        const heading = req.params.heading;
        console.log('1' , code  , "2:" , heading)
        const classroom = await Classroom.findOne({ code });
        
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        console.log("classroom", classroom)
        const quiz = await Classroom.findOne({_id:classroom._id},{quiz:{$elemMatch:{heading:{$eq:heading}}}})
        // const quiz  = await Classroom.findOne({_id:classroom._id,quiz:{$elemMatch:{heading:{$eq:heading}}}})
        console.log("quiz",quiz.quiz[0].questions)
        res.json({ quizzes:quiz.quiz[0].questions});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
});


//post quiz
router.get("/post/:code/:heading",async(req,res)=>{
    try{
        const code = req.params.code;
        const heading = req.params.heading;
        const classroom = await Classroom.findOne({ code });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        const updatedClassroom = await Classroom.updateOne({_id:classroom._id,quiz:{$elemMatch:{heading:{$eq:heading}}}},{$set:{"quiz.$.assigned":true}},{new:true})
        const Assigned = await Classroom.findOne({ code });
        res.status(201).json({Assigned})
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
})




router.get("/post/:code/:heading/:email",async(req,res)=>{
    try{
        const code = req.params.code;
        const heading = req.params.heading;
        const student = req.params.email;
        const classroom = await Classroom.findOne({ code });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        const updatedClassroom = await Classroom.updateOne({_id:classroom._id,quiz:{$elemMatch:{heading:{$eq:heading}}}},{$set:{"quiz.$.assigned":true}},{new:true})
        const Assigned = await Classroom.findOne({ heading });
        res.status(201).json({Assigned})
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
})

//assigned quiz
router.get("/assigned/:code",async(req,res)=>{
    const code = req.params.code;
    const classroom = await Classroom.findOne({ code });
    if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
    }
})







import express from 'express'
import { analyzeResume, generateQuestion, submitAnswer, finishInterview, getMyInterviews, getInterviewReport, deleteInterview } from '../controllers/interview.controller.js';
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';


const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth , upload.single("resume"), analyzeResume)
interviewRouter.post("/generate-questions",isAuth,generateQuestion)
interviewRouter.post("/submit-answer",isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)

interviewRouter.get("/get-interview",isAuth,getMyInterviews)
interviewRouter.get("/report/:id",isAuth,getInterviewReport)
interviewRouter.delete("/delete/:id",isAuth,deleteInterview)

export default interviewRouter
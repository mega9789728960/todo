import express from 'express';
import sendcode from '../controller/sendcode.js';
const sendcodeRouter = express.Router();
sendcodeRouter.use("/sendcode",sendcode)
export default sendcodeRouter;
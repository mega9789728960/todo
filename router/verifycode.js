import express from 'express';
import verifycode from '../controller/verifycode.js';
const verifycodeRouter = express.Router();

verifycodeRouter.post('/verifycode', verifycode);

export default verifycodeRouter;
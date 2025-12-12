import express from 'express';
import login from "../controller/login.js"
const loginRouter = express.Router();
loginRouter.use('/login', login);
export default loginRouter;
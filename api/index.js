import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookieparser";

dotenv.config();

import loginRouter from '../router/login.js';
import sendcodeRouter from '../router/sendcode.js';
import registerRouter from '../router/register.js';
import verifyRouter from '../router/verifycode.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(loginRouter)
app.use(sendcodeRouter);
app.use(registerRouter);
app.use(verifyRouter);
app.use(cookieParser());

export default app;



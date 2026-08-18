import express from 'express';
import { acceptConnection, sendConnection, rejectConnection, getConnections, removeConnection, getConnectionRequests, getUserConnections  } from '../controllers/connection.controller.js';
import isAuth from './../middlewares/isAuth.js';


const connectionRouter = express.Router();
connectionRouter.post('/send/:id', isAuth, sendConnection);
connectionRouter.put('/accept/:connectionId', isAuth, acceptConnection)
connectionRouter.put('/reject/:connectionId', isAuth, rejectConnection)
connectionRouter.get('/getstatus/:userId', isAuth, getConnections)
connectionRouter.delete('/remove/:userId', isAuth, removeConnection)
connectionRouter.get('/requests', isAuth, getConnectionRequests)
connectionRouter.get('/', isAuth, getUserConnections)
export default connectionRouter;
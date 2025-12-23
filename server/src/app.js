import express from 'express';
const app = express();

import authRoutes from './routes/auth.routes.js';

app.use(express.json());
app.use('/auth', authRoutes);


import testRoutes from "./routes/test.routes.js";
app.use("/test", testRoutes);

import postRoutes from "./routes/post.routes.js";
app.use("/posts", postRoutes);

import likeRoutes from "./routes/like.routes.js";
app.use("/likes", likeRoutes);

import commentRoutes from "./routes/comment.routes.js";
app.use("/comments", commentRoutes);


import followRoutes from "./routes/follow.routes.js";
app.use("/follow", followRoutes);

import saveRoutes from "./routes/save.routes.js";
app.use("/save", saveRoutes);

import notificationRoutes from "./routes/notification.routes.js";
app.use("/api/notifications", notificationRoutes);

app.get('/', (req, res)=>{
    res.send('Hello World!');
});


export default app;
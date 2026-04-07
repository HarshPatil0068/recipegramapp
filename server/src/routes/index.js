import authRoutes from './auth.routes.js';
import testRoutes from './test.routes.js';
import postRoutes from './post.routes.js';
import likeRoutes from './like.routes.js';
import commentRoutes from './comment.routes.js';
import followRoutes from './follow.routes.js';
import userRoutes from './user.routes.js';
import saveRoutes from './save.routes.js';
import notificationRoutes from './notification.routes.js';
import messageRoutes from './message.routes.js';

/**
 * Register all application routes on the given Express app.
 * @param {import('express').Application} app
 */
export function registerRoutes(app) {
  app.use('/auth', authRoutes);
  app.use('/test', testRoutes);
  app.use('/posts', postRoutes);
  app.use('/likes', likeRoutes);
  app.use('/comments', commentRoutes);
  app.use('/follow', followRoutes);
  app.use('/users', userRoutes);
  app.use('/save', saveRoutes);
  // Note: notifications retains the /api/notifications prefix from the original
  // route registration to preserve backward compatibility with existing clients.
  app.use('/api/notifications', notificationRoutes);
  app.use('/messages', messageRoutes);
}

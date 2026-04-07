import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import jwt from 'jsonwebtoken';
import { connectTestDB, closeTestDB, clearTestDB } from './testSetup.js';

describe('Post API Endpoints', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
    });
    
    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('POST /posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        caption: 'Delicious Pasta Recipe',
        ingredients: ['pasta', 'tomato sauce', 'cheese'],
        steps: ['Boil pasta', 'Add sauce', 'Add cheese'],
        image: 'https://example.com/pasta.jpg',
      };

      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.post).toBeDefined();
      expect(response.body.post.caption).toBe(postData.caption);
      expect(response.body.post.author).toBeDefined();
      expect(response.body.post.author.username).toBe('testuser');
    });

    it('should return 401 if not authenticated', async () => {
      const postData = {
        caption: 'Test Post',
        image: 'https://example.com/test.jpg',
      };

      await request(app)
        .post('/posts')
        .send(postData)
        .expect(401);
    });

    it('should return 400 if caption is missing', async () => {
      const postData = {
        image: 'https://example.com/test.jpg',
      };

      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);
    });

    it('should create a reel post with valid video URL', async () => {
      const postData = {
        postType: 'reel',
        caption: 'Quick pasta trick',
        video: 'https://example.com/reel.mp4',
      };

      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.post).toBeDefined();
      expect(response.body.post.postType).toBe('reel');
      expect(response.body.post.video).toBe(postData.video);
    });
  });

  describe('GET /posts', () => {
    beforeEach(async () => {
      // Create test posts
      await Post.create([
        {
          caption: 'Post 1',
          image: 'https://example.com/1.jpg',
          author: testUser._id,
        },
        {
          caption: 'Post 2',
          image: 'https://example.com/2.jpg',
          author: testUser._id,
        },
      ]);
    });

    it('should return paginated posts', async () => {
      const response = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts).toBeDefined();
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
      expect(response.body.total).toBe(2);
    });

    it('should populate author data', async () => {
      const response = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts[0].author).toBeDefined();
      expect(response.body.posts[0].author.username).toBe('testuser');
    });
  });

  describe('GET /posts/reels', () => {
    beforeEach(async () => {
      await Post.create([
        {
          caption: 'Recipe image post',
          image: 'https://example.com/recipe.jpg',
          author: testUser._id,
        },
        {
          postType: 'reel',
          caption: 'Short reel 1',
          video: 'https://example.com/reel1.mp4',
          author: testUser._id,
        },
        {
          postType: 'reel',
          caption: 'Short reel 2',
          video: 'https://example.com/reel2.mp4',
          author: testUser._id,
        },
      ]);
    });

    it('should return only reel posts', async () => {
      const response = await request(app)
        .get('/posts/reels')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBe(2);
      response.body.posts.forEach((post) => {
        expect(post.postType).toBe('reel');
        expect(post.video).toBeDefined();
      });
    });
  });

  describe('GET /posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        caption: 'Test Post',
        image: 'https://example.com/test.jpg',
        author: testUser._id,
        ingredients: ['ingredient1', 'ingredient2'],
        steps: ['step1', 'step2'],
      });
    });

    it('should return a single post by ID', async () => {
      const response = await request(app)
        .get(`/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(testPost._id.toString());
      expect(response.body.caption).toBe('Test Post');
      expect(response.body.author).toBeDefined();
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/posts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        caption: 'Original Caption',
        image: 'https://example.com/test.jpg',
        author: testUser._id,
      });
    });

    it('should update post if user is author', async () => {
      const updateData = {
        caption: 'Updated Caption',
        ingredients: ['new ingredient'],
        steps: ['new step'],
      };

      const response = await request(app)
        .put(`/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.post.caption).toBe('Updated Caption');
    });

    it('should return 403 if user is not author', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      );

      await request(app)
        .put(`/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ caption: 'Hacked!' })
        .expect(403);
    });
  });

  describe('DELETE /posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        caption: 'To be deleted',
        image: 'https://example.com/test.jpg',
        author: testUser._id,
      });
    });

    it('should delete post if user is author', async () => {
      await request(app)
        .delete(`/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 403 if user is not author', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      );

      await request(app)
        .delete(`/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });
});

import './config/env.js';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.model.js';
import Post from './models/Post.model.js';
import Comment from './models/Comment.model.js';
import Like from './models/Like.model.js';
import Follow from './models/Follow.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipegram';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany(),
    Post.deleteMany(),
    Comment.deleteMany(),
    Like.deleteMany(),
    Follow.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const [chef_marco, foodie_priya, baker_sophie, spice_raj, healthy_lea] =
    await User.insertMany([
      {
        username: 'chef_marco',
        email: 'marco@recipegram.com',
        password: hashedPassword,
        bio: '👨‍🍳 Professional chef | Italian cuisine lover | Sharing family recipes since 2010',
        profileImage: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=150&h=150&fit=crop&crop=face',
        followersCount: 3,
        followingCount: 2,
      },
      {
        username: 'foodie_priya',
        email: 'priya@recipegram.com',
        password: hashedPassword,
        bio: '🌶️ Spice enthusiast | Indian street food | Home cooking adventures',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        followersCount: 2,
        followingCount: 3,
      },
      {
        username: 'baker_sophie',
        email: 'sophie@recipegram.com',
        password: hashedPassword,
        bio: '🎂 Pastry artist | French baking | Sweet tooth and proud of it',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        followersCount: 2,
        followingCount: 2,
      },
      {
        username: 'spice_raj',
        email: 'raj@recipegram.com',
        password: hashedPassword,
        bio: '🍛 Curry master | Mumbai born | Cooking is my meditation',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        followersCount: 1,
        followingCount: 2,
      },
      {
        username: 'healthy_lea',
        email: 'lea@recipegram.com',
        password: hashedPassword,
        bio: '🥗 Nutritionist | Plant-based recipes | Eating well, living better',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        followersCount: 1,
        followingCount: 1,
      },
    ]);
  console.log('👤 Created 5 users');

  await Follow.insertMany([
    { follower: foodie_priya._id, following: chef_marco._id },
    { follower: baker_sophie._id, following: chef_marco._id },
    { follower: spice_raj._id,    following: chef_marco._id },
    { follower: chef_marco._id,   following: foodie_priya._id },
    { follower: baker_sophie._id, following: foodie_priya._id },
    { follower: chef_marco._id,   following: baker_sophie._id },
    { follower: healthy_lea._id,  following: baker_sophie._id },
    { follower: foodie_priya._id, following: spice_raj._id },
    { follower: spice_raj._id,    following: healthy_lea._id },
    { follower: foodie_priya._id, following: healthy_lea._id },
  ]);
  console.log('👥 Created follow relationships');

  const posts = await Post.insertMany([
    {
      caption: '🍝 Classic Spaghetti Carbonara — the real Roman way! No cream, just eggs, pecorino, guanciale and love ❤️',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop',
      author: chef_marco._id,
      ingredients: ['400g spaghetti', '200g guanciale', '4 egg yolks', '100g pecorino romano', 'Black pepper', 'Salt'],
      steps: [
        'Bring salted water to boil and cook spaghetti al dente.',
        'Fry guanciale in a pan until crispy. Remove from heat.',
        'Whisk egg yolks with grated pecorino and black pepper.',
        'Toss hot pasta with guanciale, then off-heat stir in egg mixture.',
        'Add pasta water to emulsify into a creamy sauce. Serve immediately.',
      ],
      likesCount: 3,
      commentsCount: 2,
    },
    {
      caption: '🥘 Mums Chicken Tikka Masala — slow-cooked for 4 hours, every spice hand-ground',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop',
      author: foodie_priya._id,
      ingredients: ['800g chicken thighs', '2 cups yogurt', '1 can tomatoes', 'Garam masala', 'Ginger-garlic paste', 'Heavy cream', 'Fenugreek leaves'],
      steps: [
        'Marinate chicken in yogurt, spices and ginger-garlic paste overnight.',
        'Grill or broil chicken until charred at edges.',
        'Saute onions, tomatoes, and spices into a rich masala.',
        'Add chicken and simmer for 20 mins. Finish with cream and kasuri methi.',
        'Serve with warm naan or basmati rice.',
      ],
      likesCount: 4,
      commentsCount: 2,
    },
    {
      caption: '🥐 Homemade Croissants — 3 days of laminating dough but SO worth it! Flaky layers all the way',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop',
      author: baker_sophie._id,
      ingredients: ['500g bread flour', '300ml whole milk', '7g instant yeast', '250g cold butter', '10g salt', '60g sugar'],
      steps: [
        'Make dough, rest 1 hour, refrigerate overnight.',
        'Beat butter into a flat sheet, encase in dough.',
        'Perform 3 sets of letter folds with 30-min rests.',
        'Roll, cut into triangles, shape croissants.',
        'Proof 2-3 hours until jiggly. Egg wash and bake at 200C for 18-20 mins.',
      ],
      likesCount: 5,
      commentsCount: 3,
    },
    {
      caption: '🍲 Lamb Rogan Josh — slow cooked until the meat falls off the bone. Kashmiri recipe passed down 3 generations!',
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop',
      author: spice_raj._id,
      ingredients: ['1kg lamb shoulder', 'Kashmiri chillies', 'Yogurt', 'Whole spices', 'Mustard oil', 'Asafoetida'],
      steps: [
        'Heat mustard oil until smoking, add asafoetida and whole spices.',
        'Add lamb pieces and brown well on all sides.',
        'Add soaked Kashmiri chillies and yogurt, stir well.',
        'Pressure cook for 25 mins or slow cook 3 hours.',
        'Finish with garam masala and serve with rice or roti.',
      ],
      likesCount: 2,
      commentsCount: 1,
    },
    {
      caption: '🥗 Rainbow Buddha Bowl — 20 minutes, fully plant-based, macro-balanced and absolutely delicious!',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
      author: healthy_lea._id,
      ingredients: ['1 cup quinoa', 'Roasted chickpeas', 'Avocado', 'Cherry tomatoes', 'Cucumber', 'Tahini dressing', 'Mixed greens'],
      steps: [
        'Cook quinoa according to package instructions.',
        'Roast chickpeas with cumin and paprika at 200C for 20 mins.',
        'Slice avocado, cucumber and halve cherry tomatoes.',
        'Assemble bowl with quinoa base, arrange veggies on top.',
        'Drizzle with tahini-lemon dressing and serve.',
      ],
      likesCount: 2,
      commentsCount: 1,
    },
    {
      caption: '🍕 Wood-fired Neapolitan Margherita — 90 seconds at 450C. San Marzano tomatoes, fresh mozzarella, basil',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',
      author: chef_marco._id,
      ingredients: ['300g 00 flour', '200ml warm water', '5g sea salt', '2g instant yeast', 'San Marzano tomatoes', 'Fresh mozzarella', 'Fresh basil', 'Olive oil'],
      steps: [
        'Mix flour, water, salt and yeast. Knead 10 mins, rest 8 hours.',
        'Stretch dough by hand — no rolling pin!',
        'Top with crushed San Marzano tomatoes and torn mozzarella.',
        'Bake at max oven temp (250C+) for 8-10 mins or use a pizza stone.',
        'Add fresh basil and drizzle of olive oil after baking.',
      ],
      likesCount: 3,
      commentsCount: 1,
    },
  ]);
  console.log('📸 Created 6 recipe posts');

  await Like.insertMany([
    { user: foodie_priya._id, post: posts[0]._id },
    { user: baker_sophie._id, post: posts[0]._id },
    { user: healthy_lea._id,  post: posts[0]._id },
    { user: chef_marco._id,   post: posts[1]._id },
    { user: spice_raj._id,    post: posts[1]._id },
    { user: baker_sophie._id, post: posts[1]._id },
    { user: healthy_lea._id,  post: posts[1]._id },
    { user: chef_marco._id,   post: posts[2]._id },
    { user: foodie_priya._id, post: posts[2]._id },
    { user: spice_raj._id,    post: posts[2]._id },
    { user: healthy_lea._id,  post: posts[2]._id },
    { user: baker_sophie._id, post: posts[2]._id },
    { user: chef_marco._id,   post: posts[3]._id },
    { user: foodie_priya._id, post: posts[3]._id },
    { user: baker_sophie._id, post: posts[4]._id },
    { user: spice_raj._id,    post: posts[4]._id },
    { user: foodie_priya._id, post: posts[5]._id },
    { user: baker_sophie._id, post: posts[5]._id },
    { user: spice_raj._id,    post: posts[5]._id },
  ]);
  console.log('❤️  Created likes');

  await Comment.insertMany([
    { post: posts[0]._id, user: foodie_priya._id, text: 'This is EXACTLY how my nonna made it! No cream ever' },
    { post: posts[0]._id, user: baker_sophie._id,  text: 'Made this last night — turned out perfect. The pasta water trick is magic!' },
    { post: posts[1]._id, user: chef_marco._id,   text: 'The char on that chicken is incredible. Bookmarked immediately' },
    { post: posts[1]._id, user: spice_raj._id,    text: 'Authentic! Most western versions use way too much cream' },
    { post: posts[2]._id, user: chef_marco._id,   text: 'The lamination on these is bakery-level. Respect' },
    { post: posts[2]._id, user: foodie_priya._id,  text: 'I tried this last weekend and they came out beautifully! Patience really pays off' },
    { post: posts[2]._id, user: spice_raj._id,    text: 'The layers are unreal! Adding this to my weekend project list' },
    { post: posts[3]._id, user: foodie_priya._id,  text: 'Kashmiri chillies make all the difference. Beautiful colour too' },
    { post: posts[4]._id, user: baker_sophie._id,  text: 'Finally a healthy recipe that actually looks delicious' },
    { post: posts[5]._id, user: foodie_priya._id,  text: 'Simple ingredients, perfect execution. The gold standard of pizza' },
  ]);
  console.log('💬 Created comments');

  console.log('\n🎉 Seed complete! Demo accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 marco@recipegram.com     | 🔑 password123');
  console.log('📧 priya@recipegram.com     | 🔑 password123');
  console.log('📧 sophie@recipegram.com    | 🔑 password123');
  console.log('📧 raj@recipegram.com       | 🔑 password123');
  console.log('📧 lea@recipegram.com       | 🔑 password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

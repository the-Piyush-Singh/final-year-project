import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import UserModel from './models/User.js';
import PostModel from './models/Blog.js';
import CommentModel from './models/Comment.js';

dotenv.config();

const usersData = [
  {
    FullName: 'Alex Mercer',
    email: 'alex@posthive.com',
    password: bcryptjs.hashSync('password123', 10),
    role: 'user',
    profile: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Software Engineer & UI enthusiast. Writing about modern web architecture and design patterns.',
    followers: [], following: [], savedPosts: []
  },
  {
    FullName: 'Sarah Chen',
    email: 'sarah@posthive.com',
    password: bcryptjs.hashSync('password123', 10),
    role: 'user',
    profile: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Product Designer at TechCorp. Obsessed with typography, accessibility, and clean code.',
    followers: [], following: [], savedPosts: []
  },
  {
    FullName: 'David Okoye',
    email: 'david@posthive.com',
    password: bcryptjs.hashSync('password123', 10),
    role: 'admin',
    profile: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Founder of PostHive. DevOps engineer, coffee addict, and mechanical keyboard collector.',
    followers: [], following: [], savedPosts: []
  }
];

const postsData = [
  {
    title: 'The Future of Web Development: Moving Beyond the DOM',
    desc: 'Explore upcoming architectures that challenge traditional DOM manipulation and push browser limits.',
    content: `<p>Web development is evolving at a breakneck pace. For years, we've relied heavily on the DOM as our primary interface for rendering UI. But newer frameworks and paradigms are challenging this assumption.</p><p>By leveraging technologies like <strong>WebAssembly</strong> and Canvas-based rendering (similar to Flutter Web), developers are pushing pixels directly to the screen with zero DOM overhead.</p><blockquote>"The DOM is slow. Your imagination shouldn't be."</blockquote><p>Will these technologies replace React? Probably not anytime soon. But they open doors for high-performance applications in the browser that were previously unthinkable.</p>`,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    tags: ['webdev', 'architecture', 'future'],
    views: 1240, status: 'published'
  },
  {
    title: 'Mastering CSS Grid: A Comprehensive Guide',
    desc: 'Stop fighting with flexbox for 2D layouts. CSS Grid is here, and it is glorious. Heres how to use it.',
    content: `<p>Ever tried to build a complex dashboard layout with <code>display: flex</code> and ended up with a nested nightmare of divs? We've all been there.</p><ul><li>Grid solves 2D layout problems gracefully.</li><li>It inherently understands columns and rows.</li><li>It works beautifully with responsive media queries.</li></ul><p>Let's look at a basic example:</p><pre><code>.container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }</code></pre><p>With just those three lines, you have a flawless, responsive 3-column layout. CSS Grid is not just a feature; it's a paradigm shift in web design.</p>`,
    image: 'https://images.unsplash.com/photo-1507238692062-5a042e9e0e85?auto=format&fit=crop&q=80&w=800',
    tags: ['css', 'design', 'tutorial'],
    views: 890, status: 'published'
  },
  {
    title: 'Why I Switched from VS Code to Neovim',
    desc: 'The journey of abandoning modern IDE comforts for terminal-based efficiency and speed.',
    content: `<p>It took me three months to stop hating Neovim, but now I can never go back. VS Code is phenomenal and feature-rich, but it abstracts away too much control.</p><h3>The Learning Curve</h3><p>Yes, exiting Neovim is a meme. But once you memorize the keybindings, your hands never have to leave the home row. You jump between files instantaneously, edit text at the speed of thought, and run macros that save hours of repetitive typing.</p><p>My configuration uses Lua, and it's incredibly fast. Boot time is under 50ms.</p>`,
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800',
    tags: ['productivity', 'tools', 'coding'],
    views: 3200, status: 'published'
  },
  {
    title: 'Building Scalable APIs with Node.js and MongoDB',
    desc: 'Best practices for structuring your backend to handle millions of requests without breaking a sweat.',
    content: `<p>Scalability isn't just about throwing more servers at a problem. It starts with your application architecture.</p><h3>1. Database Indexing</h3><p>If you're querying a <code>MongoDB</code> collection with millions of documents without an index, your backend will grind to a halt. Always index the fields you filter by.</p><h3>2. Caching Strategy</h3><p>Implement Redis to cache frequent queries. If a blog post hasn't changed, don't query the database—serve it from RAM.</p><p>Don't prematurely optimize, but build with an architecture that allows optimization later.</p>`,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    tags: ['backend', 'nodejs', 'mongodb'],
    views: 450, status: 'published'
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGDB_ULR);
    console.log('Connected.');

    // Clear existing data? Let's NOT clear it so we don't destroy user's hard work.
    // We will just append these mock entities.

    // 1. Create Users
    console.log('Creating Users...');
    const createdUsers = await UserModel.insertMany(usersData);
    
    // Create follows between them
    createdUsers[0].following.push(createdUsers[1]._id);
    createdUsers[1].followers.push(createdUsers[0]._id);
    
    createdUsers[1].following.push(createdUsers[2]._id);
    createdUsers[2].followers.push(createdUsers[1]._id);

    await createdUsers[0].save();
    await createdUsers[1].save();
    await createdUsers[2].save();

    // 2. Create Posts
    console.log('Creating Posts...');
    // Assign authors
    postsData[0].author = createdUsers[0]._id; // Alex
    postsData[1].author = createdUsers[1]._id; // Sarah
    postsData[2].author = createdUsers[2]._id; // David
    postsData[3].author = createdUsers[0]._id; // Alex

    // Add some realistic likes
    postsData[0].likes = [createdUsers[1]._id, createdUsers[2]._id];
    postsData[1].likes = [createdUsers[0]._id];
    postsData[2].likes = [createdUsers[0]._id, createdUsers[1]._id];

    const createdPosts = await PostModel.insertMany(postsData);

    // 3. Create Comments & Bookmarks
    console.log('Adding Interactions (Comments & Bookmarks)...');
    const comments = [
      { postId: createdPosts[0]._id, userId: createdUsers[1]._id, comment: "Absolutely fascinating perspective. I've been looking into Canvas rendering myself recently!" },
      { postId: createdPosts[0]._id, userId: createdUsers[2]._id, comment: "Great write-up Alex. The DOM definitely has its limits." },
      { postId: createdPosts[1]._id, userId: createdUsers[0]._id, comment: "I used to hate CSS Grid until I read this. Thank you Sarah!" },
      { postId: createdPosts[2]._id, userId: createdUsers[1]._id, comment: "I tried Neovim but the learning curve defeated me. Maybe I should give it another shot." }
    ];

    const createdComments = await CommentModel.insertMany(comments);

    // Update posts with comment refs
    createdPosts[0].comments.push(createdComments[0]._id, createdComments[1]._id);
    createdPosts[1].comments.push(createdComments[2]._id);
    createdPosts[2].comments.push(createdComments[3]._id);

    await createdPosts[0].save();
    await createdPosts[1].save();
    await createdPosts[2].save();

    // Add Bookmarks
    createdUsers[0].savedPosts.push(createdPosts[1]._id, createdPosts[2]._id);
    await createdUsers[0].save();

    console.log('✅ Seed completed successfully! Generated highly interactive dummy data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();

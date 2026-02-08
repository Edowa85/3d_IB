# 3Dcard - Server Reference Documentation

**File:** `full-app/server.js`
**Version:** 1.0.0
**Author:** Petri
**Date:** February 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Dependencies](#2-dependencies)
3. [Configuration](#3-configuration)
4. [Database Connection](#4-database-connection)
5. [Middleware](#5-middleware)
6. [Authentication System](#6-authentication-system)
7. [Routes Reference](#7-routes-reference)
8. [Security](#8-security)
9. [Error Handling](#9-error-handling)
10. [Architecture Diagram](#10-architecture-diagram)

---

## 1. Overview

The `server.js` file is the main entry point for the 3Dcard full application. It is built using **Express.js** with **MongoDB** for data persistence and **EJS** for server-side templating.

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Server Framework** | Express.js | Web server and routing |
| **Database** | MongoDB | NoSQL data storage |
| **ODM** | Mongoose | MongoDB object modeling |
| **Templating** | EJS | Server-side HTML rendering |
| **Sessions** | express-session | User session management |
| **Authentication** | bcryptjs | Password hashing (in User model) |

### File Structure

```mermaid
graph TD
    A[server.js<br/>Main Entry Point] --> B[Middleware Setup]
    A --> C[Database Connection]
    A --> D[Route Definitions]
    A --> E[Server Start]

    B --> B1[express.urlencoded]
    B --> B2[express.json]
    B --> B3[methodOverride]
    B --> B4[express.static]
    B --> B5[session]

    C --> C1[Mongoose Connect]

    D --> D1[Auth Routes<br/>signup, login, logout]
    D --> D2[Home Route]
    D --> D3[Question CRUD]
    D --> D4[API Endpoints]
    D --> D5[Documentation]

    style A fill:#e1f5ff
    style C1 fill:#c8e6c9
    style D fill:#fff9c4
```

---

## 2. Dependencies

### Required Packages

```javascript
// Environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');           // Web framework
const mongoose = require('mongoose');         // MongoDB ODM
const session = require('express-session');   // Session middleware
const methodOverride = require('method-override'); // PUT/DELETE support
const path = require('path');                 // Path utilities

// Application models
const User = require('./models/User');
const Question = require('./models/Question');
```

### Package Installation

```bash
npm install express mongoose express-session method-override
npm install dotenv ejs bcryptjs
```

---

## 3. Configuration

### Application Configuration

```javascript
const app = express();
const PORT = process.env.PORT || 3000;
```

### Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/3dcard
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/3dcard

# Session Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your-random-32-character-secret-key
```

### View Engine Configuration

```javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

---

## 4. Database Connection

### MongoDB Connection Setup

```javascript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/3dcard')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
```

### Connection States

```mermaid
stateDiagram-v2
    [*] --> Connecting
    Connecting --> Connected: Connection successful
    Connecting --> Failed: Connection error
    Connected [*]
    Failed [*]

    note right of Connecting
        mongoose.connect()
        attempts connection
    end note

    note right of Connected
        ✅ MongoDB connected
        Ready for queries
    end note

    note right of Failed
        ❌ Connection error
        Check MONGODB_URI
    end note
```

### Database Collections

| Collection | Schema | Description |
|-----------|--------|-------------|
| **users** | User.js | User accounts with hashed passwords |
| **questions** | Question.js | Icebreaker questions per user |

---

## 5. Middleware

### Middleware Stack

```mermaid
graph TD
    Request[HTTP Request] --> M1[express.urlencoded]
    M1 --> M2[express.json]
    M2 --> M3[methodOverride]
    M3 --> M4[express.static]
    M4 --> M5[session]
    M5 --> M6[res.locals.user]
    M6 --> Routes[Route Handlers]
    Routes --> Response[HTTP Response]

    style Request fill:#e1f5ff
    style Response fill:#c8e6c9
    style M5 fill:#ffccbc
```

### Middleware Configuration

| Middleware | Purpose | Configuration |
|------------|---------|---------------|
| **express.urlencoded** | Parse form data | `{ extended: true }` |
| **express.json** | Parse JSON bodies | Default |
| **methodOverride** | Enable PUT/DELETE | `_method` query parameter |
| **express.static** | Serve static files | `public/` directory |
| **express-session** | Session management | 24-hour expiration |

### Static File Serving

```javascript
// Public assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Compliance documentation
app.use('/compliance', express.static(path.join(__dirname, '../compliance')));
```

### Session Middleware

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  resave: false,                    // Don't save unmodified sessions
  saveUninitialized: false,         // Don't create sessions until something stored
  cookie: {
    maxAge: 24 * 60 * 60 * 1000     // 24 hours
  }
}));
```

### View User Middleware

```javascript
// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});
```

This middleware automatically injects the `user` variable into all EJS templates:

```ejs
<% if (user) { %>
  <p>Welcome, <%= user.username %>!</p>
<% } else { %>
  <a href="/login">Log in</a>
<% } %>
```

---

## 6. Authentication System

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Express
    participant MongoDB
    participant Session

    Note over User,Session: Sign Up Flow
    User->>Browser: POST /signup {username, password}
    Browser->>Express: Form submission
    Express->>MongoDB: Check if username exists
    MongoDB-->>Express: User not found
    Express->>MongoDB: User.create({username, password})
    MongoDB-->>Express: User created (with hashed password)
    Express->>Session: Create session with user._id
    Express-->>Browser: Redirect to /
    Browser->>User: Show home page

    Note over User,Session: Login Flow
    User->>Browser: POST /login {username, password}
    Browser->>Express: Form submission
    Express->>MongoDB: User.findOne({username})
    MongoDB-->>Express: User document
    Express->>Express: user.comparePassword(password)
    alt Password matches
        Express->>Session: Create session
        Express-->>Browser: Redirect to /
    else Password invalid
        Express-->>Browser: Render error
    end
```

### Auth Middleware

```javascript
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}
```

### Protected Routes

All routes that require authentication use the `requireLogin` middleware:

```javascript
app.get('/questions', requireLogin, async (req, res) => {
  // Only accessible if user is logged in
});

app.post('/questions', requireLogin, async (req, res) => {
  // Only accessible if user is logged in
});
```

### Session Structure

```javascript
req.session.user = {
  _id: ObjectId("..."),      // User's MongoDB ID
  username: "petri"          // Username
};
```

---

## 7. Routes Reference

### Route Summary

```mermaid
graph TD
    subgraph "Public Routes"
        R1[GET /<br/>Home Page]
        R2[GET /signup<br/>Signup Form]
        R3[POST /signup<br/>Create Account]
        R4[GET /login<br/>Login Form]
        R5[POST /login<br/>Authenticate]
        R6[GET /documentation<br/>Docs Page]
    end

    subgraph "Protected Routes"
        R7[GET /logout<br/>End Session]
        R8[GET /questions<br/>Questions Page]
        R9[POST /questions<br/>Create Question]
        R10[PUT /questions/:id<br/>Update Question]
        R11[DELETE /questions/:id<br/>Delete Question]
        R12[GET /api/questions/random<br/>Random Question API]
    end

    style R1 fill:#c8e6c9
    style R8 fill:#ffccbc
    style R12 fill:#fff9c4
```

### Route Details

#### 7.1 Home Route

**Endpoint:** `GET /`
**Access:** Public (renders differently for authenticated users)
**Purpose:** Main page with 3D card

```javascript
app.get('/', async (req, res) => {
  try {
    let questions = [];

    if (req.session.user) {
      // Get user's questions
      questions = await Question.find({ createdBy: req.session.user._id });

      // Add default questions if user has none
      if (questions.length === 0) {
        for (const text of defaultQuestions) {
          await Question.create({
            text: text,
            createdBy: req.session.user._id
          });
        }
        questions = await Question.find({ createdBy: req.session.user._id });
      }
    }

    res.render('home', { questions, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.render('home', { questions: [], user: req.session.user });
  }
});
```

**Features:**
- Loads user's questions if authenticated
- Auto-creates 10 default questions for new users
- Renders `home.ejs` view

#### 7.2 Signup Routes

**Endpoint:** `GET /signup`
**Access:** Public
**Purpose:** Render signup form

**Endpoint:** `POST /signup`
**Access:** Public
**Purpose:** Create new user account

```javascript
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('signup', { error: 'Username already exists' });
    }

    // Create user (password hashed by User model pre-save hook)
    const user = await User.create({ username, password });

    // Log user in
    req.session.user = {
      _id: user._id,
      username: user.username
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Error creating account' });
  }
});
```

**Validation:**
- Username uniqueness check
- Password hashing via Mongoose pre-save hook
- Auto-login after successful signup

#### 7.3 Login Routes

**Endpoint:** `GET /login`
**Access:** Public
**Purpose:** Render login form

**Endpoint:** `POST /login`
**Access:** Public
**Purpose:** Authenticate user

```javascript
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Log user in
    req.session.user = {
      _id: user._id,
      username: user.username
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Error logging in' });
  }
});
```

**Security:**
- Generic error message (doesn't reveal if username exists)
- Password comparison using bcrypt
- Session creation on success

#### 7.4 Logout Route

**Endpoint:** `GET /logout`
**Access:** Protected
**Purpose:** End user session

```javascript
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});
```

#### 7.5 Questions CRUD

**GET /questions** - Questions Page
```javascript
app.get('/questions', requireLogin, async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.session.user._id })
      .sort({ createdAt: -1 });
    res.render('questions', { questions });
  } catch (err) {
    console.error(err);
    res.render('questions', { questions: [] });
  }
});
```

**POST /questions** - Create Question
```javascript
app.post('/questions', requireLogin, async (req, res) => {
  try {
    const { text } = req.body;
    await Question.create({
      text,
      createdBy: req.session.user._id
    });
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    res.redirect('/questions');
  }
});
```

**PUT /questions/:id** - Update Question
```javascript
app.put('/questions/:id', requireLogin, async (req, res) => {
  try {
    const { text } = req.body;
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.session.user._id  // Ownership check
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    question.text = text;
    await question.save();
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    res.redirect('/questions');
  }
});
```

**DELETE /questions/:id** - Delete Question
```javascript
app.delete('/questions/:id', requireLogin, async (req, res) => {
  try {
    await Question.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.user._id  // Ownership check
    });
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    res.redirect('/questions');
  }
});
```

#### 7.6 API Endpoints

**GET /api/questions/random** - Random Question API
```javascript
app.get('/api/questions/random', requireLogin, async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.session.user._id });
    if (questions.length === 0) {
      return res.json({ text: 'Add some questions to get started!' });
    }
    const random = questions[Math.floor(Math.random() * questions.length)];
    res.json(random);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching question' });
  }
});
```

**Response Format:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "text": "What's your favorite color?",
  "createdAt": "2026-02-05T12:00:00.000Z"
}
```

#### 7.7 Documentation Route

**GET /documentation** - Documentation Page
```javascript
app.get('/documentation', (req, res) => {
  res.render('documentation');
});
```

---

## 8. Security

### Security Features

```mermaid
graph TD
    subgraph "Security Layers"
        S1[Password Hashing<br/>bcrypt, 10 salt rounds]
        S2[Session Management<br/>24-hour expiration]
        S3[Route Protection<br/>requireLogin middleware]
        S4[User Ownership<br/>createdBy validation]
        S5[Input Validation<br/>Mongoose schemas]
    end

    Request[User Request] --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> Response[Authorized Response]

    style S1 fill:#ffccbc
    style S3 fill:#ffccbc
    style S4 fill:#ffccbc
```

### Password Security

- **Hashing Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Implementation:** Mongoose pre-save hook in User model

```javascript
// In User.js model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### Session Security

| Feature | Configuration |
|---------|---------------|
| **Secret** | `SESSION_SECRET` (32+ characters recommended) |
| **Expiration** | 24 hours (86400000 ms) |
| **HTTP Only** | Yes (default) |
| **Secure** | Set to `true` in production with HTTPS |
| **Same Site** | Lax (default) |

### Route Protection

All protected routes use the `requireLogin` middleware:

```javascript
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}
```

### User Isolation

All question operations include ownership verification:

```javascript
// Ownership check prevents cross-user access
const question = await Question.findOne({
  _id: req.params.id,
  createdBy: req.session.user._id  // Must match
});
```

### Input Validation

Validation is handled at the Mongoose schema level:

**User Schema Validation:**
- `username`: 3-30 characters, unique, alphanumeric
- `password`: Minimum 6 characters

**Question Schema Validation:**
- `text`: 5-500 characters, required
- `createdBy`: Valid ObjectId

---

## 9. Error Handling

### Error Handling Strategy

```mermaid
graph TD
    Request[Request] --> Route[Route Handler]
    Route --> Try{try-catch}
    Try -->|Success| Response[Send Response]
    Try -->|Error| Log[console.error]
    Log --> Handle[Handle Error]
    Handle --> Render[Render Error Page]
    Handle -->|API| JSONError[Send JSON Error]
```

### Error Handling Patterns

#### 1. Try-Catch in Async Routes

```javascript
app.get('/questions', requireLogin, async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.session.user._id });
    res.render('questions', { questions });
  } catch (err) {
    console.error(err);
    res.render('questions', { questions: [] });  // Fallback
  }
});
```

#### 2. Validation Errors

```javascript
app.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('signup', { error: 'Username already exists' });
    }
    // ...
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Error creating account' });
  }
});
```

#### 3. API Error Responses

```javascript
app.get('/api/questions/random', requireLogin, async (req, res) => {
  try {
    // ...
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching question' });
  }
});
```

### Common Error Scenarios

| Error | Cause | User Experience |
|-------|-------|-----------------|
| **MongoDB connection failed** | Database not running | Console error, graceful degradation |
| **Username exists** | Duplicate signup attempt | Error message on signup form |
| **Invalid password** | Wrong credentials | Generic "Invalid username or password" |
| **Question not found** | Invalid ID or ownership mismatch | 404 error or redirect |
| **Validation error** | Input doesn't meet schema requirements | Error message with requirements |

---

## 10. Architecture Diagram

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server as Express Server
    participant Session as Session Middleware
    participant Auth as requireLogin
    participant Controller as Route Handler
    participant DB as MongoDB

    Client->>Server: HTTP Request
    Server->>Session: Check session
    Session-->>Server: req.session.user

    alt Protected Route
        Server->>Auth: requireLogin check
        alt No session
            Auth-->>Client: 302 Redirect to /login
        end
    end

    Server->>Controller: Execute route handler
    Controller->>DB: Mongoose query
    DB-->>Controller: Result
    Controller->>Server: Render or JSON
    Server-->>Client: HTTP Response
```

### Server Startup Sequence

```mermaid
flowchart TD
    Start([node server.js]) --> Load1[Load dotenv]
    Load1 --> Load2[Require dependencies]
    Load2 --> Load3[Import models]

    Load3 --> Config[Configure Express]
    Config --> DBConnect[Connect MongoDB]

    DBConnect --> DBSuccess{Connected?}
    DBSuccess -->|No| DBError[Log error]
    DBError --> Stop([Exit with error])

    DBSuccess -->|Yes| Middleware[Setup middleware]
    Middleware --> Routes[Define routes]
    Routes --> Listen[app.listen PORT]

    Listen --> Running([Server Running])
    Running --> Log[Console: 🚀 Server running]

    style Start fill:#e1f5ff
    style Running fill:#c8e6c9
    style DBError fill:#ffccbc
```

---

## 11. Default Questions

### Default Question Set

New users receive 10 conversation starter questions:

```javascript
const defaultQuestions = [
  "What's something you've always wanted to try but haven't yet?",
  "If you could travel anywhere right now, where would you go?",
  "What's the most spontaneous thing you've ever done?",
  "What's a skill you wish you could instantly master?",
  "What's the best piece of advice you've ever received?",
  "If you could have dinner with anyone, living or dead, who would it be?",
  "What's a movie you can watch over and over again?",
  "What's something that always makes you laugh?",
  "What's on your bucket list that you haven't told many people?",
  "If you could switch lives with anyone for a day, who would it be?"
];
```

### Auto-Creation Logic

Default questions are created on the user's first home page visit:

```javascript
if (questions.length === 0) {
  for (const text of defaultQuestions) {
    await Question.create({
      text: text,
      createdBy: req.session.user._id
    });
  }
}
```

---

## 12. Server Startup

### Starting the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Direct with Node
node server.js
```

### Startup Output

```
🚀 3Dcard server running on http://localhost:3000
✅ MongoDB connected
```

### Port Configuration

The server runs on port 3000 by default, but can be configured via environment variable:

```env
PORT=8080  # Use port 8080 instead
```

---

## 13. Development Notes

### Adding New Routes

1. Define the route with appropriate HTTP method
2. Add `requireLogin` middleware for protected routes
3. Implement async route handler with try-catch
4. Validate user ownership for resource operations
5. Handle errors appropriately

Example:
```javascript
app.post('/new-route', requireLogin, async (req, res) => {
  try {
    // Route logic
    res.redirect('/somewhere');
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Something went wrong' });
  }
});
```

### Adding New Middleware

```javascript
// Custom middleware example
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Or as a reusable function
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

app.get('/route', loggingMiddleware, (req, res) => {
  // ...
});
```

---

## Appendix A: Complete Route Table

| Method | Route | Middleware | Purpose | Response |
|--------|-------|------------|---------|----------|
| GET | `/` | None | Home page | Render `home.ejs` |
| GET | `/signup` | None | Signup form | Render `signup.ejs` |
| POST | `/signup` | None | Create account | Redirect `/` or error |
| GET | `/login` | None | Login form | Render `login.ejs` |
| POST | `/login` | None | Authenticate | Redirect `/` or error |
| GET | `/logout` | None (requires session) | End session | Redirect `/` |
| GET | `/questions` | `requireLogin` | Questions page | Render `questions.ejs` |
| POST | `/questions` | `requireLogin` | Create question | Redirect `/questions` |
| PUT | `/questions/:id` | `requireLogin` | Update question | Redirect `/questions` |
| DELETE | `/questions/:id` | `requireLogin` | Delete question | Redirect `/questions` |
| GET | `/api/questions/random` | `requireLogin` | Random question API | JSON response |
| GET | `/documentation` | None | Documentation | Render `documentation.ejs` |

---

## Appendix B: Session Object Reference

### req.session.user

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "petri"
}
```

### res.locals.user

Automatically available in all EJS templates:

```ejs
<!-- Example usage in EJS -->
<% if (user) { %>
  <p>Welcome, <%= user.username %>!</p>
<% } else { %>
  <p>Please <a href="/login">log in</a></p>
<% } %>
```

---

**End of Server Reference Documentation**

For additional information, see:
- [Technical Documentation](./technical-docs.md)
- [Design Document](./design-document.md)
- [Requirements Specification](./requirements-specification.md)

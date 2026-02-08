# 3Dcard - Technical Documentation

**Project:** 3Dcard - Social Icebreaker Game
**Version:** 1.0.0
**Author:** Petri
**Date:** February 2026

---

## 1. Folder Structure

### 1.1 Project Overview

```
3Dcard/
├── full-app/                      # Full application (with backend)
│   ├── server.js                  # Express server & routes
│   ├── package.json               # Dependencies and scripts
│   ├── .env                       # Environment variables (create from .env.example)
│   ├── .env.example               # Environment template
│   ├── models/                    # MongoDB schemas
│   │   ├── User.js                # User schema with password hashing
│   │   └── Question.js            # Question schema
│   ├── views/                     # EJS templates
│   │   ├── home.ejs               # Home page with 3D card
│   │   ├── login.ejs              # Login form
│   │   ├── signup.ejs             # Signup form
│   │   ├── questions.ejs          # Question CRUD page
│   │   └── documentation.ejs      # Documentation page
│   └── public/                    # Static assets
│       ├── css/
│       │   └── style.css          # Shared styles
│       └── js/
│           └── card.js            # Three.js card (with API calls)
│
├── compliance/                    # Legal & accessibility documentation
│   ├── accessibility-statement.md
│   ├── cookies-policy.md
│   ├── data-protection-security.md
│   ├── digital-services-act.md
│   ├── gdpr-compliance.md
│   └── privacy-policy.md
│
├── docs/                          # Project documentation
│   ├── README.md                  # Full documentation with diagrams
│   ├── project-plan.md
│   ├── requirements-specification.md
│   ├── design-document.md
│   ├── test-plan.md
│   └── technical-docs.md          # This file
│
└── README.md                      # Main project README
```

---

## 2. Backend Routes

```mermaid
sequenceDiagram
    participant Client
    participant Express as Express Server
    participant Auth as Auth Middleware
    participant Controller as Route Controller
    participant MongoDB as Database

    Note over Client,MongoDB: Authentication Flow (Signup)
    Client->>Express: POST /signup {username, password}
    Express->>Controller: Route handler
    Controller->>Controller: Validate input
    Controller->>MongoDB: Check if username exists
    MongoDB-->>Controller: User exists status
    alt Username exists
        Controller-->>Client: Error - Username taken
    else Username available
        Controller->>Controller: Hash password (bcrypt)
        Controller->>MongoDB: Create User
        MongoDB-->>Controller: User created
        Controller->>Express: Create session
        Express-->>Client: Redirect to Home
    end

    Note over Client,MongoDB: Question CRUD Flow
    Client->>Express: GET /questions
    Express->>Auth: requireLogin middleware
    alt Not authenticated
        Auth-->>Client: Redirect to /login
    else Authenticated
        Auth->>Controller: Pass to route handler
        Controller->>MongoDB: Find {createdBy: userId}
        MongoDB-->>Controller: Questions array
        Controller-->>Client: Render questions.ejs
    end
```

### 2.1 Route Overview

| Method | Route | Controller | Description | Auth Required |
|--------|-------|-----------|-------------|---------------|
| GET | `/` | renderHome | Home page | No |
| GET/POST | `/signup` | signupUser | User registration | No |
| GET/POST | `/login` | loginUser | User login | No |
| GET | `/logout` | logoutUser | User logout | Yes |
| GET | `/questions` | listQuestions | Questions page | Yes |
| POST | `/questions` | createQuestion | Create question | Yes |
| PUT | `/questions/:id` | updateQuestion | Update question | Yes |
| DELETE | `/questions/:id` | deleteQuestion | Delete question | Yes |
| GET | `/api/questions/random` | getRandomQuestion | API endpoint | Yes |
| GET | `/documentation` | renderDocs | Documentation | No |

### 2.2 Route Implementation Details

#### 2.2.1 Authentication Routes

```javascript
// === SIGNUP ===
// GET /signup - Render signup form
// POST /signup - Create new user account
//
// Process:
// 1. Extract username and password from request body
// 2. Validate: username 3-30 chars, password min 6 chars
// 3. Check if username already exists
// 4. Hash password using bcrypt (10 salt rounds)
// 5. Create user in MongoDB
// 6. Create session with user._id and username
// 7. Redirect to home page
//
// Error Handling:
// - Duplicate username: Render error message
// - Validation error: Render error message
// - Database error: Render generic error

// === LOGIN ===
// GET /login - Render login form
// POST /login - Authenticate user
//
// Process:
// 1. Extract username and password from request body
// 2. Find user by username in MongoDB
// 3. Compare password using bcrypt.compare()
// 4. If match: create session, redirect to home
// 5. If no match: render error message
//
// Error Handling:
// - User not found: "Invalid username or password"
// - Wrong password: "Invalid username or password"

// === LOGOUT ===
// GET /logout - Destroy session and redirect
//
// Process:
// 1. Call req.session.destroy()
// 2. Redirect to home page
```

#### 2.2.2 Question Routes

```javascript
// === QUESTIONS PAGE ===
// GET /questions - Render questions management page
//
// Middleware: requireLogin (must be authenticated)
// Process:
// 1. Get user ID from session
// 2. Query MongoDB for questions with createdBy = user._id
// 3. Sort by createdAt descending
// 4. Render questions.ejs with questions array

// === CREATE QUESTION ===
// POST /questions - Add new question to database
//
// Middleware: requireLogin
// Request Body: { text: "Question text?" }
// Process:
// 1. Extract text from request body
// 2. Validate: 5-500 characters
// 3. Create question document with createdBy = session.user._id
// 4. Save to MongoDB
// 5. Redirect to /questions

// === UPDATE QUESTION ===
// PUT /questions/:id - Update existing question
//
// Middleware: requireLogin
// Request Body: { text: "Updated question?" }
// Process:
// 1. Extract question ID from URL parameter
// 2. Find question where _id = id AND createdBy = session.user._id
// 3. If not found: return 404 (ownership check)
// 4. Update question.text
// 5. Save to MongoDB
// 6. Redirect to /questions

// === DELETE QUESTION ===
// DELETE /questions/:id - Remove question from database
//
// Middleware: requireLogin
// Process:
// 1. Extract question ID from URL parameter
// 2. DeleteOne where _id = id AND createdBy = session.user._id
// 3. If not found: return 404 (ownership check)
// 4. Redirect to /questions

// === RANDOM QUESTION API ===
// GET /api/questions/random - Get random question for 3D card
//
// Middleware: requireLogin
// Response: JSON { _id, text }
// Process:
// 1. Get user ID from session
// 2. Aggregate: $match by createdBy, $sample size 1
// 3. Return question as JSON
```

---

## 3. Database Schema

### 3.1 User Schema

**File:** `full-app/models/User.js`

```javascript
{
  _id: ObjectId,           // Primary key, auto-generated
  username: String,        // 3-30 characters, unique, indexed
  password: String,        // Min 6 characters, hashed (bcrypt)
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-updated on save
}

// Mongoose Schema Definition
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true });

// Indexes
userSchema.index({ username: 1 });  // Unique, for fast login lookup

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### 3.2 Question Schema

**File:** `full-app/models/Question.js`

```javascript
{
  _id: ObjectId,           // Primary key, auto-generated
  text: String,            // 5-500 characters, required
  createdBy: ObjectId,     // Foreign key to User, indexed
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-updated on save
}

// Mongoose Schema Definition
const questionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Indexes
questionSchema.index({ createdBy: 1 });  // For user's questions lookup
questionSchema.index({ createdBy: 1, createdAt: -1 });  // For sorted lists
```

### 3.3 Relationships

```mermaid
erDiagram
    USER ||--o{ QUESTION : creates
    USER {
        ObjectId _id PK
        string username UK
        string password
        date createdAt
        date updatedAt
    }
    QUESTION {
        ObjectId _id PK
        string text
        ObjectId createdBy FK
        date createdAt
        date updatedAt
    }
```

---

## 4. Frontend Logic

```mermaid
graph TB
    subgraph "Application Architecture"
        Browser[User Browser]
        Express[Express Server]
        Routes[API Routes]
        Models[MongoDB Models]
        MongoDBDB[(MongoDB Database)]
        Views[EJS Views]
    end

    Browser --> Express
    Express --> Routes
    Routes --> Models
    Models --> MongoDBDB
    Express --> Views
    Views --> Browser

    style MongoDBDB fill:#fff9c4
    style Express fill:#ffccbc
```

### 4.1 Application (with Backend)

#### 4.1.1 card.js - Three.js 3D Card

```javascript
/**
 * Three.js 3D Card Implementation
 * Features: Mouse tilt, flip animation, question texture
 */

// Card dimensions (2.5:3.5 ratio - poker card)
const CARD_WIDTH = 2.5;
const CARD_HEIGHT = 3.5;

// Scene setup
function init() {
  // Create scene with transparent background
  scene = new THREE.Scene();

  // Perspective camera: 45° FOV, positioned at z=8
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.z = 8;

  // WebGL renderer with alpha channel
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);

  // Three-point lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
}

// Card creation
function createCard() {
  // Card group to hold all elements
  cardGroup = new THREE.Group();

  // Front face (questions)
  cardFront = new THREE.Mesh(planeGeometry, frontMaterial);
  cardFront.position.z = 0.011;  // Slightly forward
  cardFront.rotation.y = 0;

  // Back face (western art)
  cardBack = new THREE.Mesh(planeGeometry, backMaterial);
  cardBack.position.z = -0.011;  // Slightly behind
  cardBack.rotation.y = Math.PI;  // Face backward

  // Edge piece for 3D thickness
  edgePiece = new THREE.Mesh(boxGeometry, materials);
}

// Mouse tilt effect
function animate() {
  requestAnimationFrame(animate);

  // Calculate target rotation based on mouse position
  // Mouse normalized to -1 to 1
  targetRotationY = mouseX * 0.26;  // Max ±15 degrees
  targetRotationX = -mouseY * 0.26;

  // Smooth interpolation (easing)
  cardGroup.rotation.x += (targetRotationX - cardGroup.rotation.x) * 0.05;
  cardGroup.rotation.y += (targetRotationY - cardGroup.rotation.y) * 0.05;

  renderer.render(scene, camera);
}

// Flip animation
function flipCard() {
  const startRotation = cardGroup.rotation.y;
  const targetRotation = isFlipped ? 0 : Math.PI;
  const duration = 600;  // 600ms

  // Cubic ease-out animation
  function animateFlip() {
    const progress = (Date.now() - startTime) / duration;
    const eased = 1 - Math.pow(1 - progress, 3);  // Ease-out cubic

    cardGroup.rotation.y = startRotation + (targetRotation - startRotation) * eased;

    if (progress < 1) {
      requestAnimationFrame(animateFlip);
    } else {
      isFlipped = !isFlipped;
      if (!isFlipped) updateQuestionText();  // Load new question
    }
  }
}

// Question texture from canvas
function createQuestionTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1436;  // 2.5:3.5 ratio

  const ctx = canvas.getContext('2d');

  // Draw parchment background
  ctx.fillStyle = '#f4e4bc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw decorative border
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 20;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Draw corner decorations
  drawCorner(ctx, x, y, rotation);

  // Draw text with word wrapping
  const words = text.split(' ');
  let line = '';
  let lines = [];

  for (let word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Render each line
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), centerX, startY + (i * lineHeight));
  });

  return new THREE.CanvasTexture(canvas);
}
```

#### 4.1.2 card.js - API Integration

```javascript
/**
 * Fetch random question from API
 */
async function updateQuestionText() {
  try {
    const response = await fetch('/api/questions/random');
    const data = await response.json();
    const newTexture = createQuestionTexture(data.text);

    if (cardFront) {
      cardFront.material.map = newTexture;
      cardFront.material.needsUpdate = true;
    }
  } catch (err) {
    console.error('Error fetching question:', err);
  }
}
```

---

## 5. Customization Guide

### 5.1 Page Background

**Location:** `full-app/public/css/style.css`

**Line:** ~20

```css
/* 🔧 REPLACE THIS URL WITH YOUR BACKGROUND IMAGE */
body {
  background: url('your-background-image.jpg') center/cover no-repeat;
  background-color: #1a1a2e;  /* Fallback color */
}
```

**Recommended:** High-resolution image (1920x1080px or larger)

### 5.2 Card Images

**Location:** `full-app/public/js/card.js`

**Line:** ~10

```javascript
// 🔧 REPLACE THESE URLs WITH YOUR CARD IMAGES (714 x 1000px)
const CARD_BACK_IMAGE = 'your-card-back.png';  // Western art
const CARD_FRONT_IMAGE = 'your-card-front.png'; // Question side
```

**Dimensions:** 714 x 1000 pixels (2.5:3.5 ratio - standard poker card)
**Format:** PNG with transparency (for card front) or JPG

**Card Front Design:**
- Parchment/paper texture background
- Decorative border
- Area for question text
- "Click card for new question" instruction

**Card Back Design:**
- Western/saloon themed artwork
- Pattern or illustration
- No text (text is on front only)

---

## 6. Environment Variables

### 6.1 .env File

**Location:** `full-app/.env` (create from .env.example)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/3dcard

# MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/3dcard

# Session Secret (generate random string)
SESSION_SECRET=your-random-session-secret-key-change-this

# App URL
APP_URL=http://localhost:3000
```

### 6.2 Generating Session Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 7. Setup Instructions

### 7.1 Full Application

#### Prerequisites
- Node.js 14+ installed
- MongoDB (local or Atlas account)

#### Installation

```bash
# 1. Navigate to full-app directory
cd full-app

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your configuration
# Set MONGODB_URI and SESSION_SECRET

# 5. Start MongoDB (if using local)
mongod

# 6. Run the application
npm start
# Or for development with auto-reload:
npm run dev

# 7. Open browser
# Navigate to http://localhost:3000
```

---

## 8. Troubleshooting

### 8.1 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check MONGODB_URI in .env, ensure MongoDB is running |
| Port 3000 already in use | Change PORT in .env to 3001 or another port |
| Module not found | Run `npm install` in full-app directory |
| 3D card not displaying | Check browser console for WebGL errors |
| Session not persisting | Check SESSION_SECRET in .env |
| Questions not saving | Check MongoDB connection, check browser console |

### 8.2 Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Check MongoDB connection
mongosh  # MongoDB shell
> use 3dcard
> show collections
> db.users.find()
> db.questions.find()
```

---

## 9. API Reference

### 9.1 Endpoints

#### GET /api/questions/random
Get a random question for the authenticated user.

**Request:**
```http
GET /api/questions/random
Cookie: connect.sid=...
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "text": "What's your favorite travel destination?",
  "createdAt": "2026-02-02T12:00:00.000Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Authentication required"
}
```

#### POST /questions
Create a new question.

**Request:**
```http
POST /questions
Content-Type: application/x-www-form-urlencoded
Cookie: connect.sid=...

text=What+is+your+favorite+color%3F
```

**Response (302 Found):**
Redirects to /questions

#### PUT /questions/:id
Update an existing question.

**Request:**
```http
PUT /questions/507f1f77bcf86cd799439011?_method=PUT
Content-Type: application/x-www-form-urlencoded
Cookie: connect.sid=...

text=Updated+question+text%3F
```

**Response (302 Found):**
Redirects to /questions

**Error (404 Not Found):**
Question not found or doesn't belong to user.

#### DELETE /questions/:id
Delete a question.

**Request:**
```http
DELETE /questions/507f1f77bcf86cd799439011?_method=DELETE
Cookie: connect.sid=...
```

**Response (302 Found):**
Redirects to /questions

---

## 10. Code Snippets

### 10.1 Password Hashing Example

```javascript
const bcrypt = require('bcryptjs');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### 10.2 Session Check Middleware

```javascript
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
```

### 10.3 User Ownership Check

```javascript
const verifyOwnership = async (questionId, userId) => {
  const question = await Question.findOne({
    _id: questionId,
    createdBy: userId  // Must match
  });
  return question !== null;
};
```

---

This technical documentation provides detailed information about the 3Dcard application's architecture, implementation, and customization options for developers and maintainers.

# 3Dcard - Project Plan

**Project Name:** 3Dcard - Social Icebreaker Game
**Author:** Petri
**Date:** February 2026
**Project Type:** Web Application (Full-Stack)
**Timeline:** 5 Days

---

## 1. Executive Summary

3Dcard is a web-based social icebreaker game designed to eliminate awkward silences when people meet for the first time. It is a full-featured web application with MongoDB authentication and persistent data storage.

The core feature is an interactive 3D western-style playing card that responds to mouse movement and flips to reveal conversation-starter questions. Users can manage their own collection of questions through full CRUD operations.

---

## 2. Project Objectives

### Primary Objectives

1. **Functional 3D Card Interface** - Implement an interactive 3D card using Three.js with smooth flip animation and mouse-tilt effect
2. **User Authentication** - Create secure user signup/login system with MongoDB
3. **Question Management** - Implement full CRUD operations for conversation questions
4. **Comprehensive Documentation** - Complete technical documentation with Mermaid diagrams

### Success Criteria

| Criterion | Measurement | Target |
|-----------|------------|--------|
| Functional 3D Card | Card flips smoothly, mouse-tilt works | 100% |
| MongoDB Connection | Stable database connection | 100% uptime |
| CRUD Operations | Create, Read, Update, Delete all work | All 4 operations |
| Code Quality | Clean, commented, MVC architecture | Meets standards |
| Documentation | Complete with Mermaid diagrams | All required docs |

---

## 3. Scope

### In Scope

**Full Application:**
- User authentication (signup/login/logout)
- MongoDB integration
- Question CRUD per user
- Session management
- MVC architecture

### Out of Scope

- Social sharing features
- Question categories
- Analytics/usage tracking
- User profiles beyond username/password
- Password reset email
- Admin dashboard
- Mobile native applications

---

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| CSS3 | Styling and responsive design |
| Vanilla JavaScript | Client-side logic |
| Three.js | 3D card rendering |

### Backend (Full App)

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| EJS | Server-side templating |
| bcryptjs | Password hashing |
| express-session | Session management |

---

## 5. Architecture

### MVC Architecture

```
┌─────────────────────────────────────────────┐
│                 Browser                     │
│  (HTML, CSS, Three.js, Vanilla JS)         │
└─────────────────┬───────────────────────────┘
                  │ HTTP Requests
┌─────────────────▼───────────────────────────┐
│           Express Routes                    │
│  (Define endpoints, middleware)             │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Controllers                        │
│  (Handle business logic, CRUD ops)          │
└─────┬───────────────────────┬───────────────┘
      │                       │
┌─────▼───────────┐   ┌───────▼──────────────┐
│   Models        │   │    Views (EJS)       │
│ (MongoDB Schemas)│   │  (Rendered HTML)     │
└─────┬───────────┘   └──────────────────────┘
      │
┌─────▼───────────┐
│   MongoDB       │
│   Database      │
└─────────────────┘
```

---

## 6. Database Design

### Collections

**Users Collection:**
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**Questions Collection:**
```javascript
{
  _id: ObjectId,
  text: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Home page | No |
| GET/POST | `/signup` | User registration | No |
| GET/POST | `/login` | User login | No |
| GET | `/logout` | User logout | Yes |
| GET | `/questions` | Questions page | Yes |
| POST | `/questions` | Create question | Yes |
| PUT | `/questions/:id` | Update question | Yes |
| DELETE | `/questions/:id` | Delete question | Yes |
| GET | `/api/questions/random` | Random question API | Yes |
| GET | `/documentation` | Documentation page | No |

---

## 8. Development Timeline

```mermaid
gantt
    title 3Dcard Development Timeline (5 Days)
    dateFormat  YYYY-MM-DD
    section Day 1: Foundation
    Project Structure           :done, d1a, 2026-02-01, 2h
    Package.json & Config       :done, d1b, after d1a, 1h
    MongoDB Schemas             :done, d1c, after d1b, 2h
    Express Server Setup        :done, d1d, after d1c, 3h

    section Day 2: Authentication
    User Signup Endpoint        :done, d2a, 2026-02-02, 3h
    User Login Endpoint         :done, d2b, after d2a, 2h
    Session Management          :done, d2c, after d2b, 2h
    Auth UI Views               :done, d2d, after d2c, 3h

    section Day 3: Core Features
    Three.js 3D Card            :done, d3a, 2026-02-03, 4h
    Card Flip Animation         :done, d3b, after d3a, 2h
    Mouse-Tilt Effect           :done, d3c, after d3b, 2h
    Question CRUD Routes        :done, d3d, after d3c, 2h

    section Day 4: Integration
    Navigation Integration      :done, d4a, 2026-02-04, 2h
    Responsive Design           :done, d4b, after d4a, 3h
    Error Handling              :done, d4c, after d4b, 2h
    Testing & Bug Fixes         :done, d4d, after d4c, 3h

    section Day 5: Documentation
    Technical Documentation     :done, d5a, 2026-02-05, 3h
    Mermaid Diagrams            :done, d5b, after d5a, 2h
    Compliance Documents        :done, d5c, after d5b, 2h
    Final Review                :done, d5d, after d5c, 3h
```

### Day 1: Foundation
- [x] Project folder structure
- [x] Package.json setup
- [x] Environment configuration
- [x] MongoDB schemas (User, Question)
- [x] Basic Express server

### Day 2: Authentication
- [x] User signup endpoint
- [x] User login endpoint
- [x] Session management
- [x] Logout functionality
- [x] Login/Signup EJS views

### Day 3: Core Features
- [x] Three.js 3D card implementation
- [x] Card flip animation
- [x] Mouse-tilt effect
- [x] Question CRUD routes
- [x] Questions management page

### Day 4: Integration & Polish
- [x] Navigation bar integration
- [x] Responsive design
- [x] Error handling
- [x] Input validation

### Day 5: Documentation & Testing
- [x] Technical documentation
- [x] Mermaid diagrams
- [x] Compliance documents
- [x] Testing and bug fixes
- [x] Final review

---

## 9. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MongoDB connection issues | High | Medium | Use Atlas fallback, clear error messages |
| Three.js compatibility | Medium | Low | Test on multiple browsers, fallback to 2D |
| Time constraints | High | Medium | Prioritize core features, defer extras |
| Security vulnerabilities | High | Low | Use bcrypt, input validation, HTTPS |

---

## 10. Testing Strategy

### Unit Testing
- Model validation (User, Question schemas)
- Authentication functions
- CRUD operations

### Integration Testing
- MongoDB connection
- Session management
- API endpoints

### User Acceptance Testing
- Signup/login flow
- Question CRUD operations
- 3D card interaction
- Responsive design on mobile

---

## 11. Deployment

### Development Environment
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Production Environment
```bash
npm start   # Standard Node.js execution
```

### Hosting Options
- **Full Application:** Heroku, Railway, Render, DigitalOcean

---

## 12. Maintenance & Future Enhancements

### Planned Enhancements
1. Question categories
2. Social sharing features
3. User profiles
4. Analytics dashboard
5. Mobile applications

### Maintenance
- Dependency updates
- Security patches
- Bug fixes
- Performance optimization

---

## 13. Conclusion

```mermaid
graph TB
    subgraph "Development Phases"
        Phase1[Phase 1: Planning<br/>Day 1]
        Phase2[Phase 2: Authentication<br/>Day 2]
        Phase3[Phase 3: Core Features<br/>Day 3]
        Phase4[Phase 4: Integration<br/>Day 4]
        Phase5[Phase 5: Documentation<br/>Day 5]
    end

    subgraph "Key Deliverables"
        D1[Project Structure<br/>MongoDB Schemas<br/>Express Server]
        D2[User Signup/Login<br/>Session Management<br/>Auth UI]
        D3[Three.js 3D Card<br/>Flip Animation<br/>Question CRUD]
        D4[Navigation<br/>Responsive Design<br/>Error Handling]
        D5[Technical Docs<br/>Mermaid Diagrams<br/>Compliance Docs]
    end

    subgraph "Success Criteria"
        SC1[✅ Functional 3D Card]
        SC2[✅ MongoDB Connection]
        SC3[✅ CRUD Operations]
        SC4[✅ Code Quality]
        SC5[✅ Documentation]
    end

    Phase1 --> D1
    Phase2 --> D2
    Phase3 --> D3
    Phase4 --> D4
    Phase5 --> D5

    D1 --> SC1
    D2 --> SC2
    D3 --> SC3
    D4 --> SC4
    D5 --> SC5

    style Phase1 fill:#e1f5ff
    style Phase2 fill:#ffe1e1
    style Phase3 fill:#e1ffe1
    style Phase4 fill:#fff5e1
    style Phase5 fill:#f5e1ff

    style SC1 fill:#c8e6c9
    style SC2 fill:#c8e6c9
    style SC3 fill:#c8e6c9
    style SC4 fill:#c8e6c9
    style SC5 fill:#c8e6c9
```

3Dcard is designed as a complete full-stack web application demonstrating modern JavaScript development practices with user authentication and persistent data storage.

All project objectives align with the requirements for achieving an A grade, including comprehensive documentation, MongoDB integration, MVC architecture, and responsive UI design.

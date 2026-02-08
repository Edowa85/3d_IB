# 3Dcard - Social Icebreaker Game

A web-based social icebreaker game that helps break awkward silences when people meet for the first time.

## Quick Start

```bash
cd full-app
npm install
cp .env.example .env
# Edit .env with your MongoDB connection
npm start
# Open http://localhost:3000
```

## Features

- 🃏 **Interactive 3D Card** - Western-style playing card with smooth flip animation
- 🖱️ **Mouse-Tilt Effect** - Card responds subtly to mouse movement
- ✏️ **Question CRUD** - Create, Read, Update, Delete your own questions
- 🔐 **User Authentication** - Secure signup/login
- 💾 **MongoDB Storage** - Persistent data per user
- 🎨 **Customizable** - Easy background and card image replacement

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript, Three.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: bcryptjs, express-session

## Customization

### Background Image
Edit CSS around line 20:
```css
background: url('your-background-image.jpg') center/cover no-repeat;
```

### Card Images
Edit card.js around line 10:
```javascript
const CARD_BACK_IMAGE = 'your-card-back.png';  // 714x1000px
const CARD_FRONT_IMAGE = 'your-card-front.png';
```

## Project Structure

```
3Dcard/
├── full-app/      # Full application with backend
├── compliance/    # Legal documentation
└── docs/          # Full documentation
```

## Documentation

See [docs/README.md](docs/README.md) for:
- System architecture diagrams
- Database schema
- API endpoints
- Setup instructions

## License

© 2026 Petri - School Project

# Study Planner

A full-stack study planner web application built for students to manage subjects, assignments, deadlines, and study progress. The project includes secure JWT authentication, a relational backend, calendar-based planning, analytics, and AI-powered task breakdowns.

## Features

- User registration and login with JWT authentication
- Create, edit, and delete subjects
- Manage assignments and study tasks
- Calendar view for upcoming deadlines
- Dashboard with study statistics and progress tracking
- AI-powered task breakdown for large assignments
- Responsive modern user interface
- SQLite database with relational data structure

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express
- SQLite
- JWT Authentication
- bcryptjs

### AI
- Google Gemini API for intelligent task breakdown

## Project Structure

```text
study-planner/
├── src/                  # React frontend
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── App.tsx
├── server/               # Express backend
│   ├── routes.ts
│   ├── auth.ts
│   ├── db.ts
│   └── seed.ts
├── assets/
├── server.ts
├── package.json
└── .env.example
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/study-planner.git
cd study-planner
```

2. Install dependencies

```bash
npm install
```

3. Create an environment file

```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`

```env
GEMINI_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret
```

5. Start the development server

```bash
npm run dev
```

The application will run on the local development server with both the React frontend and Express backend.

## Build for Production

```bash
npm run build
npm start
```

## Database

The project uses SQLite as its database. Tables are automatically initialized when the server starts, making the project easy to run without additional database setup.

## Future Improvements

- Email reminders for deadlines
- Pomodoro study timer
- File attachments for assignments
- Collaborative group study spaces
- Attendance and GPA tracking
- Dark mode customization

## Learning Outcomes

This project demonstrates:

- Full-stack web development
- REST API design
- Authentication with JWT
- Database relationships
- State management in React
- CRUD operations
- AI API integration

## License

This project is open source and available under the MIT License.

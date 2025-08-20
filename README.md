# AiSchool - AI-Powered Personalized Learning Platform

AiSchool is an innovative educational platform that leverages artificial intelligence to create personalized learning experiences for students. The platform can ingest curricula from any country and transform them into adaptive, engaging lessons tailored to each student's learning style and pace.

## 🌟 Features

### Core Functionality
- **Curriculum-Agnostic Engine**: Upload and manage curricula from any country in JSON format
- **AI-Powered Lesson Generation**: Create personalized lessons using OpenAI GPT models
- **Adaptive Learning**: Tracks student progress and adjusts content difficulty accordingly
- **Multiple Learning Styles**: Support for academic, simplified, and humorous explanation styles
- **Interactive Practice**: Generate practice questions with immediate feedback
- **Progress Tracking**: Monitor mastery levels and learning confidence for each topic

### Technical Features
- **Modern Tech Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Secure Authentication**: Google OAuth integration via NextAuth.js
- **Database Flexibility**: PostgreSQL for production, with Prisma ORM
- **AI Integration**: OpenAI API for content generation and personalization
- **Responsive Design**: Mobile-first approach with clean, intuitive interface
- **RESTful API**: Comprehensive API for curriculum management and learning analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or use Supabase)
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aischool-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration (PostgreSQL)
   DATABASE_URL="postgresql://username:password@localhost:5432/aischool"
   DATABASE_URL_POOLER="postgresql://username:password@localhost:5432/aischool?pgbouncer=true"
   
   # NextAuth.js Configuration
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # AI SDK Configuration
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📚 Usage Guide

### For Students

1. **Sign In**: Use your Google account to sign in to the platform
2. **Set Learning Preferences**: Customize your learning style and virtual tutor persona
3. **Browse Curriculum**: Explore available subjects, units, and lessons
4. **Take Lessons**: Get AI-generated, personalized explanations for any topic
5. **Practice**: Test your understanding with adaptive practice questions
6. **Track Progress**: Monitor your mastery levels and learning journey

### For Administrators

1. **Upload Curriculum**: Add new curricula by uploading JSON files
2. **Manage Content**: View and organize curriculum structure
3. **Monitor Usage**: Track student engagement and learning analytics

### Curriculum Format

Curricula should be uploaded as JSON files following this structure:

```json
{
  "country": "Egypt",
  "grade": "Secondary One",
  "subjects": [
    {
      "subjectId": "PHY-01",
      "name": "Physics",
      "units": [
        {
          "unitId": "PHY-01-U1",
          "name": "Physical Quantities and Units of Measurement",
          "chapters": [
            {
              "chapterId": "PHY-01-U1-C1",
              "name": "Chapter One: Introduction to Measurement",
              "lessons": [
                {
                  "lessonId": "PHY-01-U1-C1-L1",
                  "name": "Physical Measurement",
                  "objectives": [
                    "Understand the importance of measurement",
                    "Distinguish between fundamental and derived quantities"
                  ],
                  "dependencies": [],
                  "keywords": ["Measurement", "International System", "Fundamental Quantities"]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: OpenAI GPT-4 for content generation
- **UI Components**: Custom components with Lucide React icons
- **Deployment**: Render.com (configured)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── curriculum/    # Curriculum management
│   │   ├── lessons/       # Lesson generation
│   │   ├── profile/       # Student profile management
│   │   └── questions/     # Question generation
│   ├── auth/              # Authentication pages
│   └── setup-db/          # Database setup page
├── components/            # React components
│   ├── CurriculumBrowser.tsx
│   ├── LessonViewer.tsx
│   └── ProfileManager.tsx
├── lib/                   # Utility libraries
│   ├── ai-service.ts      # AI integration service
│   ├── auth.ts            # Authentication configuration
│   ├── curriculum-schema.ts # Curriculum validation
│   ├── db.ts              # Database connection
│   └── utils.ts           # Utility functions
└── prisma/                # Database schema and migrations
```

## 🔧 API Documentation

### Curriculum Management
- `GET /api/curriculum` - List all curricula
- `POST /api/curriculum` - Upload new curriculum
- `GET /api/curriculum/[id]` - Get specific curriculum
- `GET /api/curriculum/[id]/browse` - Browse curriculum structure

### Lesson Generation
- `POST /api/lessons/generate` - Generate personalized lesson

### Student Profile
- `GET /api/profile` - Get student profile
- `PUT /api/profile` - Update learning preferences
- `POST /api/profile` - Update skill profile

### Question Generation
- `POST /api/questions/generate` - Generate practice questions

### Database Initialization
- `GET /api/init-db` - Check database status
- `POST /api/init-db` - Initialize database connection

## 🚀 Deployment

### Render.com Deployment

The project is configured for deployment on Render.com:

1. **Connect Repository**: Link your GitHub repository to Render
2. **Configure Environment**: Set environment variables in Render dashboard
3. **Deploy**: The `render.yaml` configuration handles the deployment process

Required environment variables for production:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Production URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## 🧪 Development

### Running Tests
```bash
npm test
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔮 Future Roadmap

- [ ] Multi-language support
- [ ] Voice-to-text homework assistance
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Collaborative learning features
- [ ] Integration with popular LMS platforms
- [ ] Advanced AI tutoring capabilities

---

**AiSchool** - Transforming education through personalized AI-powered learning experiences.

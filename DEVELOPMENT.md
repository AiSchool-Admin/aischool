# Development Guidelines

This document provides detailed guidelines for developers working on the AiSchool project.

## 🏗️ Project Structure

### Directory Organization

```
aischool-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── curriculum/    # Curriculum management
│   │   │   ├── lessons/       # Lesson generation
│   │   │   ├── profile/       # Student profile management
│   │   │   └── questions/     # Question generation
│   │   ├── auth/              # Authentication pages
│   │   ├── setup-db/          # Database setup page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── CurriculumBrowser.tsx
│   │   ├── LessonViewer.tsx
│   │   ├── ProfileManager.tsx
│   │   └── SessionProvider.tsx
│   └── lib/                   # Utility libraries
│       ├── ai-service.ts      # AI integration service
│       ├── auth.ts            # Authentication configuration
│       ├── curriculum-schema.ts # Curriculum validation
│       ├── db.ts              # Database connection
│       └── utils.ts           # Utility functions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
├── Docs/                      # Project documentation
└── package.json               # Dependencies and scripts
```

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials

### Environment Configuration

Create a `.env` file based on `.env.example`:

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

### Database Setup

1. **Install PostgreSQL** (or use a cloud service like Supabase)
2. **Create database**: `createdb aischool`
3. **Run migrations**: `npx prisma migrate deploy`
4. **Generate client**: `npx prisma generate`

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations for function parameters and return types
- Avoid `any` type; use proper typing or `unknown` when necessary

### React Component Guidelines

- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript interfaces for props
- Follow the single responsibility principle
- Use meaningful component and variable names

### API Route Guidelines

- Use proper HTTP status codes
- Implement consistent error handling
- Validate input data using Zod schemas
- Return structured JSON responses
- Include proper authentication checks

### Database Guidelines

- Use Prisma for all database operations
- Define proper relationships in schema
- Use transactions for complex operations
- Implement proper indexing for performance
- Follow naming conventions (camelCase for fields)

## 🧪 Testing Strategy

### Unit Testing

- Test individual functions and components
- Mock external dependencies (API calls, database)
- Use Jest and React Testing Library
- Aim for >80% code coverage

### Integration Testing

- Test API endpoints with real database
- Test authentication flows
- Test curriculum upload and processing
- Test AI service integration

### End-to-End Testing

- Test complete user workflows
- Test across different browsers
- Test responsive design on various screen sizes

## 🔐 Security Considerations

### Authentication & Authorization

- Use NextAuth.js for authentication
- Implement proper session management
- Validate user permissions for API access
- Use HTTPS in production

### Data Protection

- Encrypt sensitive data at rest
- Use environment variables for secrets
- Implement proper input validation
- Sanitize user inputs to prevent XSS

### API Security

- Rate limiting for API endpoints
- Input validation and sanitization
- Proper error handling (don't expose sensitive info)
- CORS configuration

## 🚀 Deployment Guidelines

### Environment-Specific Configurations

#### Development
- Use local PostgreSQL database
- Enable detailed error messages
- Use development OpenAI API limits

#### Production
- Use production database with connection pooling
- Enable error logging and monitoring
- Implement proper caching strategies
- Use production OpenAI API limits

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Performance optimization applied

## 📊 Performance Guidelines

### Frontend Performance

- Use Next.js Image component for optimized images
- Implement lazy loading for components
- Minimize bundle size with proper imports
- Use React.memo for expensive components
- Implement proper caching strategies

### Backend Performance

- Use database connection pooling
- Implement query optimization
- Use caching for frequently accessed data
- Optimize AI API calls with proper batching
- Monitor and log performance metrics

### Database Performance

- Use proper indexing
- Optimize complex queries
- Implement pagination for large datasets
- Use database-level constraints
- Monitor query performance

## 🔍 Debugging Guidelines

### Frontend Debugging

- Use React Developer Tools
- Implement proper error boundaries
- Use console.log strategically (remove in production)
- Use browser debugging tools
- Implement proper logging

### Backend Debugging

- Use proper logging levels
- Implement structured logging
- Use debugging tools for API routes
- Monitor database query performance
- Track AI API usage and costs

### Database Debugging

- Use Prisma Studio for data inspection
- Monitor query performance
- Use database logs for troubleshooting
- Implement proper error handling

## 🔄 Git Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `hotfix/*`: Critical bug fixes

### Commit Guidelines

- Use conventional commit messages
- Keep commits atomic and focused
- Write descriptive commit messages
- Include issue numbers when applicable

### Pull Request Process

1. Create feature branch from `develop`
2. Implement feature with tests
3. Update documentation if needed
4. Create pull request with description
5. Code review and approval
6. Merge to `develop`

## 📈 Monitoring and Analytics

### Application Monitoring

- Monitor API response times
- Track error rates and types
- Monitor database performance
- Track AI API usage and costs

### User Analytics

- Track user engagement metrics
- Monitor learning progress analytics
- Track curriculum usage patterns
- Measure lesson generation performance

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
- Check DATABASE_URL format
- Verify database server is running
- Check network connectivity
- Verify credentials

#### Authentication Issues
- Check Google OAuth configuration
- Verify NEXTAUTH_SECRET is set
- Check callback URLs
- Verify session configuration

#### AI Service Issues
- Check OpenAI API key validity
- Monitor API rate limits
- Check prompt formatting
- Verify model availability

### Debug Commands

```bash
# Check database connection
npx prisma db pull

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio

# Check build issues
npm run build

# Run type checking
npx tsc --noEmit
```

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

For questions or clarifications, please reach out to the development team or create an issue in the repository.


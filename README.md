# WealthPath

A comprehensive financial education platform built with Next.js 16, TypeScript, and Neon PostgreSQL.

## 🚀 Features

### 🤖 AI Content Generation
- **Smart Content Creation**: Generate articles, stories, learning paths, and quizzes
- **Customizable Parameters**: Adjust difficulty, tone, length, and target audience
- **Content Ideas**: Get AI-powered suggestions for new content topics
- **Structured Output**: Automatic titles, summaries, tags, and key points
- **Quality Control**: Review and edit AI-generated content before publishing
- **🖼️ Image Integration**: Automatic relevant image finding via Pixabay API
- **Smart Keyword Extraction**: AI analyzes content to find the best matching images
- **Proper Attribution**: Automatic photographer credits and licensing information
- **Local Storage**: Images downloaded and stored locally for performance

### 📚 Learning Management
- **Learning Paths**: Structured educational courses with progress tracking
- **Articles**: Educational content with approval workflow
- **Success Stories**: User testimonials and achievements
- **Interactive Quizzes**: Assessment tools with results tracking

### 👥 User Management
- **Role-based Access**: Admin and user roles with permissions
- **Profile Management**: Photo upload, bio editing, account settings
- **Progress Tracking**: Detailed learning analytics and statistics
- **Notifications**: Real-time announcements and alerts

### 🛡️ Admin Dashboard
- **Analytics Dashboard**: Comprehensive metrics and charts
- **Content Management**: Approve, edit, and manage all content
- **User Management**: Monitor and manage user accounts
- **Notification System**: Send targeted announcements
- **Settings Management**: Configure platform settings

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Built-in theme switching capability
- **Animations**: Smooth transitions with Framer Motion
- **Charts & Visualizations**: Interactive data displays with Recharts
- **Accessibility**: WCAG compliant with semantic HTML

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: SWR for server state, React hooks for client state
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Raw SQL with Neon client
- **Authentication**: Custom session-based auth
- **API**: Next.js API Routes
- **File Upload**: Multer with validation
- **Validation**: Zod schemas
- **AI Integration**: OpenAI GPT-4 Turbo for content generation
- **Image API**: Pixabay for relevant image discovery and licensing

### Deployment
- **Platform**: Vercel
- **CI/CD**: GitHub Actions (if configured)
- **Environment**: Production-ready with proper env vars

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (Neon recommended)
- Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd wealthpath
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# Session Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key"

# App URL (for production)
NEXTAUTH_URL="https://your-domain.vercel.app"

# OpenAI API Key (for AI content generation)
OPENAI_API_KEY="your-openai-api-key"

# Pixabay API Key (for image generation)
PIXABAY_API_KEY="your-pixabay-api-key"

# Optional: Upload settings
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880" # 5MB in bytes
```

### 4. Database Setup

Run the database migrations:

```bash
node scripts/run-simple-migrations.js
```

Create sample data (optional):

```bash
node scripts/seed-sample-data.js
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
wealthpath/
├── app/                    # Next.js app router
│   ├── actions/           # Server actions
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── articles/          # Article pages
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile
│   └── (other pages)
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── charts/           # Data visualization
│   ├── profile/          # Profile components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database connection
│   └── utils.ts          # Utility functions
├── public/                # Static assets
│   └── uploads/           # User uploads
├── scripts/               # Database and utility scripts
└── styles/                # Global styles
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and profiles
- `sessions` - Authentication sessions
- `learning_paths` - Educational courses
- `learning_path_modules` - Course content
- `articles` - Educational articles
- `success_stories` - User testimonials
- `user_progress` - Learning progress tracking
- `user_notifications` - User notifications
- `content_ratings` - Content feedback

### Admin Tables
- `site_settings` - Platform configuration
- `analytics_events` - Usage analytics

## 🔐 Authentication

The application uses a custom session-based authentication system:

- **Session Management**: HTTP-only cookies with secure settings
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Admin and user roles with middleware protection
- **Session Expiration**: 7-day session duration with automatic cleanup

## 📊 Analytics & Monitoring

### Built-in Analytics
- User activity tracking
- Learning progress analytics
- Content engagement metrics
- Notification delivery tracking

### Admin Dashboard Features
- Real-time statistics
- Interactive charts and graphs
- User management tools
- Content approval workflow

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Connect to Vercel**
   - Import your GitHub repository in Vercel
   - Configure environment variables
   - Deploy automatically

3. **Environment Variables Required**
   ```
   DATABASE_URL
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   OPENAI_API_KEY
   PIXABAY_API_KEY
   ```

### Manual Build

```bash
npm run build
npm start
```

## 🧪 Testing

### Database Tests
```bash
# Test database connection
node scripts/verify-all-routes.js

# Test notifications system
node scripts/test-notifications.js

# Test AI integration
node scripts/test-ai-integration.js

# Test Pixabay image integration
node scripts/test-pixabay-integration.js
```

### Build Tests
```bash
# Test production build
npm run build

# Test linting
npm run lint
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:ai` - Test OpenAI integration
- `npm run test:pixabay` - Test Pixabay image integration
- `npm run test:notifications` - Test notification system
- `npm run db:migrate` - Run database migrations
- `npm run db:verify` - Verify all routes and database
- `npm run deploy:prepare` - Prepare for deployment

## 🔧 Configuration

### Next.js Configuration
- TypeScript with strict mode
- Image optimization disabled (for Vercel)
- Tailwind CSS with PostCSS
- SWR for data fetching

### Database Configuration
- Neon PostgreSQL connection
- Connection pooling
- Automatic retries
- Error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the [documentation](./docs/)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new)

## 🌟 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Recharts](https://recharts.org/) - Chart library
- [OpenAI](https://openai.com/) - AI content generation
- [Pixabay](https://pixabay.com/) - Free stock images

---

**Built with ❤️ for financial education**

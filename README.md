# Equal Sign 👋

> AI-Powered Sign Language Learning Platform

An AI tutor that provides real-time feedback to students learning sign language using Azure AI and OpenAI. Built for Microsoft Imagine Cup.

## 🎯 Key Features

### Learning Features
- 🎥 **Real-time Webcam Learning**: Practice sign language in front of your camera
- 🎨 **Visual Feedback**: Color-coded accuracy indicators (Green/Yellow/Red)
- 📊 **Scoring System**: Real-time accuracy scoring
- 🤖 **AI-Based Tracking**: Precise tracking of 21 hand joint points using MediaPipe
- 💬 **Personalized Feedback**: Custom learning feedback powered by Azure OpenAI
- 📚 **Structured Learning**: Categorized word/phrase learning flow
- 🔍 **Smart Search**: Quick lesson search functionality
- 🎯 **Practice Today**: Daily review simulation based on learned lessons

### User Features
- 🔐 **User Authentication**: Secure login and signup system
- ⏰ **Session Management**: 60-minute session timeout for security
- 📈 **Learning History**: Track your progress over time
- 👤 **User Profile**: View your learning statistics and achievements
- 📅 **Daily Practice**: Review lessons you've learned today

### Technical Features
- 📸 **Multi-frame Capture**: Dynamic sign language recognition with multiple frames
- 🎬 **Video/Image Support**: Flexible media types for different lesson modes
- 🌐 **RESTful API Integration**: Seamless backend communication
- 🎨 **Responsive Design**: Works on desktop and mobile devices

## 📸 Screenshots

### Home Screen
<!-- Add your screenshot here -->
<img width="1500" alt="Home Screen" src="https://github.com/user-attachments/assets/08fcc63e-9ef0-44e2-9c89-20965c58b1a4" />

### Search Feature
<!-- Add your screenshot here -->
<img width="1500" alt="Search Feature" src="https://github.com/user-attachments/assets/31def8f2-f1cd-4c9a-a090-0f4f27b76e73" />

### Practice Mode
<!-- Add your screenshot here -->
<img width="1500" alt="Practice Mode" src="https://github.com/user-attachments/assets/e54e879f-ab9f-488f-bb10-bc3f400eaf84" />

### Practice Today (Simulation)
<!-- Add your screenshot here -->
<img width="1500" alt="Practice Today" src="https://github.com/user-attachments/assets/2ed30576-7482-4023-b44e-165fa09d96a6" />

### Learning History
<!-- Add your screenshot here -->
<img width="1500" alt="Learning History" src="https://github.com/user-attachments/assets/044927ed-ce9d-477d-90d1-ed9f49283bf4" />

### Result Screen
<!-- Add your screenshot here -->
<img width="1500" alt="Result Screen" src="https://github.com/user-attachments/assets/35eeb8da-3481-478d-aedc-6f7e2c1f4af5" />

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **MediaPipe Holistic** - Hand/pose tracking
- **WebRTC** - Webcam access
- **HTML5 Canvas** - Skeleton rendering

### Backend APIs
- **Azure AI** - Computer vision and pose analysis
- **Azure OpenAI** - Feedback generation
- **RESTful API** - Backend integration
- **JWT Authentication** - Secure user sessions

### Deployment
- **Azure Static Web Apps** - Frontend hosting
- **Azure App Service** - Backend API hosting

## 📁 Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx              # Home (category selection + search)
│   ├── CategoryDetailPage.tsx    # Level selection (word/phrase)
│   ├── ItemListPage.tsx          # Lesson list
│   ├── LessonDetailPage.tsx      # Lesson details
│   ├── PracticePage.tsx          # Real-time learning
│   ├── SimulationPage.tsx        # Practice Today mode
│   ├── ResultPage.tsx            # Learning results
│   ├── ProfilePage.tsx           # User profile & history
│   └── LoginPage.tsx             # Login & signup
├── components/
│   ├── Camera.tsx                # Webcam + MediaPipe integration
│   ├── ScoreBoard.tsx            # Score display
│   ├── Header.tsx                # Header component
│   ├── SidebarNav.tsx            # Navigation sidebar
│   └── SessionTimeoutChecker.tsx # Session timeout handler
├── services/
│   ├── api.ts                    # API client
│   └── authService.ts            # Authentication service
├── types/
│   └── index.ts                  # TypeScript type definitions
└── App.tsx                       # Router configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Webcam access

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.development` file:
```env
VITE_BACKEND_API_URL=your_backend_api_url
VITE_AI_API_URL=your_ai_api_url
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser

### 4. Build for Production
```bash
npm run build
```

## 💡 How to Use

### Basic Learning Flow
1. **Sign Up / Login** - Create an account or log in
2. **Browse Categories** - Select from 8 different categories (Greetings, Emotions, Daily Life, etc.)
3. **Choose Level** - Pick between Word or Phrase learning
4. **Select Lesson** - Browse and select a lesson to learn
5. **View Lesson Details** - Study the tutorial video and instructions
6. **Start Practice** - Click "Start Learning" button
7. **Allow Webcam** - Grant camera permission
8. **Practice Sign Language** - Follow the on-screen guidance
9. **Get Real-time Feedback** - See color-coded feedback:
   - 🟢 **Green**: Accurate movement
   - 🟡 **Yellow**: Moderate accuracy
   - 🔴 **Red**: Needs correction
10. **Complete Learning** - Click "Complete Learning" to see your results

### Practice Today Mode
1. Click **"Practice Today"** in the sidebar
2. System creates scenarios based on lessons you learned today
3. Practice in realistic conversation contexts
4. Get AI-powered feedback on your performance

### Search Feature
1. Use the search bar on the home page
2. Type keywords (e.g., "hello", "thank")
3. Press Enter or click the search icon
4. Browse search results with video previews

### Profile & History
1. Click **"Learning History"** or **"Profile"** in the sidebar
2. View your learning statistics
3. Track daily progress
4. See total lessons completed and average scores

## 🔐 Authentication

### Session Management
- **Session Duration**: 60 minutes
- **Auto Logout**: Automatic logout after session expires
- **Session Timeout Modal**: Notification when session expires
- **Secure Token Storage**: JWT tokens in localStorage

### Features
- User registration with validation
- Secure login with password confirmation
- Protected routes requiring authentication
- Persistent login across page refreshes

## 🎨 Design System

### Colors
- **Primary**: Azure Blue (#0078D4)
- **Secondary**: #005A9E
- **Success**: #16C60C
- **Warning**: #FFB800
- **Error**: #D13438
- **Background**: White with subtle gradients
- **Text**: #323130 (Primary), #605E5C (Secondary)

### Typography
- **Font Family**: System UI fonts (Segoe UI, San Francisco, etc.)
- **Headings**: Bold, 24-48px
- **Body**: Regular, 14-18px

## 📚 Learning Categories

- 👋 **Greetings**: Basic greetings for meetings and farewells
- 😊 **Emotions**: Express joy, sadness, anger, etc.
- 🏠 **Daily Life**: Common expressions in daily life
- 👪 **Family**: Family relationships and titles
- 🏫 **School**: School-related expressions
- 🍽️ **Reactions**: Expressions like "thank you", "sorry"
- ✋ **Alphabet**: Fingerspelling alphabet
- 🔢 **Numbers**: Finger counting and numbers

## 🤖 AI Integration

### MediaPipe Holistic
- Real-time hand tracking (21 landmarks per hand)
- Pose tracking (33 landmarks)
- Face tracking for comprehensive analysis

### Azure OpenAI
- Personalized feedback generation
- Context-aware coaching messages
- Performance analysis

### Computer Vision API
- Multi-frame capture for dynamic signs
- Pose comparison and scoring
- Accurate gesture recognition

## 🌟 Imagine Cup Highlights

- ♿ **Social Impact**: Improving education accessibility for deaf communities
- ☁️ **Azure Technology**: AI Vision + OpenAI + App Service + Static Web Apps
- 🎨 **Visual Impact**: Real-time feedback creates powerful demonstrations
- 🌍 **Scalability**: Can support sign languages from different countries
- 📱 **User Experience**: Intuitive learning flow
- 🔬 **Innovation**: AI-powered personalized learning at scale

## 🔄 API Endpoints

### Backend API
```
GET  /api/categories                     # Get all categories
GET  /api/lessons                        # Get all lessons
GET  /api/lessons/:id                    # Get specific lesson
GET  /api/lessons/category/:categoryId   # Get lessons by category
GET  /api/lessons/:id/answer-frames/count # Get frame count for lesson
POST /api/auth/signup                    # User registration
POST /api/auth/login                     # User login
GET  /api/learning-histories             # Get learning history
POST /api/learning-histories             # Save learning record
```

### AI API
```
POST /api/lessons/:id/feedback/image     # Single frame analysis
POST /api/lessons/:id/feedback/images    # Multi-frame analysis
POST /api/simulation                     # Create practice scenario
```

## 📝 Roadmap

### Completed ✅
- [x] User authentication system
- [x] Session management with timeout
- [x] Search functionality
- [x] Learning history tracking
- [x] Practice Today simulation mode
- [x] Multi-frame capture for dynamic signs
- [x] Real-time AI feedback
- [x] Profile page with statistics
- [x] MediaPipe integration

### Upcoming 🚀
- [ ] Achievement system (badges, levels)
- [ ] Social features (share progress)
- [ ] More sign language lessons
- [ ] Multi-language UI support
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Video recording and playback
- [ ] Leaderboard and competitions

## 🤝 Contributing

This project was built for Microsoft Imagine Cup. Contributions are welcome!

## 📄 License

MIT License

---

**Made with ❤️ for Microsoft Imagine Cup 2024**

**Team**: en-trophy

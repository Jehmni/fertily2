# Fertility Application Documentation

## Overview
This application provides fertility tracking and consultation services through an AI-powered chat interface.

## Architecture

### Frontend
- React with TypeScript
- Vite for build tooling
- TanStack Query for data fetching
- shadcn/ui for components
- Tailwind CSS for styling

### Backend
- Supabase for database and authentication
- Edge Functions for serverless computing
- OpenAI integration for chat functionality

## Key Features
1. AI Chat Interface
2. User Authentication
3. Admin Dashboard
4. Community Features
5. Analytics Tracking

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Component Structure

### Core Components
- `ChatWindow`: Main chat interface
- `AdminDashboard`: Admin control panel
- `UserProfile`: User profile management

### Utility Components
- `ErrorBoundary`: Error handling
- `LazyImage`: Optimized image loading
- `VirtualList`: Virtualized list rendering

## Best Practices
1. Use TypeScript for type safety
2. Follow accessibility guidelines
3. Implement error boundaries
4. Optimize performance with virtualization
5. Write comprehensive tests 
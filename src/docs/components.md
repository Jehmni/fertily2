# Component Documentation

## Overview
This document provides detailed information about the components used in the application.

## Components

### ChatWindow
The main chat interface component.

#### Props
- `messages`: Array of chat messages
- `onSend`: Callback function for sending messages
- `isLoading`: Boolean indicating loading state

#### Usage
```tsx
<ChatWindow
  messages={messages}
  onSend={handleSend}
  isLoading={isLoading}
/>
```

### AdminDashboard
The admin dashboard component.

#### Props
- None

#### Usage
Protected by AdminGuard component.
```tsx
<AdminGuard>
  <AdminDashboard />
</AdminGuard>
``` 
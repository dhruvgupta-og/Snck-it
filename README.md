# Snack It | Campus Food Delivery

A premium, mobile-first food delivery application tailored for college campuses.

## Features
- **Mobile-First Design**: Optimized for a 480px max width with a premium Gen Z aesthetic.
- **Role-Based Access**: Support for Users (Students), Admins, and Vendors.
- **Modern UI**: Red/Orange gradients, Inter/Poppins typography, glassmorphism, and smooth animations.
- **Cart System**: Advanced cart with quantity controls and store-lock.
- **Real-time Orders**: Real-time order tracking and admin status updates.
- **Onboarding**: Dynamic college selection and profile setup.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Framer Motion, Lucide Icons.
- **Backend**: Firebase Auth, Firestore, Hosting.
- **Styling**: Vanilla CSS with modern design tokens.

## Getting Started

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Firebase Setup**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Google Authentication**.
   - Create a **Firestore Database**.
   - Copy `env.local.example` to `.env.local` and fill in your credentials.

3. **Database Collections**:
   Ensure you have the following collections created (even if empty):
   - `users`
   - `colleges`
   - `stores`
   - `menuItems`
   - `orders`

4. **Run Locally**:
   ```bash
   npm run dev
   ```

## Admin Panel
Access the admin panel at `/admin`. Note: Ensure your user document in Firestore has `role: "admin"` to access.

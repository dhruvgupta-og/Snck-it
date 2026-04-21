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
   - Fill in your Firebase credentials directly in `.env`.

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

## Deployment Auth Checklist
If Google sign-in works locally but fails after deployment, check these first:

1. Add all `NEXT_PUBLIC_FIREBASE_*` variables in your hosting provider (for example Vercel) before building.
2. In Firebase Console, go to `Authentication -> Settings -> Authorized domains` and add your deployed domain.
3. In Firebase Console, go to `Authentication -> Sign-in method` and ensure the Google provider is enabled.
4. Redeploy after updating env vars, because `NEXT_PUBLIC_*` values are inlined at build time.

## Admin Panel
Access the admin panel at `/admin`. Note: Ensure your user document in Firestore has `role: "admin"` to access.

# BetMates 🎯

A social app for tracking casual bets and dares among friends. No real money involved - everything is symbolic and for fun!

## Features

- 🎲 Create and track casual bets with friends
- 👥 Group betting with friends
- 📱 Real-time notifications
- 🌐 Multi-language support (English/Spanish)
- 🔐 Firebase authentication (Apple/Google/Guest)
- 📊 Personal stats and history

## Tech Stack

- **Frontend**: Expo, React Native, TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Query + Zustand
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, FCM)
- **Styling**: Custom design system with green color palette
- **i18n**: English + Spanish support

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd BetMates
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication (Anonymous, Apple, Google)
   - Create a Firestore database
   - Update the Firebase configuration in `app.json` under the `extra` section

4. Start the development server:
```bash
npm start
```

5. Open Expo Go on your device and scan the QR code, or run in simulator:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization files
├── navigation/         # Navigation configuration
├── screens/            # Screen components
├── services/           # External services (Firebase, etc.)
├── store/             # State management (Zustand)
├── theme/             # Design system (colors, typography, spacing)
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## App Screens

1. **HomeScreen** - Active bets list with search and filters
2. **HistoryScreen** - Bet history with win/loss summary
3. **CreateBetScreen** - Create new bets with participants
4. **GroupsScreen** - Manage friend groups
5. **BetDetailScreen** - Detailed bet view with actions
6. **NotificationsScreen** - Push notifications list
7. **GroupEditScreen** - Join/create groups
8. **ProfileScreen** - User profile and settings
9. **AuthScreen** - Authentication flow

## Firebase Setup

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function uid() { return request.auth.uid; }

    match /users/{userId} {
      allow read, write: if isSignedIn() && userId == uid();
    }

    match /bets/{betId} {
      allow read: if isSignedIn() && (
        resource.data.participantIds.hasAny([uid()]) ||
        (resource.data.groupId != null &&
         get(/databases/$(database)/documents/groups/$(resource.data.groupId)).data.memberIds.hasAny([uid()]))
      );
      allow create: if isSignedIn() && request.resource.data.creatorId == uid();
      allow update: if isSignedIn() && (
        resource.data.creatorId == uid() ||
        resource.data.participantIds.hasAny([uid()])
      );
    }

    match /groups/{groupId} {
      allow read: if isSignedIn() && (
        resource.data.memberIds.hasAny([uid()]) || 
        resource.data.isPublic == true
      );
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.ownerId == uid();
    }

    match /notifications/{notifId} {
      allow read, update: if isSignedIn() && resource.data.userId == uid();
      allow create: if isSignedIn();
    }
  }
}
```

### Cloud Functions

The app uses Cloud Functions for:
- Bet lifecycle management (confirmations, doubles, resolution)
- Push notifications
- User stats computation
- Daily reminders

## Development Notes

### Running with Firebase Emulators

For local development, you can use Firebase emulators:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Start emulators:
```bash
firebase emulators:start
```

3. The app will automatically connect to emulators in development mode.

### Design System

The app uses a consistent design system with:
- **Primary Color**: #1E7F4F (dark green)
- **Secondary Color**: #2F80ED (blue)
- **Accent Color**: #F2C94C (yellow)
- **Typography**: SF Pro (iOS) / Inter (Android)
- **Spacing**: 8pt grid system
- **Border Radius**: Consistent rounded corners

### State Management

- **React Query**: Server state, caching, and synchronization
- **Zustand**: Client-side UI state and user preferences
- **Firebase**: Real-time data synchronization

## Building for Production

### iOS (via EAS Build)

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

### Android (via EAS Build)

```bash
eas build --platform android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational/personal use. No real money gambling is involved.

## Compliance Notes

- **No Real Money**: All betting is symbolic only
- **Age Rating**: 12+ (mild social features)
- **Privacy**: Privacy policy required for App Store
- **Apple Sign In**: Required for iOS submission
- **Data Protection**: GDPR/privacy compliant

---

**Disclaimer**: This app is for entertainment purposes only. No real money or gambling is involved. All bets are symbolic and meant for fun among friends.

# Voraci

An AI-powered mobile culinary assistant built with React Native and Expo that uses computer vision to scan ingredients, manages a smart pantry, and generates personalized recipes through Google Gemini's generative AI.

## Features

- **Smart Pantry** — Add and manage your ingredients manually or by scanning them with your camera.
- **AI Vision Scanner** — Take a photo of your fridge and the AI automatically detects the food items.
- **AI Chef** — Generates 3 personalized recipes based on your pantry, dietary preferences, and restrictions.
- **User Profile** — Set your diet type, allergies, servings, available time, cooking level, and cuisine preference.
- **Authentication** — Sign in with Google or email and password via Firebase.

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo SDK 54 | Main framework |
| React Navigation v7 | Tab and stack navigation |
| Google Gemini 2.5 Flash | Image analysis and recipe generation |
| Firebase Auth | User authentication |
| AsyncStorage | Local pantry and preferences persistence |
| EAS Build | APK compilation |

## Getting Started

```bash
git clone https://github.com/LuisHugo234/voraci.git
cd voraci
npm install
```

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Then fill in your credentials in the `.env` file.

Start the development server:

```bash
npx expo start
```

> ⚠️ This app uses native modules. A **Development Build** generated with EAS is required to run on a physical device. Expo Go is not supported ⚠️.

## Project Structure

```
voraci/
├── screens/
│   ├── LoginScreen.js
│   ├── PantryScreen.js
│   ├── ScannerScreen.js
│   ├── ChefScreen.js
│   └── ProfileScreen.js
├── services/
│   ├── firebaseConfig.js
│   ├── authService.js
│   ├── aiService.js
│   └── pantryService.js
├── scripts/
│   └── generateIcon.js
├── assets/
├── .env.example
├── App.js
└── app.json
```

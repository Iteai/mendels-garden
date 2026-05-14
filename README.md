# Mendel's Garden - Plant Genetics Simulation

A production-ready Android plant genetics simulation game built entirely with Expo Managed Workflow, React Native, and TypeScript. Designed specifically for mobile-only development workflows.

## Features
- **Offline-First Persistence**: Uses Zustand + AsyncStorage with a custom hydration engine that calculates exact millisecond deltas to grow plants accurately while the app is closed.
- **Mendelian Genetics Engine**: Dominant/recessive traits, procedural mutations, and crossbreeding.
- **SVG Graphics**: 100% lightweight SVG rendering using `react-native-svg`. No heavy image assets.
- **Mobile-Only Workflow**: Fully compatible with GitHub web editing, Expo Snack, and Codemagic cloud builds. No Android Studio required.

## Architecture
- `src/store/`: Zustand state management with AsyncStorage persistence.
- `src/genetics/`: The core logic for inheritance, mutations, and phenotype generation.
- `src/hooks/`: Contains `useGameLoop`, which manages real-time ticking and background/foreground state transitions.
- `src/components/svg/`: Procedural SVG generation for plants and pots.

## Development Workflow (Mobile Only)

### 1. Editing Code
You can edit all files directly on GitHub using the web interface or a mobile browser. Because this uses the Expo Managed Workflow, you never need to touch native Android files (`build.gradle`, `AndroidManifest.xml`, etc.).

### 2. Testing with Expo Snack
1. Go to [snack.expo.dev](https://snack.expo.dev)
2. Import your GitHub repository.
3. Run the app directly on your physical device using the Expo Go app.

### 3. Building the APK with Codemagic
This project includes a `codemagic.yaml` file configured to automatically generate the native Android code and build the APK in the cloud.

1. Sign up for [Codemagic](https://codemagic.io/).
2. Connect your GitHub repository.
3. Codemagic will automatically detect the `codemagic.yaml` file.
4. Click "Start new build".
5. Codemagic will run `npx expo prebuild` to generate the Android folder, compile the APK, and email it to you.

## Memory Optimization
- **Zustand Selectors**: Components only re-render when their specific state slices change.
- **SVG over PNG**: Reduces memory footprint drastically.
- **Throttled Game Loop**: The game loop ticks every 1000ms, preventing excessive React re-renders.

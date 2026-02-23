# Contributing to Mystic Connect

First off, thank you for considering contributing to Mystic Connect! It's people like you that make Mystic Connect such a great tool.

## Development Setup

1.  **Fork and Clone**
    \\\ash
    git clone https://github.com/Amkhodaei83/connect4-3d-hand.git
    cd connect4-3d-hand
    npm install
    \\\

2.  **Running Locally**
    \\\ash
    npm run dev
    # Open http://localhost:5173
    \\\

3.  **MediaPipe Assets**
    Ensure the \public/mediapipe/\ folder contains the necessary \.wasm\ and \.data\ files. These are critical for the Hand Tracking engine.

## Pull Request Process

1.  Create a new branch: \git checkout -b feature/amazing-feature\
2.  Make your changes.
3.  **Lint your code**: Run \
pm run lint\ before committing.
4.  Commit your changes using **Conventional Commits**:
    *   \eat: Add new magic spell effect\
    *   \ix: Correct minimax depth calculation\
    *   \docs: Update README installation steps\
5.  Push to your branch and open a Pull Request.

## Code Style

*   **React:** Functional components with Hooks.
*   **State:** Use Zustand stores (\src/store/gameStore.js\).
*   **3D:** Use \@react-three/fiber\ declarative components inside \Canvas\.
*   **Styling:** Utility-first CSS via Tailwind.

## Reporting Bugs

Please use the **Bug Report** issue template and include:
*   Browser & Version (e.g., Chrome 120)
*   Device (Desktop/Laptop/Mobile)
*   Console Errors (F12 > Console)

Thank you for your contributions!

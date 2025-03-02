# Fixing Build Dependency Conflicts

This document explains how to fix dependency conflicts that can occur during the build process of the Smart Debt Flow application.

## Problem

The application may experience build failures due to dependency conflicts between:

1. TypeScript version (`5.8.x`) and `@typescript-eslint/eslint-plugin` (`8.x`) which requires TypeScript `<5.8.0`
2. React version (`19.x`) and `react-plaid-link` which requires React `^16.8.0 || ^17.0.0 || ^18.0.0`
3. React types mismatches with the React version being used

## Solution

We've added an automatic fix script that runs before the build process to ensure compatible dependency versions.

### How it works

1. The `fix-dependencies.js` script automatically:
   - Downgrades TypeScript from `5.8.x` to `5.7.3` to be compatible with ESLint plugins
   - Downgrades React from `19.x` to `18.2.0` to be compatible with `react-plaid-link`
   - Adjusts React Router and React types to be compatible
   - Updates ESLint versions for compatibility

2. The script runs automatically before the build via the `prebuild` npm hook

### Running the fix manually

If you need to run the fix manually:

```bash
node fix-dependencies.js
```

### Troubleshooting

If you're still experiencing build issues, try these steps:

1. Delete `node_modules` and the lockfile:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. Run the dependency fix script:
   ```bash
   node fix-dependencies.js
   ```

3. Reinstall dependencies:
   ```bash
   npm install
   ```

4. Try the build again:
   ```bash
   npm run build
   ```

## For CI/CD Environments

For CI/CD environments like Netlify, Vercel, or GitHub Actions, the `prebuild` script will automatically run before the build command, fixing any dependency conflicts.

If you need to force the use of certain dependency versions in CI/CD, you can add `--legacy-peer-deps` to the install command:

```
npm install --legacy-peer-deps
```

However, the provided fix script is the preferred method as it ensures the correct versions are used without risking other dependency issues. 
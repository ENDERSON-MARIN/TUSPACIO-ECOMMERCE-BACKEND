#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in a CI/deployment environment
const isCI =
  process.env.CI ||
  process.env.VERCEL ||
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV;

// Check if eslint is available
function isEslintAvailable() {
  try {
    const eslintPath = path.join(
      process.cwd(),
      'node_modules',
      '.bin',
      'eslint'
    );
    return fs.existsSync(eslintPath);
  } catch (error) {
    return false;
  }
}

// Check if prettier is available
function isPrettierAvailable() {
  try {
    const prettierPath = path.join(
      process.cwd(),
      'node_modules',
      '.bin',
      'prettier'
    );
    return fs.existsSync(prettierPath);
  } catch (error) {
    return false;
  }
}

function runCommand(command, description) {
  try {
    console.log(`Running: ${description}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (isCI) {
      console.log(
        `⚠️  Continuing despite ${description} failure in CI/deployment environment`
      );
    } else {
      process.exit(1);
    }
  }
}

console.log('🚀 Running prepare script...');

if (isCI) {
  console.log(
    '📦 Detected CI/deployment environment - running quality checks with warnings allowed'
  );
}

// Run quality checks
let hasErrors = false;

if (isEslintAvailable()) {
  try {
    console.log('Running: ESLint check');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ ESLint check completed successfully');
  } catch (error) {
    console.error('❌ ESLint check failed:', error.message);
    if (!isCI) {
      hasErrors = true;
    } else {
      console.log(
        '⚠️  Continuing despite ESLint failure in CI/deployment environment'
      );
    }
  }
} else {
  console.log('⚠️  ESLint not available, skipping lint check');
}

if (isPrettierAvailable()) {
  try {
    console.log('Running: Prettier format check');
    execSync('npm run format:check', { stdio: 'inherit' });
    console.log('✅ Prettier format check completed successfully');
  } catch (error) {
    console.error('❌ Prettier format check failed:', error.message);
    if (!isCI) {
      console.log(
        '⚠️  Prettier formatting issues found. Run "npm run format" to fix them.'
      );
    } else {
      console.log(
        '⚠️  Continuing despite Prettier failure in CI/deployment environment'
      );
    }
  }
} else {
  console.log('⚠️  Prettier not available, skipping format check');
}

if (hasErrors && !isCI) {
  console.log('❌ Prepare script failed due to quality check errors');
  process.exit(1);
} else {
  console.log('✅ Prepare script completed successfully');
}

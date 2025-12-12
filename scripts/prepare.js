#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in a CI/deployment environment
const isCI =
  process.env.CI || process.env.VERCEL || process.env.NODE_ENV === 'production';

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
    if (!isCI) {
      process.exit(1);
    } else {
      console.log(`⚠️  Skipping ${description} in CI/deployment environment`);
    }
  }
}

console.log('🚀 Running prepare script...');

if (isCI) {
  console.log(
    '📦 Detected CI/deployment environment - skipping quality checks'
  );
  console.log('✅ Prepare script completed (CI mode)');
  process.exit(0);
}

// Run quality checks in development
if (isEslintAvailable()) {
  runCommand('npm run lint', 'ESLint check');
} else {
  console.log('⚠️  ESLint not available, skipping lint check');
}

if (isPrettierAvailable()) {
  runCommand('npm run format:check', 'Prettier format check');
} else {
  console.log('⚠️  Prettier not available, skipping format check');
}

console.log('✅ Prepare script completed successfully');

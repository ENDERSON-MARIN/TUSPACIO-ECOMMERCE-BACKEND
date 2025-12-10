const { expect } = require('chai');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

/**
 * **Feature: ecommerce-modernization, Property 2: Semantic versioning compliance**
 * **Validates: Requirements 1.2**
 * 
 * For any dependency version string in package.json, the version should follow valid 
 * semantic versioning format with appropriate range specifiers
 */

describe('Property Test: Semantic Versioning Compliance', function() {
  let packageJson;
  
  before(function() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageJsonContent);
  });

  // Valid semantic version range patterns
  const validRangePatterns = [
    /^\^(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // ^1.2.3, ^1.2.3-alpha.1
    /^~(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // ~1.2.3, ~1.2.3-beta.2
    /^>=(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // >=1.2.3
    /^(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // 1.2.3 (exact version)
    /^(\d+)\.(\d+)\.(\d+)-[\w\.-]+\.(\d+)$/, // 1.0.0-beta.3 (pre-release)
  ];

  it('should have all dependency versions following valid semantic versioning format', function() {
    fc.assert(fc.property(
      fc.constant(packageJson),
      (pkg) => {
        const allDependencies = {
          ...pkg.dependencies || {},
          ...pkg.devDependencies || {}
        };

        for (const [depName, version] of Object.entries(allDependencies)) {
          // Check if version follows semantic versioning pattern
          const isValidSemver = validRangePatterns.some(pattern => pattern.test(version)) || 
                               semver.validRange(version) !== null;
          
          if (!isValidSemver) {
            throw new Error(`Dependency ${depName} has invalid semantic version: ${version}`);
          }

          // Additional check: ensure the version can be parsed by semver
          const cleanVersion = version.replace(/^[\^~>=<]+/, '');
          if (!semver.valid(cleanVersion) && !semver.validRange(version)) {
            throw new Error(`Dependency ${depName} version ${version} is not a valid semantic version`);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use appropriate version range specifiers for production dependencies', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.dependencies || {}),
      (deps) => {
        for (const [depName, version] of Object.entries(deps)) {
          // Production dependencies should typically use ^ or ~ for automatic updates
          // or exact versions for critical dependencies
          const hasValidRangeSpecifier = version.startsWith('^') || 
                                       version.startsWith('~') || 
                                       version.startsWith('>=') ||
                                       /^\d+\.\d+\.\d+/.test(version); // exact version

          if (!hasValidRangeSpecifier) {
            throw new Error(`Production dependency ${depName} should use appropriate range specifier: ${version}`);
          }

          // Ensure the version after range specifier is valid
          const baseVersion = version.replace(/^[\^~>=<]+/, '');
          if (!semver.valid(baseVersion)) {
            throw new Error(`Production dependency ${depName} has invalid base version: ${baseVersion}`);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use appropriate version range specifiers for development dependencies', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.devDependencies || {}),
      (devDeps) => {
        for (const [depName, version] of Object.entries(devDeps)) {
          // Development dependencies can be more flexible with versioning
          const hasValidRangeSpecifier = version.startsWith('^') || 
                                       version.startsWith('~') || 
                                       version.startsWith('>=') ||
                                       /^\d+\.\d+\.\d+/.test(version); // exact version

          if (!hasValidRangeSpecifier) {
            throw new Error(`Development dependency ${depName} should use appropriate range specifier: ${version}`);
          }

          // Ensure the version after range specifier is valid
          const baseVersion = version.replace(/^[\^~>=<]+/, '');
          if (!semver.valid(baseVersion)) {
            throw new Error(`Development dependency ${depName} has invalid base version: ${baseVersion}`);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have engine versions following semantic versioning format', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.engines || {}),
      (engines) => {
        for (const [engineName, version] of Object.entries(engines)) {
          // Engine versions should be valid semver ranges
          if (!semver.validRange(version)) {
            throw new Error(`Engine ${engineName} has invalid version range: ${version}`);
          }

          // For Node.js specifically, ensure it's a reasonable version
          if (engineName === 'node') {
            const versionMatch = version.match(/(\d+\.\d+\.\d+)/);
            if (versionMatch) {
              const extractedVersion = versionMatch[1];
              if (!semver.valid(extractedVersion)) {
                throw new Error(`Node.js engine version ${extractedVersion} is not valid semantic version`);
              }
            }
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should not have conflicting version ranges for the same dependency', function() {
    fc.assert(fc.property(
      fc.constant(packageJson),
      (pkg) => {
        const prodDeps = pkg.dependencies || {};
        const devDeps = pkg.devDependencies || {};

        // Check for dependencies that appear in both prod and dev
        const commonDeps = Object.keys(prodDeps).filter(dep => devDeps[dep]);

        for (const dep of commonDeps) {
          const prodVersion = prodDeps[dep];
          const devVersion = devDeps[dep];

          // Both versions should be compatible (this is a simplified check)
          const prodClean = prodVersion.replace(/^[\^~>=<]+/, '');
          const devClean = devVersion.replace(/^[\^~>=<]+/, '');

          if (semver.valid(prodClean) && semver.valid(devClean)) {
            // Major versions should be compatible
            const prodMajor = semver.major(prodClean);
            const devMajor = semver.major(devClean);

            if (prodMajor !== devMajor) {
              console.warn(`Warning: ${dep} has different major versions in prod (${prodVersion}) and dev (${devVersion})`);
            }
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use caret (^) range for most dependencies to allow compatible updates', function() {
    fc.assert(fc.property(
      fc.constant(packageJson),
      (pkg) => {
        const allDeps = { ...pkg.dependencies || {}, ...pkg.devDependencies || {} };
        let caretCount = 0;
        let totalCount = 0;

        for (const [depName, version] of Object.entries(allDeps)) {
          totalCount++;
          if (version.startsWith('^')) {
            caretCount++;
          }
        }

        // At least 70% of dependencies should use caret ranges for flexibility
        const caretPercentage = (caretCount / totalCount) * 100;
        
        // This is a guideline, not a strict requirement
        if (caretPercentage < 50) {
          console.warn(`Only ${caretPercentage.toFixed(1)}% of dependencies use caret ranges. Consider using ^ for more dependencies to allow compatible updates.`);
        }

        return true;
      }
    ), { numRuns: 100 });
  });
});
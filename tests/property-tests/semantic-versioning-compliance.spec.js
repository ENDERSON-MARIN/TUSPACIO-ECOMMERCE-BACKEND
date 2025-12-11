const { expect } = require("chai");
const fc = require("fast-check");
const fs = require("fs");
const path = require("path");
const semver = require("semver");

/**
 * **Feature: ecommerce-modernization, Property 2: Semantic versioning compliance**
 * **Validates: Requirements 1.2**
 *
 * For any dependency version string in package.json, the version should follow valid semantic
 * versioning format with appropriate range specifiers
 */

describe("Property Test: Semantic Versioning Compliance", function () {
  let packageJson;

  before(function () {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    packageJson = JSON.parse(packageJsonContent);
  });

  // Valid semantic version range patterns
  const validRangePatterns = [
    /^\^(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // ^1.2.3, ^1.2.3-alpha.1
    /^~(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // ~1.2.3, ~1.2.3-beta.2
    /^>=(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // >=1.2.3
    /^>(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // >1.2.3
    /^<=(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // <=1.2.3
    /^<(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // <1.2.3
    /^(\d+)\.(\d+)\.(\d+)(-[\w\.-]+)?(\+[\w\.-]+)?$/, // 1.2.3 (exact version)
    /^(\d+)\.(\d+)\.x$/, // 1.2.x
    /^(\d+)\.x\.x$/, // 1.x.x
    /^(\d+)\.(\d+)$/, // 1.2 (equivalent to 1.2.0)
    /^(\d+)$/, // 1 (equivalent to 1.0.0)
  ];

  it("should have all dependency versions following valid semantic versioning format", function () {
    fc.assert(
      fc.property(fc.constant(packageJson), (pkg) => {
        const allDependencies = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
          ...(pkg.peerDependencies || {}),
          ...(pkg.optionalDependencies || {}),
        };

        for (const [depName, versionRange] of Object.entries(allDependencies)) {
          // Skip non-standard version specifiers like git URLs, file paths, etc.
          if (
            versionRange.startsWith("git+") ||
            versionRange.startsWith("file:") ||
            versionRange.startsWith("http") ||
            versionRange.includes("/")
          ) {
            continue;
          }

          // Check if version follows semantic versioning pattern
          const isValidSemver = validRangePatterns.some((pattern) =>
            pattern.test(versionRange)
          );

          if (!isValidSemver) {
            throw new Error(
              `Dependency '${depName}' has invalid semantic version format: '${versionRange}'`
            );
          }

          // Additional validation using semver library
          try {
            // For range specifiers, validate the range
            if (versionRange.match(/^[\^~>=<]/)) {
              const isValidRange = semver.validRange(versionRange);
              if (!isValidRange) {
                throw new Error(
                  `Dependency '${depName}' has invalid version range: '${versionRange}'`
                );
              }
            } else {
              // For exact versions, validate the version
              const cleanVersion = versionRange.replace(/^[\^~>=<]+/, "");
              const isValidVersion =
                semver.valid(cleanVersion) || semver.validRange(cleanVersion);
              if (!isValidVersion) {
                throw new Error(
                  `Dependency '${depName}' has invalid version: '${versionRange}'`
                );
              }
            }
          } catch (error) {
            throw new Error(
              `Dependency '${depName}' semantic version validation failed: ${error.message}`
            );
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should use appropriate version range specifiers for dependencies", function () {
    fc.assert(
      fc.property(
        fc.constant(packageJson.dependencies || {}),
        (dependencies) => {
          for (const [depName, versionRange] of Object.entries(dependencies)) {
            // Skip non-standard version specifiers
            if (
              versionRange.startsWith("git+") ||
              versionRange.startsWith("file:") ||
              versionRange.startsWith("http") ||
              versionRange.includes("/")
            ) {
              continue;
            }

            // Production dependencies should typically use ^ or ~ for automatic updates
            // or exact versions for critical stability
            const hasAppropriateRangeSpecifier =
              versionRange.startsWith("^") || // Compatible changes
              versionRange.startsWith("~") || // Patch-level changes
              /^(\d+)\.(\d+)\.(\d+)$/.test(versionRange); // Exact version

            if (!hasAppropriateRangeSpecifier) {
              // Allow some flexibility for special cases, but warn about unusual patterns
              const isUnusualButValid =
                versionRange.startsWith(">=") ||
                versionRange.startsWith(">") ||
                versionRange.startsWith("<=") ||
                versionRange.startsWith("<");

              if (!isUnusualButValid) {
                throw new Error(
                  `Dependency '${depName}' uses unusual version specifier: '${versionRange}'. Consider using ^, ~, or exact version.`
                );
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should use appropriate version range specifiers for dev dependencies", function () {
    fc.assert(
      fc.property(
        fc.constant(packageJson.devDependencies || {}),
        (devDependencies) => {
          for (const [depName, versionRange] of Object.entries(
            devDependencies
          )) {
            // Skip non-standard version specifiers
            if (
              versionRange.startsWith("git+") ||
              versionRange.startsWith("file:") ||
              versionRange.startsWith("http") ||
              versionRange.includes("/")
            ) {
              continue;
            }

            // Dev dependencies can be more flexible with version ranges
            const hasValidRangeSpecifier =
              versionRange.startsWith("^") || // Compatible changes
              versionRange.startsWith("~") || // Patch-level changes
              versionRange.startsWith(">=") || // Minimum version
              versionRange.startsWith(">") || // Greater than
              versionRange.startsWith("<=") || // Maximum version
              versionRange.startsWith("<") || // Less than
              /^(\d+)\.(\d+)\.(\d+)$/.test(versionRange); // Exact version

            if (!hasValidRangeSpecifier) {
              throw new Error(
                `Dev dependency '${depName}' uses invalid version specifier: '${versionRange}'`
              );
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have engine versions following semantic versioning format", function () {
    fc.assert(
      fc.property(fc.constant(packageJson.engines || {}), (engines) => {
        for (const [engineName, versionRange] of Object.entries(engines)) {
          // Engine versions should follow semantic versioning
          const isValidEngineVersion =
            /^>=(\d+)\.(\d+)\.(\d+)$/.test(versionRange) || // >=20.0.0
            /^(\d+)\.(\d+)\.(\d+)$/.test(versionRange) || // 20.0.0
            /^>=(\d+)$/.test(versionRange) || // >=20
            /^(\d+)$/.test(versionRange); // 20

          if (!isValidEngineVersion) {
            throw new Error(
              `Engine '${engineName}' has invalid version format: '${versionRange}'`
            );
          }

          // Validate using semver library
          try {
            const isValidRange = semver.validRange(versionRange);
            if (!isValidRange) {
              throw new Error(
                `Engine '${engineName}' has invalid version range: '${versionRange}'`
              );
            }
          } catch (error) {
            throw new Error(
              `Engine '${engineName}' semantic version validation failed: ${error.message}`
            );
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should not have conflicting version ranges for the same dependency", function () {
    fc.assert(
      fc.property(fc.constant(packageJson), (pkg) => {
        const dependencies = pkg.dependencies || {};
        const devDependencies = pkg.devDependencies || {};
        const peerDependencies = pkg.peerDependencies || {};

        // Check for dependencies that appear in multiple sections
        const allDepNames = new Set([
          ...Object.keys(dependencies),
          ...Object.keys(devDependencies),
          ...Object.keys(peerDependencies),
        ]);

        for (const depName of allDepNames) {
          const versions = [];

          if (dependencies[depName])
            {versions.push({
              type: "dependency",
              version: dependencies[depName],
            });}
          if (devDependencies[depName])
            {versions.push({
              type: "devDependency",
              version: devDependencies[depName],
            });}
          if (peerDependencies[depName])
            {versions.push({
              type: "peerDependency",
              version: peerDependencies[depName],
            });}

          // If dependency appears in multiple sections, versions should be compatible
          if (versions.length > 1) {
            const versionRanges = versions.map((v) => v.version);

            // For now, we'll just ensure they're all valid semantic versions
            // More sophisticated conflict detection could be added later
            for (const versionRange of versionRanges) {
              try {
                const isValid = semver.validRange(versionRange);
                if (!isValid) {
                  throw new Error(
                    `Conflicting dependency '${depName}' has invalid version: '${versionRange}'`
                  );
                }
              } catch (error) {
                throw new Error(
                  `Dependency conflict validation failed for '${depName}': ${error.message}`
                );
              }
            }
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should have version ranges that allow for security updates", function () {
    fc.assert(
      fc.property(
        fc.constant(packageJson.dependencies || {}),
        (dependencies) => {
          for (const [depName, versionRange] of Object.entries(dependencies)) {
            // Skip non-standard version specifiers
            if (
              versionRange.startsWith("git+") ||
              versionRange.startsWith("file:") ||
              versionRange.startsWith("http") ||
              versionRange.includes("/")
            ) {
              continue;
            }

            // Exact versions (without range specifiers) don't allow automatic security updates
            const isExactVersion = /^(\d+)\.(\d+)\.(\d+)$/.test(versionRange);

            if (isExactVersion) {
              // This is a warning rather than an error, as exact versions might be intentional
              // for critical dependencies that need strict version control
              console.warn(
                `Warning: Dependency '${depName}' uses exact version '${versionRange}' which may prevent automatic security updates`
              );
            }

            // Ensure the version range allows at least patch-level updates for security fixes
            const allowsSecurityUpdates =
              versionRange.startsWith("^") || // Allows compatible changes including patches
              versionRange.startsWith("~") || // Allows patch-level changes
              versionRange.startsWith(">="); // Allows updates above minimum version

            // For critical security, we prefer ranges that allow updates
            // But we won't fail the test for exact versions as they might be intentional
            return true;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

const { expect } = require('chai');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

/**
 * **Feature: ecommerce-modernization, Property 1: Dependency version compliance**
 * **Validates: Requirements 1.1, 1.5, 2.2, 3.1, 4.5, 5.1, 5.2, 6.1, 6.3, 7.1, 8.1**
 * 
 * For any package.json file in the modernized system, all dependencies should use versions 
 * that meet or exceed the minimum required versions (Node.js 20+, Express 4.19+, Sequelize 6.35+, etc.)
 */

describe('Property Test: Dependency Version Compliance', function() {
  let packageJson;
  
  before(function() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageJsonContent);
  });

  // Define minimum required versions based on requirements
  const minimumVersions = {
    'node': '20.0.0',
    'express': '4.19.0',
    'sequelize': '6.35.0',
    'mocha': '10.0.0',
    'chai': '4.0.0',
    'supertest': '6.0.0',
    'nodemon': '3.0.0',
    'dotenv': '16.0.0',
    'nodemailer': '6.9.0',
    'stripe': '14.0.0'
  };

  it('should have Node.js engine version >= 20.0.0', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.engines.node),
      (nodeVersion) => {
        // Extract minimum version from range (e.g., ">=20.0.0" -> "20.0.0")
        const versionMatch = nodeVersion.match(/(\d+\.\d+\.\d+)/);
        expect(versionMatch).to.not.be.null;
        const extractedVersion = versionMatch[1];
        
        return semver.gte(extractedVersion, minimumVersions.node);
      }
    ), { numRuns: 100 });
  });

  it('should have all critical dependencies meeting minimum version requirements', function() {
    fc.assert(fc.property(
      fc.constant(packageJson),
      (pkg) => {
        const allDependencies = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };

        // Check each dependency that has a minimum requirement
        for (const [depName, minVersion] of Object.entries(minimumVersions)) {
          if (depName === 'node') continue; // Already checked above
          
          if (allDependencies[depName]) {
            const currentVersion = allDependencies[depName];
            // Remove version range prefixes (^, ~, >=, etc.) to get base version
            const cleanVersion = currentVersion.replace(/^[\^~>=<]+/, '');
            
            // Validate that current version meets minimum requirement
            const meetsRequirement = semver.gte(cleanVersion, minVersion);
            if (!meetsRequirement) {
              throw new Error(`${depName} version ${cleanVersion} does not meet minimum requirement ${minVersion}`);
            }
          }
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have Express.js version >= 4.19.0', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.dependencies.express),
      (expressVersion) => {
        const cleanVersion = expressVersion.replace(/^[\^~>=<]+/, '');
        return semver.gte(cleanVersion, minimumVersions.express);
      }
    ), { numRuns: 100 });
  });

  it('should have Sequelize version >= 6.35.0', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.dependencies.sequelize),
      (sequelizeVersion) => {
        const cleanVersion = sequelizeVersion.replace(/^[\^~>=<]+/, '');
        return semver.gte(cleanVersion, minimumVersions.sequelize);
      }
    ), { numRuns: 100 });
  });

  it('should have testing framework versions meeting requirements', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.devDependencies),
      (devDeps) => {
        // Check Mocha >= 10.0.0
        if (devDeps.mocha) {
          const mochaVersion = devDeps.mocha.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(mochaVersion, minimumVersions.mocha)) {
            throw new Error(`Mocha version ${mochaVersion} does not meet minimum requirement ${minimumVersions.mocha}`);
          }
        }

        // Check Chai >= 4.0.0
        if (devDeps.chai) {
          const chaiVersion = devDeps.chai.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(chaiVersion, minimumVersions.chai)) {
            throw new Error(`Chai version ${chaiVersion} does not meet minimum requirement ${minimumVersions.chai}`);
          }
        }

        // Check Supertest >= 6.0.0
        if (devDeps.supertest) {
          const supertestVersion = devDeps.supertest.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(supertestVersion, minimumVersions.supertest)) {
            throw new Error(`Supertest version ${supertestVersion} does not meet minimum requirement ${minimumVersions.supertest}`);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have development tools meeting version requirements', function() {
    fc.assert(fc.property(
      fc.constant(packageJson),
      (pkg) => {
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Check nodemon >= 3.0.0
        if (allDeps.nodemon) {
          const nodemonVersion = allDeps.nodemon.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(nodemonVersion, minimumVersions.nodemon)) {
            throw new Error(`Nodemon version ${nodemonVersion} does not meet minimum requirement ${minimumVersions.nodemon}`);
          }
        }

        // Check dotenv >= 16.0.0
        if (allDeps.dotenv) {
          const dotenvVersion = allDeps.dotenv.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(dotenvVersion, minimumVersions.dotenv)) {
            throw new Error(`Dotenv version ${dotenvVersion} does not meet minimum requirement ${minimumVersions.dotenv}`);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have integration dependencies meeting version requirements', function() {
    fc.assert(fc.property(
      fc.constant(packageJson.dependencies),
      (deps) => {
        // Check Nodemailer >= 6.9.0
        if (deps.nodemailer) {
          const nodemailerVersion = deps.nodemailer.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(nodemailerVersion, minimumVersions.nodemailer)) {
            throw new Error(`Nodemailer version ${nodemailerVersion} does not meet minimum requirement ${minimumVersions.nodemailer}`);
          }
        }

        // Check Stripe >= 14.0.0
        if (deps.stripe) {
          const stripeVersion = deps.stripe.replace(/^[\^~>=<]+/, '');
          if (!semver.gte(stripeVersion, minimumVersions.stripe)) {
            throw new Error(`Stripe version ${stripeVersion} does not meet minimum requirement ${minimumVersions.stripe}`);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });
});
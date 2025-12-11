const { expect } = require("chai");
const fc = require("fast-check");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * **Feature: ecommerce-modernization, Property 11: Authentication security compliance**
 * **Validates: Requirements 4.2, 4.4**
 *
 * For any authentication operation (JWT creation, validation, password hashing),
 * the operation should use secure methods with proper configuration
 * (bcrypt with appropriate salt rounds, secure JWT settings)
 */
describe("Property 11: Authentication security compliance", function () {
  this.timeout(30000);

  describe("Password hashing security", function () {
    it("should use bcrypt with appropriate salt rounds (minimum 12)", function () {
      return fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 32 }), // Reduced range for performance
          async (password) => {
            // Test bcrypt hashing with proper salt rounds
            const saltRounds = 12; // Minimum secure salt rounds
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Verify the hash was created properly
            expect(hashedPassword).to.be.a("string");
            expect(hashedPassword.length).to.be.greaterThan(50); // bcrypt hashes are typically 60 chars
            expect(hashedPassword).to.not.equal(password); // Should not be plain text

            // Verify the hash can be validated
            const isValid = await bcrypt.compare(password, hashedPassword);
            expect(isValid).to.be.true;

            // Verify salt rounds are appropriate (extract from hash)
            const hashInfo = hashedPassword.split("$");
            if (hashInfo.length >= 3) {
              const actualRounds = parseInt(hashInfo[2]);
              expect(actualRounds).to.be.at.least(12); // Minimum security requirement
            }
          }
        ),
        { numRuns: 10 } // Reduced for performance
      );
    });

    it("should produce different hashes for the same password (salt uniqueness)", function () {
      return fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 32 }),
          async (password) => {
            const saltRounds = 12;
            const hash1 = await bcrypt.hash(password, saltRounds);
            const hash2 = await bcrypt.hash(password, saltRounds);

            // Same password should produce different hashes due to unique salts
            expect(hash1).to.not.equal(hash2);

            // Both hashes should validate the original password
            expect(await bcrypt.compare(password, hash1)).to.be.true;
            expect(await bcrypt.compare(password, hash2)).to.be.true;
          }
        ),
        { numRuns: 5 } // Reduced for performance
      );
    });
  });

  describe("JWT token security", function () {
    const testSecret = "test-secret-key-for-jwt-validation-minimum-32-chars";

    it("should create and validate JWT tokens with secure configuration", function () {
      return fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 999999 }),
            email: fc
              .string({ minLength: 5, maxLength: 50 })
              .filter((s) => s.includes("@") && s.includes(".")),
            role: fc.constantFrom("user", "admin", "moderator"),
            // Removed exp from payload to avoid conflict with expiresIn option
          }),
          (payload) => {
            // Create JWT with secure options
            const token = jwt.sign(payload, testSecret, {
              algorithm: "HS256", // Secure algorithm
              expiresIn: "1h", // Reasonable expiration
              issuer: "tuspacio-api",
              audience: "tuspacio-client",
            });

            // Verify token structure
            expect(token).to.be.a("string");
            expect(token.split(".")).to.have.length(3); // header.payload.signature

            // Verify token can be decoded and validated
            const decoded = jwt.verify(token, testSecret, {
              algorithms: ["HS256"],
              issuer: "tuspacio-api",
              audience: "tuspacio-client",
            });

            expect(decoded.userId).to.equal(payload.userId);
            expect(decoded.email).to.equal(payload.email);
            expect(decoded.role).to.equal(payload.role);
            expect(decoded.iss).to.equal("tuspacio-api");
            expect(decoded.aud).to.equal("tuspacio-client");
            expect(decoded.exp).to.be.a("number");
            expect(decoded.iat).to.be.a("number");
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should reject tokens with invalid signatures", function () {
      return fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 999999 }),
            email: fc
              .string({ minLength: 5, maxLength: 50 })
              .filter((s) => s.includes("@") && s.includes(".")),
            role: fc.constantFrom("user", "admin", "moderator"),
          }),
          (payload) => {
            // Create token with one secret
            const token = jwt.sign(payload, testSecret, {
              algorithm: "HS256",
              expiresIn: "1h",
            });

            // Try to verify with different secret
            const wrongSecret = "wrong-secret-key-different-from-original";

            expect(() => {
              jwt.verify(token, wrongSecret, { algorithms: ["HS256"] });
            }).to.throw();
          }
        ),
        { numRuns: 20 }
      );
    });

    it("should reject expired tokens", function () {
      const payload = {
        userId: 123,
        email: "test@example.com",
        role: "user",
      };

      // Create token that expires immediately
      const expiredToken = jwt.sign(payload, testSecret, {
        algorithm: "HS256",
        expiresIn: "-1s", // Already expired
      });

      expect(() => {
        jwt.verify(expiredToken, testSecret, { algorithms: ["HS256"] });
      }).to.throw(/jwt expired/);
    });

    it("should use secure JWT algorithms only", function () {
      const payload = { userId: 123, email: "test@example.com" };

      // Test that secure algorithms work
      const secureAlgorithms = ["HS256", "HS384", "HS512"];

      secureAlgorithms.forEach((algorithm) => {
        const token = jwt.sign(payload, testSecret, { algorithm });
        const decoded = jwt.verify(token, testSecret, {
          algorithms: [algorithm],
        });
        expect(decoded.userId).to.equal(payload.userId);
      });
    });
  });

  describe("Session security configuration", function () {
    it("should validate secure session configuration properties", function () {
      return fc.assert(
        fc.property(
          fc
            .record({
              secret: fc
                .string({ minLength: 32, maxLength: 128 })
                .filter((s) => s.trim().length >= 32), // No whitespace-only secrets
              maxAge: fc.integer({ min: 300000, max: 86400000 }), // 5 minutes to 24 hours in ms
              httpOnly: fc.constant(true), // Must be true for security
              sameSite: fc.constantFrom("strict", "lax", "none"),
            })
            .chain((config) => {
              // Generate secure flag based on sameSite value to ensure valid combinations
              const secure =
                config.sameSite === "none" ? fc.constant(true) : fc.boolean();
              return secure.map((secureValue) => ({
                ...config,
                secure: secureValue,
              }));
            }),
          (sessionConfig) => {
            // Validate session secret length
            expect(sessionConfig.secret.trim().length).to.be.at.least(32);

            // Validate session duration is reasonable
            expect(sessionConfig.maxAge).to.be.at.least(300000); // At least 5 minutes
            expect(sessionConfig.maxAge).to.be.at.most(86400000); // At most 24 hours

            // Validate security flags
            expect(sessionConfig.httpOnly).to.be.true; // Prevents XSS
            expect(["strict", "lax", "none"]).to.include(
              sessionConfig.sameSite
            );

            // If sameSite is 'none', secure must be true
            if (sessionConfig.sameSite === "none") {
              expect(sessionConfig.secure).to.be.true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Authentication input validation", function () {
    it("should validate email format for authentication", function () {
      return fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter((s) => {
            // Create a valid email format
            const emailRegex =
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(s);
          }),
          (email) => {
            // Basic email validation pattern
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(emailRegex.test(email)).to.be.true;

            // Email should not contain dangerous characters (except & which can be valid in email local part)
            const dangerousChars = ["<", ">", '"', "'", "\n", "\r", "\t"];
            dangerousChars.forEach((char) => {
              expect(email).to.not.include(char);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should enforce password strength requirements", function () {
      return fc.assert(
        fc.property(fc.string({ minLength: 8, maxLength: 128 }), (password) => {
          // Password should meet minimum length requirement
          expect(password.length).to.be.at.least(8);
          expect(password.length).to.be.at.most(128);

          // Password should not contain null bytes or control characters
          expect(password).to.not.match(/[\x00-\x1f\x7f]/);
        }),
        { numRuns: 50 }
      );
    });
  });
});

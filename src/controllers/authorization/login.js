const { User, Rol } = require("../../db.js");
const { Op } = require("sequelize");
const sendEmailUsers = require("../../helpers/sendEmailUsers");
const {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
} = require("../../middleware/auth.js");

/* OAuth/Social Login - INSERT USER IN DB */
const getLogin = async (req, res, next) => {
  const {
    name,
    email,
    email_verified,
    nickname,
    sid,
    id,
    picture,
    rol,
    status,
  } = req.body;
  // const { name, email, email_verified, nickname, sid, id,picture } = req.oidc.user
  try {
    // BUSCAR EL ID DEL ROL
    const role_id = await Rol.findAll({
      attributes: ["id"],
      where: { rolName: rol },
    });
    let roleid = role_id.map((e) => e.id);

    // VERIFICA SI EL USUARIO EXISTE
    let user = await User.findAll({
      where: {
        [Op.or]: [{ email: email }, { nickname: nickname }],
      },
    });

    let userData;
    // SI EL USUARIO NO EXISTE LO CREA EN LA DB
    if (user.length === 0) {
      userData = await User.create({
        name,
        nickname,
        email,
        email_verified,
        sid,
        picture,
        status,
        rol_id: roleid,
      });
      sendEmailUsers.sendMail(userData);
      console.log("send email login");
    } else {
      userData = user[0];
      sendEmailUsers.sendMail(userData);
      console.log("send email login");
    }

    // Generate JWT tokens for the user
    const payload = {
      userId: userData.id,
      email: userData.email,
      role: userData.rol_id,
      nickname: userData.nickname,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      user: userData,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/* Traditional Email/Password Login */
const loginWithPassword = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Email and password are required",
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Rol,
          attributes: ["id", "rolName"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.status) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Account is deactivated",
      });
    }

    // Verify password (assuming password field exists in User model)
    if (!user.password) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Password login not available for this account",
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // Generate JWT tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.rol_id,
      nickname: user.nickname,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("Password login error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Login failed",
    });
  }
};

/* User Registration */
const register = async (req, res) => {
  const { name, email, password, nickname } = req.body;

  // Input validation
  if (!name || !email || !password || !nickname) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Name, email, password, and nickname are required",
    });
  }

  // Password strength validation
  if (password.length < 8) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { nickname }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "User with this email or nickname already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get default role (assuming 'user' role exists)
    const defaultRole = await Rol.findOne({
      where: { rolName: "user" },
    });

    if (!defaultRole) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Default role not found",
      });
    }

    // Create user
    const newUser = await User.create({
      name,
      nickname,
      email,
      password: hashedPassword,
      email_verified: false,
      status: true,
      rol_id: defaultRole.id,
    });

    // Generate JWT tokens
    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.rol_id,
      nickname: newUser.nickname,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    // Send welcome email
    try {
      sendEmailUsers.sendMail(newUser);
      console.log("Welcome email sent");
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Registration failed",
    });
  }
};

module.exports = {
  getLogin,
  loginWithPassword,
  register,
};

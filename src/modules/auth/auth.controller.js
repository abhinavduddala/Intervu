const env = require('../../config/env');
const authService = require('./auth.service');

const { TOKEN_COOKIE_NAME } = authService;

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE_NAME, token, cookieOptions);
};

const clearAuthCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.register({ email, password, role: 'user' });

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  me,
};

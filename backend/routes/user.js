const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { createUser, getAllUsers, getUser, getUserById } = require('../database/queries/user');
const { authenticateToken } = require('./middleware/authentication');
const { userUrls } = require('../urls');

module.exports = (app) => {
  app.post(userUrls.register, async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await getUser(username);
      if (user) return res.status(400).send(`User with username '${username}' already exists`);

      const hashedPassword = await bcrypt.hash(password, 10);

      await createUser(username, hashedPassword);

      res.status(201).send('Registration successful');
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(userUrls.login, async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await getUser(username);
      if (!user) return res.status(400).send('Invalid username or password');

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(400).send('Invalid username or password');

      const accessToken = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.SECRET_KEY,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: '7d' }
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.send('Login successful');
    } catch (error) {
      res.status(500).send('Error logging in');
      console.error(error);
    }
  });

  app.post(userUrls.refreshToken, async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(400).send('Refresh token missing');

    try {
      const { userId } = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);

      const user = await getUserById(userId);

      if (!user) res.status(400).send('User not found');

      const accessToken = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.SECRET_KEY,
        { expiresIn: '15m' }
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      res.send('Access token renewed');
    } catch (error) {
      console.error(error);
      return res.status(400).send('Invalid or expired refresh token');
    }
  })

  app.post(userUrls.logout, (req, res) => {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).send('Logout successful');
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.get(userUrls.verify, authenticateToken, (req, res) => {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.get(userUrls.getAllUsers, authenticateToken, async (req, res) => {
    try {
      res.send(await getAllUsers());
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });
};

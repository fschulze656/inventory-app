const User = require('../schemas/User');

/**
 * Creates a usser document.
 *
 * @param {string} username Username of the user to be created (needs to be unique)
 * @param {string} password Encrypted password of the user
 */
const createUser = async (username, password) => {
  await User.create({ username, password });
};

/**
 * Retrieves all user documents from the database.
 *
 * @returns Array of all users
 */
const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

/**
 * Retrieves a user document by the username.
 *
 * @param {string} username
 * @returns Retrieved user document
 */
const getUser = async (username) => {
  const user = await User.findOne({ username });
  return user;
};

/**
 * Retrieves a user document by the document's `ObjectId`.
 *
 * @param {string} userId Document `ObjectId` of the user document
 * @returns Retrieved user document
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

module.exports = { createUser, getAllUsers, getUser, getUserById };

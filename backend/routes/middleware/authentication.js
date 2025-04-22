const jwt = require('jsonwebtoken');
const Project = require('../../database/schemas/Project');

const authenticateToken = (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) return res.sendStatus(401);

  jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.header('') || req.query.apiKey;
  if (!apiKey) return res.status(401).send('API key is required');

  const project = await Project.findOne({ apiKey });
  if (!project) return res.status(403).send('Invalid API key');

  req.project = { projectId: project._id, name: project.name };
  next();
};

module.exports = { authenticateToken, authenticateApiKey };

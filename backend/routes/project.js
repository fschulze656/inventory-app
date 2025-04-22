const { assembleItem } = require('../database/queries/item');
const { getAllProjects, getProject, createProject, updateProject } = require('../database/queries/project');
const { authenticateToken, authenticateApiKey } = require('./middleware/authentication');
const { projectUrls } = require('../urls');

module.exports = (app, broadcast) => {
  app.get(projectUrls.getAllProjects, authenticateToken, async (req, res) => {
    try {
      res.send(await getAllProjects());
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.get(projectUrls.getProject, authenticateToken, async (req, res) => {
    try {
      const { projectId } = req.params
      res.send(await getProject(projectId));
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(projectUrls.createProject, authenticateToken, async (req, res) => {
    try {
      const { project } = req.body;
      const { _id } = await createProject(project);
      res.status(200).send(_id);
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(projectUrls.updateProject, authenticateToken, async (req, res) => {
    const { projectId } = req.params;
    await updateProject(projectId, req.body);
    res.sendStatus(200);
    broadcast({ type: 'project/update', data: Date.now() });
  });

  app.post(projectUrls.assembleItem, authenticateApiKey, async (req, res) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const { projectId } = req.project;
      const { status, message } = await assembleItem(projectId, itemId, quantity);
      res.status(status).send(message);
      broadcast({ type: 'item/update', data: Date.now() });
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });
};

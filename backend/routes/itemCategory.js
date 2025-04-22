const { getAllCategories, createCategory } = require('../database/queries/itemCategory');
const { authenticateToken } = require('./middleware/authentication');
const { categoryUrls } = require('../urls');

module.exports = (app) => {
  app.get(categoryUrls.getAllCategories, authenticateToken, async (req, res) => {
    try {
      res.send(await getAllCategories());
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(categoryUrls.createCategory, authenticateToken, async (req, res) => {
    try {
      const { category } = req.body;
      res.status(200).send(await createCategory(category));
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  })
};

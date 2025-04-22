const mongoose = require('mongoose');
const multer = require('multer');
const { Readable } = require('stream');
const { getGfsBucket } = require('../database/MongoClient');
const Item = require('../database/schemas/Item');

const {
  getAllItems,
  getItem,
  createItem,
  updateQuantity,
  setQuantity,
  assembleItem,
  getRawBomMaterials,
  updateItem
} = require('../database/queries/item');
const { getHistory } = require('../database/queries/itemHistory');

const { authenticateToken } = require('./middleware/authentication');
const { itemUrls } = require('../urls');

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (app, broadcast) => {
  app.get(itemUrls.getAllItems, authenticateToken, async (req, res) => {
    try {
      res.send(await getAllItems());
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.get(itemUrls.getItem, authenticateToken, async (req, res) => {
    try {
      const { itemId } = req.params;
      res.send(await getItem(itemId));
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.get(itemUrls.getItemHistory, authenticateToken, async (req, res) => {
    try {
      const { itemId, entries } = req.params;
      res.send(await getHistory(itemId, entries));
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.get(itemUrls.getRawBomMaterials, authenticateToken, async (req, res) => {
    try {
      const { itemId } = req.params;
      res.send(await getRawBomMaterials(itemId));
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(itemUrls.createItem, authenticateToken, async (req, res) => {
    try {
      const { item, time } = req.body;
      const { userId } = req.user;
      res.status(200).send(await createItem(userId, item, time));
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(itemUrls.updateItem, authenticateToken, async (req, res) => {
    try {
      const { itemId } = req.params;
      const { status, message } = await updateItem(itemId, req.body);
      res.status(status).send(message);
      broadcast({ type: 'item/update', data: Date.now() });
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(itemUrls.updateQuantity, authenticateToken, async (req, res) => {
    try {
      const { itemId } = req.params;
      const { amount, projectId, comment, time } = req.body;
      const { userId } = req.user;
      const { status, message } = await updateQuantity(userId, itemId, amount, { projectId, comment, time });
      res.status(status).send(message);
      broadcast({ type: 'item/update', data: Date.now() });
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(itemUrls.setQuantity, authenticateToken, async (req, res) => {
    try {
      const { itemId } = req.params;
      const { newAmount, comment } = req.body;
      const { userId } = req.user;
      const { status, message } = await setQuantity(userId, itemId, newAmount, comment);
      res.status(status).send(message);
      broadcast({ type: 'item/update', data: Date.now() });
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(itemUrls.assembleItem, authenticateToken, async (req, res) => {
    try {
      const { itemId } = req.params;
      const { quantity, time } = req.body;
      const { userId } = req.user;
      const { status, message } = await assembleItem(userId, itemId, quantity, { time });
      res.status(status).send(message);
      broadcast({ type: 'item/update', data: Date.now() });
    } catch (error) {
      res.sendStatus(500);
      console.error(error);
    }
  });

  app.post(itemUrls.uploadImage, upload.single('file'), (req, res) => {
    try {
      const gfsBucket = getGfsBucket();
      const { itemId } = req.params;
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      const { originalname, buffer } = req.file;

      const readableStream = Readable.from(buffer);
      const uploadStream = gfsBucket.openUploadStream(originalname);
      readableStream.pipe(uploadStream);

      uploadStream.on('error', (err) => {
        console.error('Error uploading file:', err);
        res.status(500).send('Error uploading file');
      });


      uploadStream.on('finish', async () => {
        const item = await Item.findOneAndUpdate(
          { _id: itemId },
          { $set: { productImage: uploadStream.id } }
        );

        if (item.productImage) await gfsBucket.delete(item.productImage);

        res.status(201).send(uploadStream.id);
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  app.get(itemUrls.getImage, async (req, res) => {
    try {
      const gfsBucket = getGfsBucket();
      const { itemId } = req.params;
      const item = await Item.findById(itemId, { productImage: 1 });

      if (!item.productImage) return res.sendStatus(404);

      const id = new mongoose.Types.ObjectId(item.productImage);
      const downloadStream = gfsBucket.openDownloadStream(id);

      downloadStream.on('error', (err) => {
        console.log(err);
        return res.status(404).send('File not found');
      });

      downloadStream.pipe(res);
    } catch (err) {
      console.error(err);
    }
  });
};

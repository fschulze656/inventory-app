const mongoose = require('mongoose');

const Item = require('../schemas/Item');
const ItemCategory = require('../schemas/ItemCategory');
const Project = require('../schemas/Project');

const { logAction } = require('./itemHistory');
const Mailer = require('../../mailer');

/**
 * Retrieves all item documents from the database.
 *
 * @returns Array of all item documents
 */
const getAllItems = async () => {
  const items = await Item.find();
  return items;
};

/**
 * Retrieves an item item document from the database.
 *
 * @param {string} itemId Document `ObjectId` of the item
 * @returns Item document with its BOM, project and category fields populated
 */
const getItem = async (itemId) => {
  const [item] = await Item.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(itemId)
      }
    },
    {
      $lookup: {
        from: 'Item',
        localField: 'bom.itemId',
        foreignField: '_id',
        as: 'bomDetails'
      }
    },
    {
      $lookup: {
        from: 'Project',
        localField: 'associatedProjects',
        foreignField: '_id',
        as: 'associatedProjects'
      }
    },
    {
      $lookup: {
        from: 'ItemCategory',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    }
  ]);

  return item;
};

/**
 * Helper function for `getRawBomMaterials`.
 *
 * @param {string} itemId Document `ObjectId` of the item
 * @param {number} requiredQuantity Required quantity the parent item needs
 */
const searchBom = async (itemId, requiredQuantity = 1) => {
  const rawItems = [];
  const item = await Item.findById(itemId);
  if (!item) return rawItems;

  if (item.isAssembly) {
    for (const bomItem of item.bom) {
      const bomResult = await searchBom(bomItem.itemId, requiredQuantity * bomItem.requiredQuantity);
      rawItems.push(...bomResult);
    }
  } else {
    rawItems.push({ itemId, name: item.name, requiredQuantity, inStock: item.inStock });
  }

  return rawItems;
};

/**
 * Recursively calculates the amount of raw materials an item with a BOM needs.
 *
 * @param {string} itemId Document `ObjectId` of the item
 * @returns Array of the raw materials and their amount an item with a BOM requires
 */
const getRawBomMaterials = async (itemId) => {
  const rawItems = await searchBom(itemId);

  // merge all duplicate items together
  const merged = Object.values(rawItems.reduce((acc, { itemId, name, requiredQuantity, inStock }) => {
    // initialize acc entry for the current itemId
    if (!acc[itemId]) acc[itemId] = { itemId, name, requiredQuantity: 0, inStock };
    acc[itemId].requiredQuantity += requiredQuantity;
    return acc;
  }, {}));

  return merged;
};

/**
 * Creates an item document and add it to the associated projects if specified.
 *
 * @param {string} userId Document `ObjectId` of the user that triggered this action
 * @param {object} itemContent Details of the item to be created
 * @param {Date} time Date the creation of the item should be corrected to
 * @returns Document `ObjectId` of the item created
 */
const createItem = async (userId, itemContent, time) => {
  if (itemContent.bom.length > 0) {
    itemContent.isAssembly = true;
    itemContent.totalAssembled = itemContent.inStock;
  }

  itemContent.totalIn = itemContent.inStock;

  const item = await Item.create(itemContent);
  await logAction('createItem', item._id, { updateValue: item.inStock, time }, { userId });

  // add item to specified category
  if (item.category) {
    await ItemCategory.updateOne(
      { _id: item.category },
      { $push: { items: item._id } }
    );
  }

  // add item to all specified projects
  if (item.associatedProjects.length > 0) {
    for (const projectId of item.associatedProjects) {
      await Project.updateOne(
        { _id: projectId },
        { $push: { associatedItems: item._id } }
      );
    }
  }

  return item._id;
};

/**
 * Updates the details of an item.
 *
 * @param {*} itemId Document `ObjectId` of the item
 * @param {*} updateContent Updated item details
 * @returns Response object
 */
const updateItem = async (itemId, updateContent) => {
  try {
    const updated = await Item.updateOne(
      { _id: itemId },
      { $set: updateContent }
    );

    return updated.modifiedCount
      ? { status: 200, message: 'Updated Item' }
      : { status: 304, message: '' };
  } catch (error) {
    console.error(error);
    return { status: 500, message: error.message };
  }
};

/**
 * Updates the current stock of an item by `amount` and logs the action in the stock history.
 *
 * @param {string} userId Document `ObjectId` of the user that triggered this action
 * @param {string} itemId Document `ObjectId` of the item
 * @param {number} amount Amount to add or subtract from the current stock
 * @param {object} param3 Additional information that can be provided for the update
 * @param {*} session mongoose session in case of item assembly
 * @returns Response object
 */
const updateQuantity = async (userId, itemId, amount, { projectId, comment, time } = {}, session = null) => {
  try {
    const updateQuery = amount > 0
      ? { $inc: { inStock: amount, totalIn: amount } }
      : { $inc: { inStock: amount, totalOut: -amount } };

    const options = {
      new: true,
      ...(session && { session })
    };

    const item = await Item.findOneAndUpdate(
      { _id: itemId },
      updateQuery,
      options
    );

    await logAction('updateQuantity', itemId, { updateValue: amount, time }, { userId, projectId, comment }, session);

    if (item.inStock <= item.minAllowedQuantity && !session) {
      Mailer.sendLowStockNotification(item);
    }

    return { status: 200, message: `Updated stock of "${item.name}" by ${amount}`, updatedItem: item };
  } catch (error) {
    console.error(error);
    return { status: 500, message: error.message };
  }
};

/**
 * Replaces the current stock with `amount` and logs the action in the stock history.
 *
 * @param {string} userId Document `ObjectId` of the user that triggered this action
 * @param {string} itemId Document `ObjectId` of the item
 * @param {number} newAmount Amount to replace the current stock with
 * @param {string} comment Reason for this action
 * @returns Response object
 */
const setQuantity = async (userId, itemId, newAmount, comment) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: itemId },
      { $set: { inStock: newAmount } }
    );

    await logAction('setQuantity', itemId, { updateValue: newAmount, prevStock: item.inStock }, { userId, comment });

    return { status: 200, message: `Set stock of "${item.name}" to ${newAmount}` };
  } catch (error) {
    console.error(error);
    return { status: 500, message: error.message };
  }
};

/**
 * Adds the current stock of an item with a BOM and subtracts the required quantity from the BOM's items.
 *
 * In case a BOM item itself has a BOM `assembleItem` recursively goes through the bom and subtracts the stock accordingly.
 * If any part of the update should fail the transaction is aborted and all modifications are rolled back.
 *
 * @param {string} userId Document `ObjectId` of the user that triggered this action
 * @param {string} itemId Document `ObjectId` of the item
 * @param {number} quantityToAssemble Amount to add to the original item's stock
 * @param {object} param3 Additional information that can be provided for the update
 * @param {*} parentSession mongoose session started by the first recursion
 * @param {Map} lowStockItems Map of items where the current stock is less than the minimum allowed quantity
 * @returns Responst object
 */
const assembleItem = async (userId, itemId, quantityToAssemble, { time, comment = '' } = {}, parentSession = null, lowStockItems = new Map()) => {
  // start update session in first recursion
  const session = parentSession || await mongoose.startSession();

  // start transaction for rollback in first recursion in case any update should fail
  if (!parentSession) session.startTransaction();

  try {
    const item = await Item.findById(itemId).session(session);
    if (!item) throw new Error('Item not found');

    if (!parentSession) comment = `Used for assembly of "${item.name}"`;

    for (const bomEntry of item.bom) {
      const bomItem = await Item.findById(bomEntry.itemId, { _id: 1, name: 1, inStock: 1, isAssembly: 1 }).session(session);
      const { requiredQuantity } = bomEntry;

      const totalRequired = requiredQuantity * quantityToAssemble;

      // throw error if too few raw materials
      if (bomItem.inStock < totalRequired && !bomItem.isAssembly) {
        throw new Error(`Stock of "${bomItem.name}" insufficient. Required: ${totalRequired}, Available: ${bomItem.inStock}`);
      }

      // recursively assemble bom item with bom in case its stock should not be sufficient
      if (bomItem.isAssembly && bomItem.inStock < totalRequired) {
        await assembleItem(userId, bomItem._id, totalRequired, { comment, time }, session, lowStockItems);
      } else {
        const { updatedItem } = await updateQuantity(userId, bomItem._id, -totalRequired, { comment, time }, session);
        if (updatedItem.inStock <= updatedItem.minAllowedQuantity) {
          lowStockItems.set(updatedItem._id.toString(), updatedItem);
        }
      }
    }

    if (!parentSession) {
      // finish the update in the first recursion
      await updateQuantity(userId, item._id, quantityToAssemble, { time }, session);
      await session.commitTransaction();
      session.endSession();

      Array.from(lowStockItems.values()).forEach((item) => {
        Mailer.sendLowStockNotification(item);
      });

      return { status: 200, message: `Assembled ${quantityToAssemble} of "${item.name}"` };
    }
  } catch (error) {
    if (!parentSession) {
      console.error(error);
      // only abort transaction in first recursion
      await session.abortTransaction();
      session.endSession();
      return { status: 500, message: error.message };
    } else {
      // propagate error upwards
      throw error;
    }
  }
};

module.exports = {
  getAllItems,
  getItem,
  getRawBomMaterials,
  createItem,
  updateItem,
  updateQuantity,
  setQuantity,
  assembleItem
};

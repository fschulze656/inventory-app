const mongoose = require('mongoose');
const Item = require('../schemas/Item');
const ItemHistory = require('../schemas/ItemHistory');

/**
 * Logs the update action for an item in its history document.
 *
 * @param {string} action Update action
 * @param {string} itemId Document `ObjectId` of the item that was updated
 * @param {object} payload Information about the update
 * @param {object} origin Information about the user and if specified project and comment
 * @param {*} session mongoose session in case of item assembly
 * @returns `modifiedCount` or `upsertedCount` of the update query
 */
const logAction = async (action, itemId, payload, origin = {}, session = null) => {
  const { projectId, userId, comment } = origin;

  const options = {
    upsert: true,
    ...(session && { session })
  };

  const newAction = {
    action,
    projectId,
    userId,
    comment,
    quantity: payload.updateValue,
    prevStock: payload.prevStock,
    createdAt: payload.time ? new Date(payload.time) : new Date(Date.now()),
    updatedAt: new Date(Date.now())
  };

  const updated = await ItemHistory.updateOne(
    { item: itemId },
    {
      $push: {
        actionHistory: {
          $each: [newAction],
          $sort: { createdAt: 1 }
        }
      }
    },
    options
  );

  if (updated.upsertedCount) {
    await Item.updateOne(
      { _id: itemId },
      { $set: { history: updated.upsertedId } }
    );

    return updated.upsertedCount;
  }

  return updated.modifiedCount;
};

/**
 * Retrieves the stock history of an item.
 *
 * @param {string} itemId Document `ObjectId` of the item
 * @param {number} entries Amount of stock history entries to be returned.
 *                         If `entries` is `0`, all history entries are returned.
 * @returns Array of stock update actions
 */
const getHistory = async (itemId, entries) => {
  entries = Number(entries);
  const [history] = await ItemHistory.aggregate([
    {
      $match: { item: new mongoose.Types.ObjectId(itemId) }
    },
    { $unwind: '$actionHistory' },
    {
      $lookup: {
        from: 'Project',
        localField: 'actionHistory.projectId',
        foreignField: '_id',
        as: 'actionHistory.project',
        pipeline: [
          { $project: { _id: 1, name: 1 } }
        ]
      }
    },
    {
      $lookup: {
        from: 'User',
        localField: 'actionHistory.userId',
        foreignField: '_id',
        as: 'actionHistory.user',
        pipeline: [
          { $project: { _id: 1, username: 1 } }
        ]
      }
    },
    {
      $group: {
        _id: '$_id',
        item: { $first: '$item' },
        actionHistory: { $push: '$actionHistory' }
      }
    },
    {
      $project: {
        item: 1,
        actionHistory: entries === 0 ? 1 : { $slice: ['$actionHistory', -entries] }
      }
    }
  ]);

  return history.actionHistory;
};

module.exports = { logAction, getHistory };

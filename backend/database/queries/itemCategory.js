const mongoose = require('mongoose');
const ItemCategory = require('../schemas/ItemCategory');

/**
 * Retrieves all category documents from the database.
 *
 * @returns Array of all categories with their item field polulated
 */
const getAllCategories = async () => {
  const categories = await ItemCategory.aggregate([
    {
      $lookup: {
        from: 'Item',
        localField: 'items',
        foreignField: '_id',
        as: 'items'
      }
    }
  ]);
  return categories;
};

/**
 * Retrieves a category document from the database.
 *
 * @param {string} categoryId Document `ObjectId` of the category
 * @returns Category document with its item field populated
 */
const getCategory = async (categoryId) => {
  const [category] = await ItemCategory.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(categoryId) }
    },
    {
      $lookup: {
        from: 'Item',
        localField: 'items',
        foreignField: '_id',
        as: 'items'
      }
    }
  ]);

  return category;
};

/**
 * Creates a category document.
 *
 * @param {object} categoryContent Details of the category to be created
 * @returns Document of the created category
 */
const createCategory = async (categoryContent) => {
  const category = await ItemCategory.create(categoryContent);
  return category;
};

module.exports = { getAllCategories, getCategory, createCategory };

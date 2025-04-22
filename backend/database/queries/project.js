const crypto = require('crypto');
const mongoose = require('mongoose');
const Project = require('../schemas/Project');
const Item = require('../schemas/Item');
const User = require('../schemas/User');

/**
 * Retrieves all project documents from the database.
 *
 * @returns Array of all projects
 */
const getAllProjects = async () => {
  const projects = await Project.find();
  return projects;
};

/**
 * Retrieves a project document from the database.
 *
 * @param {string} projectId Document `ObjectId` of the project
 * @returns Project document with its item and user fields populated
 */
const getProject = async (projectId) => {
  const [project] = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $lookup: {
        from: 'Item',
        localField: 'associatedItems',
        foreignField: '_id',
        as: 'associatedItems'
      }
    },
    {
      $lookup: {
        from: 'User',
        localField: 'allowedUsers',
        foreignField: '_id',
        as: 'allowedUsers'
      }
    }
  ]);

  return project;
};

/**
 * Creates a project document.
 *
 * @param {object} projectContent Details of the project to be crated
 * @returns Document of the created project
 */
const createProject = async (projectContent) => {
  projectContent.apiKey = crypto.randomBytes(32).toString('hex');
  const project = await Project.create(projectContent);

  // add project to all specified items
  if (project.associatedItems.length > 0) {
    for (const itemId of project.associatedItems) {
      await Item.updateOne(
        { _id: itemId },
        { $push: { associatedProjects: project._id } }
      );
    }
  }

  // add project to all specified users
  if (project.allowedUsers.length > 0) {
    for (const userId of project.allowedUsers) {
      await User.updateOne(
        { _id: userId },
        { $push: { allowedProjects: project._id } }
      );
    }
  }

  return project;
};

/**
 * Updates the details of a project.
 *
 * @param {*} projectId Document `ObjectId` of the project
 * @param {*} updateContent Update query details
 * @returns `modifiedCount` of the update query
 */
const updateProject = async (projectId, updateContent) => {
  const { id, type, action } = updateContent;

  const updated = await Project.updateOne(
    { _id: projectId },
    { [action]: { [type]: id } }
  );

  if (type === 'associatedItems') {
    await Item.updateOne(
      { _id: id },
      { [action]: { associatedProjects: projectId } }
    );
  } else if (type === 'allowedUsers') {
    await User.updateOne(
      { _id: id },
      { [action]: { allowedProjects: projectId } }
    );
  }

  return updated.modifiedCount;
};

module.exports = { getAllProjects, getProject, createProject, updateProject };

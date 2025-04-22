const userUrls = {
  register: '/user/register',
  login: '/user/login',
  refreshToken: '/user/refreshToken',
  logout: '/user/logout',
  verify: '/user/verify',
  getAllUsers: '/user/getAllUsers'
};

const itemUrls = {
  getAllItems: '/item/getAllItems',
  getItem: '/item/getItem/:itemId',
  getItemHistory: '/item/getItemHistory/:itemId/:entries',
  getRawBomMaterials: '/item/getRawBomMaterials/:itemId',
  createItem: '/item/createItem',
  updateItem: '/item/updateItem/:itemId',
  updateQuantity: '/item/updateQuantity/:itemId',
  setQuantity: '/item/setQuantity/:itemId',
  assembleItem: '/item/assembleItem/:itemId',
  uploadImage: '/item/uploadImage/:itemId',
  getImage: '/item/getImage/:itemId'
};

const projectUrls = {
  getAllProjects: '/project/getAllProjects',
  getProject: '/project/getProject/:projectId',
  updateProject: '/project/updateProject/:projectId',
  createProject: '/project/createProject',
  assembleItem: '/project/assembleItem/:itemId'
};

const categoryUrls = {
  getAllCategories: '/category/getAllCategories',
  getCategory: '/category/getCategory/:categoryId',
  updateCategory: '/category/updateCategory/:categoryId',
  createCategory: '/category/createCategory'
};

module.exports = { userUrls, itemUrls, projectUrls, categoryUrls }

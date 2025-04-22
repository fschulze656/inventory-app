const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket;

const connectToMongoDB = async () => {
  const conn = mongoose.connection;
  conn.once('open', () => {
    // initialize gfs bucket for images
    gfsBucket = new GridFSBucket(conn.db, { bucketName: 'Image' });
    console.log("Database Connection Established");
  });

  // connect to replica set
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://root:example@localhost:27017,localhost:27018/?replicaSet=rs0&authSource=admin')
    .then(() => console.log('Connected to MongoDB replica set'))
    .catch((err) => {
      console.error(err.reason.servers);

      err.reason.servers.forEach((server) => {
        console.error(server.error);
      });
    });
};

const getGfsBucket = () => {
  if (!gfsBucket) throw new Error('GridFSBucket is not initialized');
  return gfsBucket;
};

module.exports = (async () => {
  if (mongoose.connections.length === 1) await connectToMongoDB();
});

module.exports.getGfsBucket = getGfsBucket;

const mongoose = require('mongoose');

let isReplicaSet = false;

const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bus_booking_db';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    
    // Check if connected instance is running with a replica set
    try {
      const adminDb = conn.connection.db.admin();
      const status = await adminDb.command({ replSetGetStatus: 1 }).catch(() => null);
      isReplicaSet = !!(status && status.ok);
    } catch {
      isReplicaSet = false;
    }
    console.log(`[MongoDB] Replica Set active: ${isReplicaSet}`);

    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    throw err;
  }
};

const getIsReplicaSet = () => isReplicaSet;

module.exports = {
  connectDB,
  getIsReplicaSet
};

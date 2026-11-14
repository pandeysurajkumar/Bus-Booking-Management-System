require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env.test')
});

if (!process.env.MONGODB_URI) {
  throw new Error('Test MONGODB_URI is missing');
}

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Jest must run with NODE_ENV=test');
}
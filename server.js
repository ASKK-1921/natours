const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('🖕 UNCAUGHT EXCEPTION 🖕 : Shutting down server');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    // autoIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection Successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Unhandled rejection safety net - catches all and gives details
process.on('unhandledRejection', (err) => {
  console.log('🖕 UNHANDLED REJECTION 🖕 : Shutting down server');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

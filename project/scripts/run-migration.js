require('ts-node/register');
const { runMigration } = require('../src/infrastructure/database');

runMigration()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

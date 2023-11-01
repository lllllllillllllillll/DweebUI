const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database/db.sqlite',
  logging: false
});


const Server = sequelize.define('Server', {
  // Model attributes are defined here
  timezone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hwa: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  media: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  pgid: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  puid: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
});

async function syncModel() {
  await sequelize.sync();
  console.log('Server model synced');
}

syncModel();


module.exports = Server;
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/db.sqlite',
  logging: false
});


const Containers = sequelize.define('Containers', {
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  visibility: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  size: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  group: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  start: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },
  stop: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },
  pause: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },
  restart: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },
  remove: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },
  logs: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },
  update: {
    type: DataTypes.JSON
    // allowNull defaults to true
  },

});

async function syncModel() {
  await sequelize.sync();
  console.log('Containers model synced');
}

syncModel();


module.exports = Containers;
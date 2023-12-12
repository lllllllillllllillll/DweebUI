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
  permissions: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
});

async function syncModel() {
  await sequelize.sync();
  console.log('Containers model synced');
}

syncModel();


module.exports = Containers;
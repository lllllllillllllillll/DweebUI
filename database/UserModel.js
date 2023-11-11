const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/db.sqlite',
  logging: false
});


const User = sequelize.define('User', {
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  username: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  email: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  password: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  role: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  group: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  avatar: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  UUID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  }
});

async function syncModel() {
  await sequelize.sync();
  console.log('User model synced');
}

syncModel();


module.exports = User;
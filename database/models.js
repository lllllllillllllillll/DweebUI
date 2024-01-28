import { Sequelize, DataTypes } from 'sequelize';


export const sequelize = new Sequelize({ 
  dialect: 'sqlite',
  storage: './database/db.sqlite',
  logging: false,
});

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING
  },
  group: {
    type: DataTypes.STRING
  },
  avatar: {
    type: DataTypes.STRING
  },
  lastLogin: {
    type: DataTypes.STRING
  },
  UUID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  }
});

export const Container = sequelize.define('Container', {
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
  },
  size: {
    type: DataTypes.STRING
  },
  group: {
    type: DataTypes.STRING
  }
});

export const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  containerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  containerID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  install: {
    type: DataTypes.STRING,
  },
  uninstall: {
    type: DataTypes.STRING
  },
  edit: {
    type: DataTypes.STRING
  },
  upgrade: {
    type: DataTypes.STRING
  },
  start: {
    type: DataTypes.STRING
  },
  stop: {
    type: DataTypes.STRING
  },
  restart: {
    type: DataTypes.STRING
  },
  pause: {
    type: DataTypes.STRING
  },
  logs: {
    type: DataTypes.STRING
  },
  hide: {
    type: DataTypes.STRING
  },
  view: {
    type: DataTypes.STRING
  },
  reset_view: {
    type: DataTypes.STRING
  },
});


export const Syslog = sequelize.define('Syslog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip : {
    type: DataTypes.STRING
  },
});


export const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.STRING
  },
  icon: {
    type: DataTypes.STRING,
  },
  color: {
    type: DataTypes.STRING,
  },
  createdAt : {
    type: DataTypes.STRING
  },
  createdBy : {
    type: DataTypes.STRING
  },
});
import session from 'express-session';
import SessionSequelize from 'connect-session-sequelize';
import { Sequelize, DataTypes} from 'sequelize';
import { readFileSync } from 'fs';

const SECURE = process.env.HTTPS || false;

// Session store
const SequelizeStore = SessionSequelize(session.Store);
const sessionData = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'database/sessions.sqlite',
    logging: false,
});
const SessionStore = new SequelizeStore({ db: sessionData });

export const sessionMiddleware = session({
  secret: 'not keyboard cat',
  store: SessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: SECURE,
      httpOnly: SECURE,
      maxAge: 3600000 * 8,
  },
});

// Server settings
const settings = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'database/settings.sqlite',
    logging: false,
});
const SettingsDB = new SequelizeStore({ db: settings });

// Display package information
let package_info = readFileSync(`package.json`, 'utf8');
package_info = JSON.parse(package_info);
console.log('\n');
console.log(`\x1b[33mDweebUI v${package_info.version}\x1b[0m`);
console.log(`\x1b[33mAuthor: ${package_info.author}\x1b[0m`);
console.log(`\x1b[33mLicense: ${package_info.license}\x1b[0m`);
console.log(`\x1b[33mDescription: ${package_info.description}\x1b[0m`);
console.log('');

// console.log in red
console.log('\x1b[31m * Only Docker volumes are supported. No bind mounts.\n \x1b[0m');
console.log('\x1b[31m * Breaking changes may require you to remove the DweebUI volume and start fresh. \n \x1b[0m');

// Test database connection
try {
    await sessionData.authenticate();
    await settings.authenticate();
    sessionData.sync();
    settings.sync();
    console.log(`\x1b[32mDatabase connection established.\x1b[0m`);
} catch (error) {
    console.error('\x1b[31mDatabase connection failed:', error, '\x1b[0m');
}

// Models
export const User = settings.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    userID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    preferences : {
      type: DataTypes.STRING
    },
});
  
export const Permission = settings.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  containerName: {
    type: DataTypes.STRING,
  },
  containerID: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  install: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  uninstall: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  edit: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  upgrade: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  start: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  stop: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  restart: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  pause: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  logs: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  hide: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  view: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  options: {
    type: DataTypes.STRING,
    defaultValue: false
  },
});

export const Syslog = settings.define('Syslog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING
  },
  uniqueID: {
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
  options : {
    type: DataTypes.STRING
  },
});

export const Notification = settings.define('Notification', {
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
  read: {
    type: DataTypes.STRING,
  },
  createdAt : {
    type: DataTypes.STRING
  },
  createdBy : {
    type: DataTypes.STRING
  },
  options : {
    type: DataTypes.STRING
  },
});

export const ServerSettings = settings.define('ServerSettings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true
  }
});


export const Container = settings.define('Container', {
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
  service: {
      type: DataTypes.STRING
  },
  state: {
      type: DataTypes.STRING
  },
  image: {
      type: DataTypes.STRING
  },
  external_port: {
      type: DataTypes.STRING
  },
  internal_port: {
      type: DataTypes.STRING
  },
  ports: {
      type: DataTypes.STRING
  },
  volumes: {
      type: DataTypes.STRING
  },
  environment_variables: {
      type: DataTypes.STRING
  },
  labels: {
      type: DataTypes.STRING
  },
  IPv4: {
      type: DataTypes.STRING
  },
  style: {
      type: DataTypes.STRING
  },
  cpu: {
      type: DataTypes.STRING
  },
  ram: {
      type: DataTypes.STRING
  },
  link: {
      type: DataTypes.STRING
  },
  update: {
      type: DataTypes.STRING
  },
  group: {
      type: DataTypes.STRING
  },
  options: {
      type: DataTypes.STRING
  },
  host: {
      type: DataTypes.STRING
  },
});

export const Variables = settings.define('Variables', {
id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
},
key: {
    type: DataTypes.STRING
},
value: {
    type: DataTypes.STRING
}, 
options: {
    type: DataTypes.STRING
}
});


export const ContainerLists = settings.define('ContainerLists', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  containers: {
    type: DataTypes.STRING,
  },
  hidden: {
    type: DataTypes.STRING,
  },
  visable: {
    type: DataTypes.STRING,
  },
  new: {
    type: DataTypes.STRING,
  },
  updates: {
    type: DataTypes.STRING,
  },
  sent: {
    type: DataTypes.STRING,
  },
});
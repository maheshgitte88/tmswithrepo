const { Sequelize } = require("sequelize");


const sequelize = new Sequelize('TestingTMS', 'dbmasteruser', '%hy3])k$<${G:rY0[k:]>QcOZ;JUvK-C', {
    host: 'ls-9ebc19b44f881f32b698f79e8b61368e3f5686a9.cxw76sd6irpv.ap-south-1.rds.amazonaws.com',
    dialect: 'mysql',
    pool: {
        max: 50,  // Maximum number of connection in pool
        min: 0,   // Minimum number of connection in pool
        acquire: 30000,  // The maximum time (ms) that pool will try to get connection before throwing error
        idle: 10000  // The maximum time (ms) that a connection can be idle before being released
      },
      logging: console.log  // Enable logging for debugging
});


module.exports = sequelize;



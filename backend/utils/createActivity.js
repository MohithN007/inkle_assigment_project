const Activity = require('../models/Activity');
module.exports = async function createActivity(obj){
  return Activity.create(obj);
};

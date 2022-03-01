const schedule = require("node-schedule");

const scheduler = (time, fun) => {
  const job = schedule.scheduleJob(time, fun);
  return job;
};

module.exports = scheduler;

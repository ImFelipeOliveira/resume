module.exports = {
    apps : [
        {
            name   : "bot",
            script : "./dist/bot.js",
            instances: 1,
            exec_mode: "fork",
        },
        {
            name   : "worker",
            script : "./dist/worker.js",
            instances: 10,
            exec_mode: "cluster",
        }
    ]
}
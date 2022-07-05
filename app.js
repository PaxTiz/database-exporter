const { exec } = require('child_process')
const { join } = require('path')
const cron = require('node-cron')
require('dotenv').config()

const envs = Object.keys(process.env).filter(e => e.startsWith('CRON_DATABASE_'))
const tasks = []
for (const env of envs) {
    const schedule = process.env[env.replace('DATABASE', 'SCHEDULE')]
    const username = process.env[env.replace('DATABASE', 'USERNAME')]
    const password = process.env[env.replace('DATABASE', 'PASSWORD')]
    tasks.push({
        database: process.env[env],
        schedule,
        username,
        password
    })
}

for (const task of tasks) {
    cron.schedule(task.schedule, () => {
        const time = new Date().getTime()
        const outputPath = join(__dirname, `${time}-${task.database}.sql`)
        exec(`mysqldump -u${task.username} -p${task.password} ${task.database} > ${outputPath}`)
    }, { timezone: 'Europe/Paris', runOnInit: true })
}

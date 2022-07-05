const { exec } = require('child_process')
const { join } = require('path')
const cron = require('node-cron')
const { existsSync, mkdirSync } = require('fs')
require('dotenv').config()

const zeroes = value => {
    value = value.toString()
    return value.length === 2 ? value : `0${value}`
}

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
        const fileDirectory = join(__dirname, 'dumps', task.database)
        if (!existsSync(fileDirectory)) {
            mkdirSync(fileDirectory, { recursive: true })
        }

        const date = new Date()
        const day = zeroes(date.getDate())
        const month = zeroes(date.getMonth())
        const year = date.getFullYear()
        const formattedDate = `${day}${month}${year}`

        const outputPath = join(fileDirectory, `${formattedDate}-${task.database}.sql`)
        exec(`mysqldump -u${task.username} -p${task.password} ${task.database} > ${outputPath}`)
    }, { timezone: 'Europe/Paris', runOnInit: true })
}

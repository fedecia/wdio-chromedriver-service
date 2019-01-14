import { promisify } from 'util'
import ChromeDriver from 'chromedriver'
import fs from 'fs-extra'
import getFilePath from './utils/getFilePath'
import childProcess from 'child_process'
var binPath = ChromeDriver.path

const DEFAULT_LOG_FILENAME = 'ChromeDriver.txt'

export default class ChromeDriverLauncher {
    constructor () {
        this.chromeDriverLogs = null
        this.chromeDriverArgs = {}
        this.logToStdout = false

        return this
    }

    onPrepare (config) {
        this.chromeDriverArgs = config.chromeDriverArgs || []
        this.chromeDriverLogs = config.chromeDriverLogs
        this.logToStdout = config.logToStdout

        return new Promise((resolve, reject) => {
            this.process = childProcess.spawn(binPath, this.chromeDriverArgs)

            if (this.process) {
                this.process.on('error', (err) => {
                    reject(err)
                })
                if (typeof this.chromeDriverLogs === 'string') {
                    this._redirectLogStream()
                }
                resolve()
            }
        })
    }

    onComplete () {
        if (this.process) {
            this.process.kill()
        }
    }

    _redirectLogStream () {
        const logFile = getFilePath(this.chromeDriverLogs, DEFAULT_LOG_FILENAME)

        // ensure file & directory exists
        fs.ensureFileSync(logFile)

        const logStream = fs.createWriteStream(logFile, { flags: 'w' })

        this.process.stdout.pipe(logStream)
        this.process.stderr.pipe(logStream)
    }
}

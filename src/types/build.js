/**
 * @typedef {Object} BuildLog
 * @property {string} id - The unique identifier of the log entry
 * @property {string} timestamp - The timestamp of the log entry
 * @property {string} message - The log message
 * @property {'info' | 'error' | 'warning'} level - The log level
 */

/**
 * @typedef {Object} BuildHistory
 * @property {string} id - The unique identifier of the build
 * @property {string} commitHash - The commit hash
 * @property {string} commitMessage - The commit message
 * @property {'success' | 'failed' | 'running'} status - The build status
 * @property {string} startTime - The build start time
 * @property {string} [endTime] - The build end time (optional)
 * @property {string} duration - The build duration
 * @property {string} branch - The branch name
 */ 
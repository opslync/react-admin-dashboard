/**
 * @typedef {Object} WorkflowStep
 * @property {string} id
 * @property {'source' | 'build' | 'deploy'} type
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {Object.<string, any>} config
 */

/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} WorkflowConnection
 * @property {string} from
 * @property {string} to
 */

export const WorkflowTypes = {
  SOURCE: 'source',
  BUILD: 'build',
  DEPLOY: 'deploy'
}; 
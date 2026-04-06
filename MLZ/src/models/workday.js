/**
 * @typedef {object} workday
 * @property {number} id
 * @property {number} userId
 * @property {string} dateDay 
 * @property {number} totalMinutes 
 * @property {workSession[]} sessions 
 
 */
export const workday = {};

/**
 *
 * @typedef {object} workSession
 * @property {number} id
 * @property {string} from
 * @property {string} to
 */
export const workSession = {};

/**
 * Aggregates and re-exports all controllers for easy import throughout the application.
 * This allows other modules to import controllers from a single entry point.
 */
import * as cvParseController from './cv-parse'; // CV Parse controller
import * as interviewController from './interview'; // Interview controller
import * as candidateController from './candidate'; // Candidate controller
import * as authController from './auth'; // Auth controller
import * as userController from './user'; // User controller (token-protected)

export { cvParseController, interviewController, candidateController, authController, userController };

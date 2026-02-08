/**
 * Aggregates and re-exports all controllers for easy import throughout the application.
 * This allows other modules to import controllers from a single entry point.
 */
import * as cvParseController from './cv-parse'; // CV Parse controller

export { cvParseController };

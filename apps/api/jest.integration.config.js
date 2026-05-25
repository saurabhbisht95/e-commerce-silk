export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/tests/**/*.integration.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  transform: {},
  verbose: true
};

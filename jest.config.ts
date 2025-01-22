import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/*.model.ts',
    '!**/*.entity.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['../test/setup-jest.ts'],
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};

export default config;
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    // Mock CSS imports
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    // Mock image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
  transformIgnorePatterns: [
    '/node_modules/(?!bootstrap|react-bootstrap)/' // Transform bootstrap if needed
  ],
  globals: {
    'import.meta': {
      env: {
        VITE_BACKEND_URL: 'http://localhost:8000'
      }
    }
  },
  // 🔽 Estas son las líneas nuevas
  collectCoverage: true,
  coverageReporters: ['text', 'lcov']
};

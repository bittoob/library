module.exports = {
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    testEnvironment: "jsdom",
    moduleNameMapper: {
      "\\.(css|scss)$": "identity-obj-proxy",
    },
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  };
  
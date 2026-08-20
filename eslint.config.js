const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  ...expoConfig,
  eslintConfigPrettier, // Disables conflicting layout rules instead of turning them into errors
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
];

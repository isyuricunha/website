module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        "no-unused-vars": "warn",
        "no-console": "off",
        "prefer-const": "error",
        "no-var": "error",
    },
    ignorePatterns: ["public/", "resources/", "themes/", "node_modules/"],
};

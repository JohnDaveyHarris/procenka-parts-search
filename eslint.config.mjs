import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "prefer-const": "off",
      "no-unused-vars": "off",
      "no-console": "off",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
];

export default eslintConfig;

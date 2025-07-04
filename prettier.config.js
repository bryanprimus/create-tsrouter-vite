/**
 * @see https://prettier.io/docs/en/configuration.html
 * @import { Config } from "prettier";
 *
 * `prettier.config.ts` is not supported by prettier-vscode extension,
 * so we use prettier.config.js with JSDoc type annotations instead
 * @see https://github.com/prettier/prettier-vscode/issues/3623
 */
export default /** @type {const} @satisfies {Config} */ ({
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
})

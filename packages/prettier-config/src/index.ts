import type { Options as PackageJSONOptions } from '@isyuricunha/prettier-plugin-package-json'
import type { Config, Plugin } from 'prettier'
import type { PluginOptions } from 'prettier-plugin-tailwindcss'

import prettierPluginPackageJson from '@isyuricunha/prettier-plugin-package-json'
import * as prettierPluginTailwindcss from 'prettier-plugin-tailwindcss'

export type Options = Config & PluginOptions & PackageJSONOptions

const isyuricunha = (options: Options = {}): Options => {
  const { plugins = [], ...rest } = options

  return {
    arrowParens: 'always',
    singleQuote: true,
    jsxSingleQuote: true,
    tabWidth: 2,
    semi: false,
    trailingComma: 'none',
    endOfLine: 'lf',
    plugins: [
      prettierPluginPackageJson,
      ...plugins,

      prettierPluginTailwindcss as Plugin // must be loaded last
    ],
    printWidth: 100,

    // Tailwind CSS
    tailwindFunctions: ['cn', 'clsx', 'cva', 'tv'],

    ...rest
  }
}

export default isyuricunha

import globals from 'globals' //https://eslint.org/docs/latest/use/configure/language-options
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint' //https://typescript-eslint.io/getting-started/
import pluginVue from 'eslint-plugin-vue' //https://eslint.vuejs.org/user-guide/
import vueEslintParser from 'vue-eslint-parser' // vue文件解析器
import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'url'
import path from 'path'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
})
export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: vueEslintParser, // 使用vue解析器，这个可以识别vue文件
      parserOptions: {
        ecmaVersion: 'latest',
        parser: tseslint.parser, // 在vue文件上使用ts解析器
        sourceType: 'module',
      },
    },
  },

  pluginJs.configs.recommended,

  ...compat.extends('./src/auto-import/eslintrc-auto-import.json'),
  ...tseslint.configs.recommended,

  ...pluginVue.configs['flat/essential'],
  eslintPluginPrettierRecommended,
  {
    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['index'], //需要忽略的组件名
        },
      ],
      // 'vue/no-unused-vars': 'error',
      'prettier/prettier': [
        'error',
        {
          // endOfLine: "auto"
        },
      ],
      '@typescript-eslint/no-explicit-any': ['off'],
    },
  },
  {
    ignores: [
      'README.md',
      '**/dist',
      './src/main.ts',
      '.vscode',
      '.idea',
      '*.sh',
      '**/node_modules',
      '*.md',
      '*.woff',
      '*.woff',
      '*.ttf',
      'yarn.lock',
      'package-lock.json',
      '/public',
      '/docs',
      '**/output',
      '.husky',
      '.local',
      '/bin',
      'Dockerfile',
    ],
  },
]

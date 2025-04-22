import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';


export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs'
    }
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  {
    plugins: {
      '@stylistic/js': stylisticJs
    }
  },
  {
    rules: {
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/func-call-spacing': 'never',
    }
  }
]);

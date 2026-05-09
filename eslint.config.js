import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      // Internal app, not a component library — single-word names are fine.
      'vue/multi-word-component-names': 'off',
      // Vue 3 supports template fragments.
      'vue/no-multiple-template-root': 'off',
      // Surface but don't block; the API wrapper unavoidably handles unknown shapes.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);

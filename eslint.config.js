import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist', 'node_modules', 'server.ts',
      'src/app/**', 'src/middleware.ts',
      'src/hooks/useSupabase.ts',
      'src/lib/supabaseClient.ts', 'src/lib/supabaseServer.ts',
      'src/lib/seedData.ts', 'src/lib/seo/**',
      'src/components/AdminPanel.tsx',
      'src/components/ChatAssistant.tsx',
      'src/components/blog/**',
      'src/components/InternshipsPortal.tsx',
      'src/components/HackathonsPortal.tsx',
      'src/components/WelcomeHero.tsx',
      'src/components/UserDashboard.tsx',
      'src/components/ToolsDirectory.tsx',
      'src/components/Navbar.tsx',
      'src/components/Footer.tsx',
      'src/components/seo/**',
      'src/lib/resend.ts',
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/petcare-assist/' : '/',
  plugins: [
    {
      name: 'petcare-icon-alias',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('/src/main.jsx')) return null;
        return code
          .replace('Home, PawPrint', 'Home as HomeIcon, PawPrint')
          .replaceAll("[[Home,'home'", "[[HomeIcon,'home'");
      },
    },
    react(),
  ],
});

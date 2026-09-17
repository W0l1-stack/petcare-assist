import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    {
      name: 'petcare-source-fix',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('/src/main.jsx')) return null;
        return code
          .replace("Home, PawPrint", "Home as HomeIcon, PawPrint")
          .replaceAll("[Home,'home'", "[HomeIcon,'home'");
      },
    },
    react(),
  ],
});

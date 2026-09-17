import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubPagesBase = '/petcare-assist/';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? githubPagesBase : '/',
  plugins: [
    {
      name: 'petcare-source-fix',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('/src/main.jsx')) return null;

        const routing = `
const ROUTE_PATHS = { home: '/', pet: '/pet', activity: '/activity', wellness: '/wellness', rewards: '/rewards', documents: '/documents', assistant: '/assistant' };
const ROUTE_BASE = import.meta.env.BASE_URL;
function routeFromLocation() {
  let path = window.location.pathname;
  const requestedPath = new URLSearchParams(window.location.search).get('path');
  if (requestedPath && (ROUTE_BASE === '/' || path === ROUTE_BASE || path === ROUTE_BASE.slice(0, -1))) {
    path = requestedPath;
    const cleanPath = path.replace(/^\\/+/, '');
    window.history.replaceState({}, '', ROUTE_BASE + cleanPath);
  } else if (ROUTE_BASE !== '/' && path.startsWith(ROUTE_BASE)) {
    path = path.slice(ROUTE_BASE.length);
  } else if (ROUTE_BASE !== '/' && path === ROUTE_BASE.slice(0, -1)) {
    path = '';
  }
  path = path.replace(/^\\/+|\\/+$/g, '');
  return Object.entries(ROUTE_PATHS).find(([, value]) => value.replace(/^\\//, '') === path)?.[0] || 'home';
}
`;

        return routing + code
          .replace("const [state,setState]=useState(load); const [tab,setTab]=useState('home');", "const [state,setState]=useState(load); const [tab,setTab]=useState(routeFromLocation); const updateTab=setTab; const navigate=next=>{updateTab(next); const target=ROUTE_PATHS[next]||'/'; window.history.pushState({},'',`${ROUTE_BASE.replace(/\\/$/,'')}${target}`); window.scrollTo(0,0)}; useEffect(()=>{const onPop=()=>updateTab(routeFromLocation()); window.addEventListener('popstate',onPop); return()=>window.removeEventListener('popstate',onPop)},[]);")
          .replace("Home, PawPrint", "Home as HomeIcon, PawPrint")
          .replaceAll("[Home,'home'", "[HomeIcon,'home'")
          .replaceAll("setTab(", "navigate(");
      },
    },
    react(),
  ],
});

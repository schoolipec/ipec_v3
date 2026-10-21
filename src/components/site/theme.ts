export const THEME_COOKIE = 'ipec-theme';
export type Theme = 'light' | 'dark';

// Sin cookie (primera visita) se respeta la preferencia del sistema; corre antes de pintar para evitar parpadeo
export const themeBootScript = `(function(){try{if(document.cookie.indexOf('${THEME_COOKIE}=')===-1&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})();`;

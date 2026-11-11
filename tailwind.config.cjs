module.exports = {
  content: ['./*.html', './products/**/*.html', './for/**/*.html', './solutions/**/*.html', './insights/**/*.html', './assets/js/*.js', './scripts/build-product-grids.mjs'],
  darkMode: 'class',
  theme: { extend: {
    colors: { bg:'#ffffff', surface:'#ffffff', surface2:'#f5f5f5', borderc:'#d4d4d4', muted:'#404040', faint:'#737373', gold:'#0a0a0a' },
    fontFamily: { sans:['Inter','ui-sans-serif','system-ui','sans-serif'], display:['"Space Grotesk"','ui-sans-serif','system-ui','sans-serif'] },
    maxWidth: { '8xl':'90rem' }
  } }
};

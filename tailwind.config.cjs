module.exports = {
  content: ['./*.html', './products/**/*.html', './for/**/*.html', './solutions/**/*.html', './insights/**/*.html', './assets/js/*.js', './scripts/build-product-grids.mjs'],
  darkMode: 'class',
  theme: { extend: {
    colors: { bg:'#0a0a0c', surface:'#131316', surface2:'#18181c', borderc:'#27272a', muted:'#a1a1aa', faint:'#71717a', gold:'#fcd34d' },
    fontFamily: { sans:['Inter','ui-sans-serif','system-ui','sans-serif'], display:['"Space Grotesk"','ui-sans-serif','system-ui','sans-serif'] },
    maxWidth: { '8xl':'90rem' }
  } }
};

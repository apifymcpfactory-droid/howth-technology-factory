module.exports = {
  content: ['./*.html', './products/**/*.html', './for/**/*.html', './solutions/**/*.html', './insights/**/*.html', './assets/js/*.js', './scripts/build-product-grids.mjs'],
  darkMode: 'class',
  theme: { extend: {
    colors: { bg:'#f7f8fc', surface:'#ffffff', surface2:'#edf2ff', borderc:'#cbd5f5', muted:'#475569', faint:'#64748b', gold:'#1847d7' },
    fontFamily: { sans:['Inter','ui-sans-serif','system-ui','sans-serif'], display:['"Space Grotesk"','ui-sans-serif','system-ui','sans-serif'] },
    maxWidth: { '8xl':'90rem' }
  } }
};

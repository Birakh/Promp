window.PVState = {
  prompts: [],
  collections: [],
  activeVariants: {},
  activeStyle: 'clean',
  favorites: JSON.parse(localStorage.getItem('pv5-favorites') || '[]'),
  kit: JSON.parse(localStorage.getItem('pv5-kit') || '[]'),
  recent: JSON.parse(localStorage.getItem('pv5-recent') || '[]'),
  copied: JSON.parse(localStorage.getItem('pv5-copied') || '[]'),
  generatedPackage: null,
  generatedTab: 'default'
};

window.PVStorage = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

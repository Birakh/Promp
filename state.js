
window.PVState = {
  prompts: [],
  collections: [],
  activeVariants: {},
  activeStyle: 'clean',
  favorites: JSON.parse(localStorage.getItem('pv4-favorites') || '[]'),
  kit: JSON.parse(localStorage.getItem('pv4-kit') || '[]'),
  recent: JSON.parse(localStorage.getItem('pv4-recent') || '[]')
};

window.PVStorage = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

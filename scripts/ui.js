window.PVUI = {
  escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, match => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[match]));
  },

  byId(id) {
    return document.getElementById(id);
  },

  copy(text) {
    return navigator.clipboard.writeText(text);
  },

  viewUrl(extra = {}) {
    const search = new URLSearchParams();

    const searchInput = this.byId('searchInput')?.value.trim() || '';
    const category = this.byId('categorySelect')?.value || 'all';
    const model = this.byId('modelSelect')?.value || 'all';

    if (searchInput) search.set('q', searchInput);
    if (category !== 'all') search.set('category', category);
    if (model !== 'all') search.set('model', model);

    Object.entries(extra).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        search.delete(key);
      } else {
        search.set(key, value);
      }
    });

    return `${location.pathname}${search.toString() ? '?' + search.toString() : ''}`;
  },

  renderEmpty(text) {
    return `<div class="empty-state">${this.escapeHtml(text)}</div>`;
  }
};

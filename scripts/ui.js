window.PVUI = {
  escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[m]));
  },

  byId(id) {
    return document.getElementById(id);
  },

  copy(text) {
    return navigator.clipboard.writeText(text);
  },

  viewUrl(extra = {}) {
    const search = new URLSearchParams();

    const q = document.getElementById('searchInput')?.value.trim();
    const category = document.getElementById('categorySelect')?.value;
    const model = document.getElementById('modelSelect')?.value;

    if (q) search.set('q', q);
    if (category && category !== 'all') search.set('category', category);
    if (model && model !== 'all') search.set('model', model);

    Object.entries(extra).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') search.delete(k);
      else search.set(k, v);
    });

    return `${location.pathname}${search.toString() ? '?' + search.toString() : ''}`;
  },

  renderEmpty(text) {
    return `<div class="empty-state">${this.escapeHtml(text)}</div>`;
  }
};

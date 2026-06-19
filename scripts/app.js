
(async function () {
  const els = {
    collectionGrid: PVUI.byId('collectionGrid'),
    promptGrid: PVUI.byId('promptGrid'),
    previewWeak: PVUI.byId('previewWeak'),
    previewImproved: PVUI.byId('previewImproved'),
    previewWhy: PVUI.byId('previewWhy'),
    searchInput: PVUI.byId('searchInput'),
    categorySelect: PVUI.byId('categorySelect'),
    modelSelect: PVUI.byId('modelSelect'),
    copyViewButton: PVUI.byId('copyViewButton'),
    detailDialog: PVUI.byId('detailDialog'),
    detailContent: PVUI.byId('detailContent'),
    closeDialogButton: PVUI.byId('closeDialogButton'),
    kitList: PVUI.byId('kitList'),
    recentList: PVUI.byId('recentList'),
    copyBuilderButton: PVUI.byId('copyBuilderButton'),
    saveBuilderButton: PVUI.byId('saveBuilderButton'),
    styleToggles: PVUI.byId('styleToggles')
  };

  function persistFavorites() { PVStorage.save('pv4-favorites', PVState.favorites); }
  function persistKit() { PVStorage.save('pv4-kit', PVState.kit); }
  function persistRecent() { PVStorage.save('pv4-recent', PVState.recent); }

  function isFavorite(id) { return PVState.favorites.includes(id); }
  function toggleFavorite(id) {
    PVState.favorites = isFavorite(id) ? PVState.favorites.filter(x => x !== id) : [...PVState.favorites, id];
    persistFavorites();
    renderPrompts();
  }

  function addToKit(item) {
    const key = item.type + ':' + item.id;
    PVState.kit = [item, ...PVState.kit.filter(x => `${x.type}:${x.id}` !== key)].slice(0, 12);
    persistKit();
    renderKit();
  }

  function trackRecent(id) {
    PVState.recent = [id, ...PVState.recent.filter(x => x !== id)].slice(0, 8);
    persistRecent();
    renderRecent();
  }

  function getPromptById(id) { return PVState.prompts.find(p => p.id === id); }

  function activeVariantText(prompt) {
    const variant = PVState.activeVariants[prompt.id] || 'Universal';
    return prompt.variants[variant] || prompt.variants.Universal;
  }

  function applyUrlState() {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const category = params.get('category');
    const model = params.get('model');
    if (q) els.searchInput.value = q;
    if (category) els.categorySelect.value = category;
    if (model) els.modelSelect.value = model;
  }

  function updateUrl(extra = {}) {
    history.replaceState({}, '', PVUI.viewUrl(extra));
  }

  function renderPreview() {
    const prompt = getFilteredPrompts()[0] || PVState.prompts[0];
    if (!prompt) return;
    els.previewWeak.textContent = prompt.compare.weak;
    els.previewImproved.textContent = prompt.compare.improved;
    els.previewWhy.innerHTML = prompt.compare.why_better.map(item => `<span class="why-item">${PVUI.escapeHtml(item)}</span>`).join('');
  }

  function renderCollections() {
    els.collectionGrid.innerHTML = PVState.collections.map(collection => `
      <article class="collection-card">
        <p class="section-kicker">Pack</p>
        <h3>${PVUI.escapeHtml(collection.title)}</h3>
        <p>${PVUI.escapeHtml(collection.description)}</p>
        <div class="collection-list">${collection.items.map(item => `<span class="tag">${PVUI.escapeHtml(item)}</span>`).join('')}</div>
        <p><strong>Why it matters:</strong> ${PVUI.escapeHtml(collection.why_it_matters)}</p>
      </article>
    `).join('');
  }

  function getFilteredPrompts() {
    const q = els.searchInput.value.trim().toLowerCase();
    const category = els.categorySelect.value;
    const model = els.modelSelect.value;
    return PVState.prompts.filter(prompt => {
      const haystack = [prompt.title, prompt.summary, prompt.use_when, prompt.do_not_use_when, prompt.common_failure, prompt.quick_patch, prompt.category].join(' ').toLowerCase();
      const searchOk = !q || haystack.includes(q);
      const categoryOk = category === 'all' || prompt.category === category;
      const modelOk = model === 'all' || prompt.best_model === model || Object.keys(prompt.variants).includes(model);
      return searchOk && categoryOk && modelOk;
    });
  }

  function renderPrompts() {
    const prompts = getFilteredPrompts();
    if (!prompts.length) {
      els.promptGrid.innerHTML = PVUI.renderEmpty('No flagship prompts match the current filters.');
      renderPreview();
      return;
    }
    els.promptGrid.innerHTML = prompts.map(prompt => `
      <article class="prompt-card">
        <div class="prompt-head">
          <div>
            <h3 class="prompt-title">${PVUI.escapeHtml(prompt.title)}</h3>
            <p class="prompt-summary">${PVUI.escapeHtml(prompt.summary)}</p>
          </div>
          <button class="favorite ${isFavorite(prompt.id) ? 'favorite-on' : ''}" data-favorite="${prompt.id}" aria-label="Toggle favorite">${isFavorite(prompt.id) ? '★' : '☆'}</button>
        </div>
        <div class="prompt-meta">
          <span class="metric">Quality <strong>${prompt.quality_score}/20</strong></span>
          <span class="metric">Viral <strong>${prompt.viral_score}/20</strong></span>
          <span class="metric">Best <strong>${PVUI.escapeHtml(prompt.best_model)}</strong></span>
        </div>
        <div class="boundary">
          <span class="meta-label">Use when</span>
          <p>${PVUI.escapeHtml(prompt.use_when)}</p>
        </div>
        <div class="boundary warning">
          <span class="meta-label">Do not use when</span>
          <p>${PVUI.escapeHtml(prompt.do_not_use_when)}</p>
        </div>
        <div class="boundary">
          <span class="meta-label">Proof note</span>
          <p>${PVUI.escapeHtml(prompt.proof_note)}</p>
        </div>
        <div class="variant-tabs" data-variants="${prompt.id}">
          ${['Universal', 'Claude', 'Copilot', 'Gemini'].map(variant => `<button class="variant-tab ${(PVState.activeVariants[prompt.id] || 'Universal') === variant ? 'active' : ''}" data-variant="${prompt.id}" data-variant-name="${variant}">${variant}</button>`).join('')}
        </div>
        <pre class="code">${PVUI.escapeHtml(activeVariantText(prompt))}</pre>
        <div class="card-actions">
          <button class="button button-primary" data-copy="${prompt.id}">Copy prompt</button>
          <button class="button button-secondary" data-details="${prompt.id}">Compare / details</button>
          <button class="button button-secondary" data-kit="${prompt.id}">Save to kit</button>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('[data-favorite]').forEach(btn => btn.addEventListener('click', () => toggleFavorite(btn.dataset.favorite)));
    document.querySelectorAll('[data-variant]').forEach(btn => btn.addEventListener('click', () => {
      PVState.activeVariants[btn.dataset.variant] = btn.dataset.variantName;
      renderPrompts();
    }));
    document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
      const prompt = getPromptById(btn.dataset.copy);
      await PVUI.copy(activeVariantText(prompt));
      const old = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => btn.textContent = old, 900);
    }));
    document.querySelectorAll('[data-details]').forEach(btn => btn.addEventListener('click', () => openDetail(btn.dataset.details)));
    document.querySelectorAll('[data-kit]').forEach(btn => btn.addEventListener('click', () => {
      const prompt = getPromptById(btn.dataset.kit);
      addToKit({ type: 'prompt', id: prompt.id, title: prompt.title, text: activeVariantText(prompt) });
    }));

    renderPreview();
  }

  function renderKit() {
    if (!PVState.kit.length) {
      els.kitList.innerHTML = PVUI.renderEmpty('No saved prompts yet.');
      return;
    }
    els.kitList.innerHTML = PVState.kit.map(item => `<div class="kit-item">${PVUI.escapeHtml(item.title)}</div>`).join('');
  }

  function renderRecent() {
    if (!PVState.recent.length) {
      els.recentList.innerHTML = PVUI.renderEmpty('Nothing opened yet.');
      return;
    }
    els.recentList.innerHTML = PVState.recent.map(id => {
      const prompt = getPromptById(id);
      if (!prompt) return '';
      return `<button class="kit-item" data-open-recent="${prompt.id}">${PVUI.escapeHtml(prompt.title)}</button>`;
    }).join('');
    document.querySelectorAll('[data-open-recent]').forEach(btn => btn.addEventListener('click', () => openDetail(btn.dataset.openRecent)));
  }

  function openDetail(id) {
    const prompt = getPromptById(id);
    if (!prompt) return;
    trackRecent(id);
    renderRecent();
    els.detailContent.innerHTML = `
      <p class="section-kicker">Flagship prompt</p>
      <h2>${PVUI.escapeHtml(prompt.title)}</h2>
      <p>${PVUI.escapeHtml(prompt.summary)}</p>
      <div class="detail-grid detail-section">
        <div class="detail-box">
          <h3>Use when</h3>
          <p>${PVUI.escapeHtml(prompt.use_when)}</p>
        </div>
        <div class="detail-box">
          <h3>Do not use when</h3>
          <p>${PVUI.escapeHtml(prompt.do_not_use_when)}</p>
        </div>
      </div>
      <div class="compare-grid detail-section">
        <div class="detail-box">
          <h3>Weak prompt</h3>
          <pre class="code">${PVUI.escapeHtml(prompt.compare.weak)}</pre>
        </div>
        <div class="detail-box">
          <h3>Improved prompt</h3>
          <pre class="code">${PVUI.escapeHtml(prompt.compare.improved)}</pre>
        </div>
      </div>
      <div class="detail-section detail-box">
        <h3>Why it got better</h3>
        <ul class="list">${prompt.compare.why_better.map(item => `<li>${PVUI.escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div class="detail-grid detail-section">
        <div class="detail-box">
          <h3>Common failure</h3>
          <p>${PVUI.escapeHtml(prompt.common_failure)}</p>
          <p><strong>Why:</strong> ${PVUI.escapeHtml(prompt.failure_why)}</p>
        </div>
        <div class="detail-box">
          <h3>Quick patch</h3>
          <p>${PVUI.escapeHtml(prompt.quick_patch)}</p>
        </div>
      </div>
      <div class="detail-grid detail-section">
        <div class="detail-box">
          <h3>Example input</h3>
          <pre class="code">${PVUI.escapeHtml(prompt.example.input)}</pre>
        </div>
        <div class="detail-box">
          <h3>Expected output shape</h3>
          <pre class="code">${PVUI.escapeHtml(prompt.example.output)}</pre>
        </div>
      </div>
      <div class="detail-section detail-box">
        <h3>Model variants</h3>
        <div class="variant-tabs">${['Universal', 'Claude', 'Copilot', 'Gemini'].map(variant => `<button class="variant-tab detail-variant ${(PVState.activeVariants[prompt.id] || 'Universal') === variant ? 'active' : ''}" data-detail-variant="${prompt.id}" data-detail-variant-name="${variant}">${variant}</button>`).join('')}</div>
        <pre class="code" id="detailVariantCode">${PVUI.escapeHtml(activeVariantText(prompt))}</pre>
      </div>
      <div class="detail-section detail-box">
        <h3>Proof note</h3>
        <p>${PVUI.escapeHtml(prompt.proof_note)}</p>
      </div>
    `;
    els.detailDialog.showModal();
    updateUrl({ prompt: prompt.id });
    document.querySelectorAll('[data-detail-variant]').forEach(btn => btn.addEventListener('click', () => {
      PVState.activeVariants[btn.dataset.detailVariant] = btn.dataset.detailVariantName;
      openDetail(btn.dataset.detailVariant);
    }));
  }

  els.closeDialogButton.addEventListener('click', () => { els.detailDialog.close(); updateUrl({ prompt: null }); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && els.detailDialog.open) { els.detailDialog.close(); updateUrl({ prompt: null }); } });

  [els.searchInput, els.categorySelect, els.modelSelect].forEach(el => el.addEventListener('input', () => { renderPrompts(); updateUrl(); }));
  els.copyViewButton.addEventListener('click', async () => {
    updateUrl();
    await PVUI.copy(location.href);
    const old = els.copyViewButton.textContent;
    els.copyViewButton.textContent = 'View link copied ✓';
    setTimeout(() => els.copyViewButton.textContent = old, 900);
  });
  els.copyBuilderButton.addEventListener('click', async () => {
    await PVUI.copy(PVUI.byId('builderOutput').textContent);
    const old = els.copyBuilderButton.textContent;
    els.copyBuilderButton.textContent = 'Copied ✓';
    setTimeout(() => els.copyBuilderButton.textContent = old, 900);
  });
  els.saveBuilderButton.addEventListener('click', () => {
    addToKit({ type: 'builder', id: 'builder-' + Date.now(), title: 'Saved image builder prompt', text: PVUI.byId('builderOutput').textContent });
  });
  els.styleToggles.addEventListener('click', e => {
    const chip = e.target.closest('[data-style]');
    if (!chip) return;
    PVState.activeStyle = chip.dataset.style;
    document.querySelectorAll('#styleToggles .chip').forEach(x => x.classList.toggle('chip-active', x.dataset.style === PVState.activeStyle));
    PVLab.build();
  });

  const [promptsRes, collectionsRes] = await Promise.all([fetch('data/prompts.json'), fetch('data/collections.json')]);
  PVState.prompts = await promptsRes.json();
  PVState.collections = await collectionsRes.json();
  PVState.prompts.forEach(prompt => { if (!PVState.activeVariants[prompt.id]) PVState.activeVariants[prompt.id] = 'Universal'; });
  applyUrlState();
  renderCollections();
  PVLab.renderFields();
  PVLab.build();
  renderKit();
  renderRecent();
  renderPrompts();

  const params = new URLSearchParams(location.search);
  const openPrompt = params.get('prompt');
  if (openPrompt) openDetail(openPrompt);
})();

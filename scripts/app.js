(async function () {
  const els = {
    collectionGrid: PVUI.byId });    collectionGrid: PVUI.byId('collectionGrid'),
      });
    });

    document.querySelectorAll('[data-open-card]').forEach(card => {
      card.addEventListener('click', event => {
        if (event.target.closest('button')) return;
        openDetail(card.dataset.openCard);
      });
    });
  }

  function renderKit() {
    if (!PVState.kit.length) {
      els.kitList.innerHTML = PVUI.renderEmpty('No saved prompts yet.');
      return;
    }

    els.kitList.innerHTML = PVState.kit.map(item => `
      <div class="kit-item">${PVUI.escapeHtml(item.title)}</div>
    `).join('');
  }

  function renderRecent() {
    if (!PVState.recent.length) {
      els.recentList.innerHTML = PVUI.renderEmpty('Nothing opened yet.');
      return;
    }

    els.recentList.innerHTML = PVState.recent.map(id => {
      const prompt = getPromptById(id);
      if (!prompt) return '';

      return `
        <button class="kit-item" data-open-recent="${prompt.id}" type="button">
          ${PVUI.escapeHtml(prompt.title)}
        </button>
      `;
    }).join('');

    document.querySelectorAll('[data-open-recent]').forEach(button => {
      button.addEventListener('click', () => openDetail(button.dataset.openRecent));
    });
  }

  function renderCopied() {
    if (!PVState.copied.length) {
      els.copiedList.innerHTML = PVUI.renderEmpty('Nothing copied yet.');
      return;
    }

    els.copiedList.innerHTML = PVState.copied.map(title => `
      <div class="kit-item">${PVUI.escapeHtml(title)}</div>
    `).join('');
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
        <ul class="list">
          ${prompt.compare.why_better.map(item => `<li>${PVUI.escapeHtml(item)}</li>`).join('')}
        </ul>
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
        <div class="variant-tabs">
          ${['Universal', 'Claude', 'Copilot', 'Gemini'].map(variant => `
            <button
              class="variant-tab detail-variant ${(PVState.activeVariants[prompt.id] || 'Universal') === variant ? 'active' : ''}"
              data-detail-variant="${prompt.id}"
              data-detail-variant-name="${variant}"
              type="button"
            >
              ${variant}
            </button>
          `).join('')}
        </div>
        <pre class="code">${PVUI.escapeHtml(activeVariantText(prompt))}</pre>
      </div>

      <div class="detail-section detail-box">
        <h3>Proof note</h3>
        <p>${PVUI.escapeHtml(prompt.proof_note)}</p>
      </div>
    `;

    els.detailDialog.showModal();
    updateUrl({ prompt: prompt.id });

    document.querySelectorAll('[data-detail-variant]').forEach(button => {
      button.addEventListener('click', () => {
        PVState.activeVariants[button.dataset.detailVariant] = button.dataset.detailVariantName;
        openDetail(button.dataset.detailVariant);
      });
    });
  }

  function buildPromptPackage(taskType, rawIdea) {
    const cleaned = rawIdea.trim();
    if (!cleaned) return null;

    if (taskType === 'image') {
      return {
        bestModel: 'Gemini',
        whyModel: 'Best on Gemini because spatial and sensory phrasing usually improves image ideation.',
        whyItWorks: 'Better image prompts control composition, light, material realism, and exclusions instead of relying on vague style adjectives.',
        changes: [
          'Added one clear visual objective',
          'Forced scene, lighting, and material detail',
          'Removed vague wording and generic visual noise'
        ],
        default: `Create one premium image for the following idea:\n\n${cleaned}\n\nRequirements:\n- one dominant focal point\n- clear scene or environment\n- controlled lighting\n- tactile material detail\n- deliberate color palette\n- avoid clutter, stock-photo feel, muddy lighting, duplicate objects\n\nReturn:\n1) final image prompt\n2) short negative prompt\n3) one-line caption`,
        power: `Act as a creative director and image prompt engineer. Turn this rough idea into one strong visual concept:\n\n${cleaned}\n\nRequirements:\n- one hero subject only\n- one composition hierarchy only\n- one intended audience reaction\n- define scene, shot type, lighting behavior, material realism, palette, and exclusions\n- prefer one unmistakable concept over multiple weak ideas\n\nReturn:\nA) final image prompt\nB) negative prompt\nC) 3 optional style shifts`,
        minimal: `Turn this idea into one clean, strong image prompt with a clear focal point, defined lighting, controlled palette, and no clutter:\n\n${cleaned}`
      };
    }

    if (taskType === 'email') {
      return {
        bestModel: 'Copilot',
        whyModel: 'Best on Copilot because work-task formatting and action-oriented outputs matter most here.',
        whyItWorks: 'Good rewrite prompts preserve the real ask, remove emotional drag, and rebuild the message around action and consequence.',
        changes: [
          'Clarified the actual request',
          'Removed defensiveness and repetition',
          'Forced a cleaner structure'
        ],
        default: `Rewrite the draft or idea below into a calm, concise, professional email:\n\n${cleaned}\n\nRequirements:\n- preserve the real intent\n- make the ask obvious\n- remove vagueness, repetition, and emotional spillover\n- keep the tone competent and human\n\nReturn:\nA) polished version\nB) shorter version\nC) 3 subject lines`,
        power: `Act as an executive communications editor. Turn the draft or idea below into a calm, action-ready email:\n\n${cleaned}\n\nPriorities:\n1) preserve intent\n2) clarify the actual ask\n3) remove emotional drag\n4) improve structure and readability\n5) maintain a professional but human tone\n\nReturn:\nA) polished version\nB) shorter version\nC) ultra-short version\nD) 3 subject lines\nE) one sentence explaining the real ask`,
        minimal: `Rewrite this into a concise professional email with a clear ask and no defensiveness:\n\n${cleaned}`
      };
    }

    if (taskType === 'workflow') {
      return {
        bestModel: 'Copilot',
        whyModel: 'Best on Copilot because workflow problems benefit from ranked issues, checklists, and practical future-state outputs.',
        whyItWorks: 'Workflow prompts improve when they separate structural failure from interpersonal friction and force ranked, usable outputs.',
        changes: [
          'Turned vague frustration into diagnosable process logic',
          'Forced ranked issues instead of generic improvement ideas',
          'Added ownership, timing, and implementation structure'
        ],
        default: `Analyze the workflow or process below and improve it:\n\n${cleaned}\n\nReturn:\n1) current-state diagnosis\n2) top issues ranked by impact\n3) improved workflow step by step\n4) quick wins\n5) checklist or tracker fields\n6) implementation risks`,
        power: `Act as an operations strategist and process designer. Analyze the workflow below and turn it into a more reliable system:\n\n${cleaned}\n\nRequirements:\n- distinguish structural problems from interpersonal problems\n- identify bottlenecks, duplicate effort, missing ownership, handoff failures, and delay sources\n- rank issues by impact\n- design a cleaner future-state workflow\n- include checklist fields, tracking, and risk controls\n\nReturn:\nA) diagnosis\nB) ranked issues\nC) structural vs interpersonal split\nD) future-state workflow\nE) quick wins\nF) implementation risks`,
        minimal: `Analyze this workflow, rank the biggest issues, and propose a cleaner future-state process:\n\n${cleaned}`
      };
    }

    if (taskType === 'research') {
      return {
        bestModel: 'Claude',
        whyModel: 'Best on Claude because this task depends on reasoning quality, uncertainty handling, and nuanced synthesis.',
        whyItWorks: 'Research prompts become useful when they optimize for decision pressure, not completeness.',
        changes: [
          'Defined a core question instead of broad summary',
          'Separated knowns from unknowns',
          'Forced trade-offs and recommendation'
        ],
        default: `Build a decision-oriented research synthesis about the following topic or question:\n\n${cleaned}\n\nReturn:\n1) core question\n2) subquestions\n3) knowns\n4) unknowns or contested points\n5) trade-offs\n6) implications\n7) recommendation\n8) confidence note`,
        power: `Act as a lead research analyst producing a decision memo on the topic below:\n\n${cleaned}\n\nRequirements:\n- define the core question\n- derive the minimum subquestions needed to answer it\n- separate high-confidence findings from thin-evidence claims\n- identify trade-offs and disagreement points\n- explain implications\n- end with recommendation, confidence note, and one thing that could change the conclusion\n\nReturn exactly:\nA) core question\nB) subquestions\nC) knowns\nD) unknowns\nE) trade-offs\nF) implications\nG) recommendation\nH) confidence note\nI) what would change the conclusion`,
        minimal: `Build a decision-oriented research synthesis on this topic and return core question, knowns, unknowns, trade-offs, recommendation, and confidence note:\n\n${cleaned}`
      };
    }

    return null;
  }

  function renderGeneratedPackage() {
    const pkg = PVState.generatedPackage;

    if (!pkg) {
      launcherEls.generatedPromptOutput.textContent = '';
      launcherEls.generatedModelFit.textContent = '—';
      launcherEls.generatedChanges.innerHTML = '';
      launcherEls.generatedWhyItWorks.textContent = '—';
      return;
    }

    launcherEls.generatedModelFit.textContent = `${pkg.bestModel} — ${pkg.whyModel}`;

    const tab = PVState.generatedTab;
    const text =
      tab === 'power' ? pkg.power :
      tab === 'minimal' ? pkg.minimal :
      pkg.default;

    launcherEls.generatedPromptOutput.textContent = text;
    launcherEls.generatedChanges.innerHTML = pkg.changes
      .map(item => `<li>${PVUI.escapeHtml(item)}</li>`)
      .join('');
    launcherEls.generatedWhyItWorks.textContent = pkg.whyItWorks;
  }

  function bindLauncher() {
    document.querySelectorAll('.output-tab').forEach(button => {
      button.addEventListener('click', () => {
        PVState.generatedTab = button.dataset.outputTab;

        document.querySelectorAll('.output-tab').forEach(tab => {
          tab.classList.toggle('active', tab.dataset.outputTab === PVState.generatedTab);
        });

        renderGeneratedPackage();
      });
    });

    launcherEls.generatePackageButton.addEventListener('click', () => {
      const rawIdea = launcherEls.rawIdeaInput.value.trim();
      const taskType = launcherEls.taskTypeSelect.value;

      if (!rawIdea) return;

      PVState.generatedPackage = buildPromptPackage(taskType, rawIdea);
      PVState.generatedTab = 'default';

      document.querySelectorAll('.output-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.outputTab === 'default');
      });

      renderGeneratedPackage();
    });

    launcherEls.clearPackageButton.addEventListener('click', () => {
      launcherEls.rawIdeaInput.value = '';
      PVState.generatedPackage = null;
      renderGeneratedPackage();
    });

    launcherEls.copyGeneratedButton.addEventListener('click', async () => {
      if (!PVState.generatedPackage) return;
      await PVUI.copy(launcherEls.generatedPromptOutput.textContent);
      trackCopy('Generated prompt package');
    });

    launcherEls.copyForChatGPTButton.addEventListener('click', async () => {
      if (!PVState.generatedPackage) return;
      await PVUI.copy(launcherEls.generatedPromptOutput.textContent);
      trackCopy('Copied for ChatGPT');
    });

    launcherEls.copyForCopilotButton.addEventListener('click', async () => {
      if (!PVState.generatedPackage) return;
      await PVUI.copy(launcherEls.generatedPromptOutput.textContent);
      trackCopy('Copied for Copilot');
    });
  }

  els.closeDialogButton.addEventListener('click', () => {
    els.detailDialog.close();
    updateUrl({ prompt: null });
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && els.detailDialog.open) {
      els.detailDialog.close();
      updateUrl({ prompt: null });
    }
  });

  [els.searchInput, els.categorySelect, els.modelSelect].forEach(element => {
    element.addEventListener('input', () => {
      renderPrompts();
      updateUrl();
    });
  });

  els.copyViewButton.addEventListener('click', async () => {
    updateUrl();
    await PVUI.copy(location.href);

    const old = els.copyViewButton.textContent;
    els.copyViewButton.textContent = 'View link copied ✓';
    setTimeout(() => els.copyViewButton.textContent = old, 900);
  });

  els.copyBuilderButton.addEventListener('click', async () => {
    await PVUI.copy(PVUI.byId('builderOutput').textContent);
    trackCopy('Image builder prompt');

    const old = els.copyBuilderButton.textContent;
    els.copyBuilderButton.textContent = 'Copied ✓';
    setTimeout(() => els.copyBuilderButton.textContent = old, 900);
  });

  els.saveBuilderButton.addEventListener('click', () => {
    addToKit({
      type: 'builder',
      id: 'builder-' + Date.now(),
      title: 'Saved image builder prompt',
      text: PVUI.byId('builderOutput').textContent
    });
  });

  els.styleToggles.addEventListener('click', event => {
    const chip = event.target.closest('[data-style]');
    if (!chip) return;

    PVState.activeStyle = chip.dataset.style;

    document.querySelectorAll('#styleToggles .chip').forEach(item => {
      item.classList.toggle('chip-active', item.dataset.style === PVState.activeStyle);
    });

    PVLab.build();
  });

  const [promptsRes, collectionsRes] = await Promise.all([
    fetch('data/prompts.json'),
    fetch('data/collections.json')
  ]);

  PVState.prompts = await promptsRes.json();
  PVState.collections = await collectionsRes.json();

  PVState.prompts.forEach(prompt => {
    if (!PVState.activeVariants[prompt.id]) {
      PVState.activeVariants[prompt.id] = 'Universal';
    }
  });

  applyUrlState();
  renderCollections();
  PVLab.renderFields();
  PVLab.build();
  renderKit();
  renderRecent();
  renderCopied();
  renderPrompts();
  bindLauncher();
})();
    promptGrid: PVUI.byId('promptGrid'),

    searchInput: PVUI.byId('searchInput'),
    categorySelect: PVUI.byId('categorySelect'),
    modelSelect: PVUI.byId('modelSelect'),
    copyViewButton: PVUI.byId('copyViewButton'),

    detailDialog: PVUI.byId('detailDialog'),
    detailContent: PVUI.byId('detailContent'),
    closeDialogButton: PVUI.byId('closeDialogButton'),

    kitList: PVUI.byId('kitList'),
    recentList: PVUI.byId('recentList'),
    copiedList: PVUI.byId('copiedList'),

    copyBuilderButton: PVUI.byId('copyBuilderButton'),
    saveBuilderButton: PVUI.byId('saveBuilderButton'),
    styleToggles: PVUI.byId('styleToggles')
  };

  const launcherEls = {
    rawIdeaInput: PVUI.byId('rawIdeaInput'),
    taskTypeSelect: PVUI.byId('taskTypeSelect'),
    generatePackageButton: PVUI.byId('generatePackageButton'),
    clearPackageButton: PVUI.byId('clearPackageButton'),

    generatedPromptOutput: PVUI.byId('generatedPromptOutput'),
    generatedModelFit: PVUI.byId('generatedModelFit'),
    generatedChanges: PVUI.byId('generatedChanges'),
    generatedWhyItWorks: PVUI.byId('generatedWhyItWorks'),

    copyGeneratedButton: PVUI.byId('copyGeneratedButton'),
    copyForChatGPTButton: PVUI.byId('copyForChatGPTButton'),
    copyForCopilotButton: PVUI.byId('copyForCopilotButton')
  };

  function persistAll() {
    PVStorage.save('pv5-favorites', PVState.favorites);
    PVStorage.save('pv5-kit', PVState.kit);
    PVStorage.save('pv5-recent', PVState.recent);
    PVStorage.save('pv5-copied', PVState.copied);
  }

  function isFavorite(id) {
    return PVState.favorites.includes(id);
  }

  function toggleFavorite(id) {
    PVState.favorites = isFavorite(id)
      ? PVState.favorites.filter(item => item !== id)
      : [...PVState.favorites, id];

    persistAll();
    renderPrompts();
  }

  function addToKit(item) {
    const key = `${item.type}:${item.id}`;
    PVState.kit = [
      item,
      ...PVState.kit.filter(existing => `${existing.type}:${existing.id}` !== key)
    ].slice(0, 12);

    persistAll();
    renderKit();
  }

  function trackRecent(id) {
    PVState.recent = [id, ...PVState.recent.filter(item => item !== id)].slice(0, 8);
    persistAll();
    renderRecent();
  }

  function trackCopy(title) {
    PVState.copied = [title, ...PVState.copied.filter(item => item !== title)].slice(0, 8);
    persistAll();
    renderCopied();
  }

  function getPromptById(id) {
    return PVState.prompts.find(prompt => prompt.id === id);
  }

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

  function renderCollections() {
    els.collectionGrid.innerHTML = PVState.collections.map(collection => `
      <article class="collection-card collection-clickable" data-collection="${collection.id}">
        <p class="section-kicker">Pack</p>
        <h3>${PVUI.escapeHtml(collection.title)}</h3>
        <p>${PVUI.escapeHtml(collection.description)}</p>
        <div class="collection-list">
          ${collection.items.map(item => `<span class="tag">${PVUI.escapeHtml(item)}</span>`).join('')}
        </div>
        <p><strong>Why it matters:</strong> ${PVUI.escapeHtml(collection.why_it_matters)}</p>
      </article>
    `).join('');

    document.querySelectorAll('[data-collection]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.collection;

        if (id === 'viral-image-pack') {
          els.categorySelect.value = 'image';
        }

        if (id === 'operator-pack') {
          els.categorySelect.value = 'work';
        }

        if (id === 'thinking-pack') {
          els.categorySelect.value = 'thinking';
        }

        renderPrompts();
        document.querySelector('.prompt-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function getFilteredPrompts() {
    const q = els.searchInput.value.trim().toLowerCase();
    const category = els.categorySelect.value;
    const model = els.modelSelect.value;

    return PVState.prompts.filter(prompt => {
      const haystack = [
        prompt.title,
        prompt.summary,
        prompt.use_when,
        prompt.do_not_use_when,
        prompt.common_failure,
        prompt.quick_patch,
        prompt.category
      ].join(' ').toLowerCase();

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
      return;
    }

    els.promptGrid.innerHTML = prompts.map(prompt => `
      <article class="prompt-card prompt-clickable" data-open-card="${prompt.id}">
        <div class="prompt-head">
          <div>
            <h3 class="prompt-title">${PVUI.escapeHtml(prompt.title)}</h3>
            <p class="prompt-summary">${PVUI.escapeHtml(prompt.summary)}</p>
          </div>

          <button
            class="favorite ${isFavorite(prompt.id) ? 'favorite-on' : ''}"
            data-favorite="${prompt.id}"
            aria-label="Toggle favorite"
            type="button"
          >
            ${isFavorite(prompt.id) ? '★' : '☆'}
          </button>
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

        <div class="variant-tabs">
          ${['Universal', 'Claude', 'Copilot', 'Gemini'].map(variant => `
            <button
              class="variant-tab ${(PVState.activeVariants[prompt.id] || 'Universal') === variant ? 'active' : ''}"
              data-variant="${prompt.id}"
              data-variant-name="${variant}"
              type="button"
            >
              ${variant}
            </button>
          `).join('')}
        </div>

        <pre class="code">${PVUI.escapeHtml(activeVariantText(prompt))}</pre>

        <div class="card-actions">
          <button class="button button-primary" data-copy="${prompt.id}" type="button">Copy prompt</button>
          <button class="button button-secondary" data-details="${prompt.id}" type="button">Compare / details</button>
          <button class="button button-secondary" data-kit="${prompt.id}" type="button">Save to kit</button>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('[data-favorite]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        toggleFavorite(button.dataset.favorite);
      });
    });

    document.querySelectorAll('[data-variant]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        PVState.activeVariants[button.dataset.variant] = button.dataset.variantName;
        renderPrompts();
      });
    });

    document.querySelectorAll('[data-copy]').forEach(button => {
      button.addEventListener('click', async event => {
        event.stopPropagation();

        const prompt = getPromptById(button.dataset.copy);
        await PVUI.copy(activeVariantText(prompt));

        trackCopy(prompt.title);

        const old = button.textContent;
        button.textContent = 'Copied ✓';
        setTimeout(() => button.textContent = old, 900);
      });
    });

    document.querySelectorAll('[data-details]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        openDetail(button.dataset.details);
      });
    });

    document.querySelectorAll('[data-kit]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();

        const prompt = getPromptById(button.dataset.kit);

        addToKit({
          type: 'prompt',
          id: prompt.id,
          title: prompt.title,
          text: activeVariantText(prompt)

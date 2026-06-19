(async function(){
const els={collectionGrid:PVUI.byId('collectionGrid'),promptGrid:PVUI.byId('promptGrid'),searchInput:PVUI.byId('searchInput'),categorySelect:PVUI.byId('categorySelect'),modelSelect:PVUI.byId('modelSelect'),copyViewButton:PVUI.byId('copyViewButton'),detailDialog:PVUI.byId('detailDialog'),detailContent:PVUI.byId('detailContent'),closeDialogButton:PVUI.byId('closeDialogButton'),kitList:PVUI.byId('kitList'),recentList:PVUI.byId('recentList'),copiedList:PVUI.byId('copiedList'),copyBuilderButton:PVUI.byId('copyBuilderButton'),saveBuilderButton:PVUI.byId('saveBuilderButton'),styleToggles:PVUI.byId('styleToggles')};
const launcherEls={rawIdeaInput:PVUI.byId('rawIdeaInput'),taskTypeSelect:PVUI.byId('taskTypeSelect'),generatePackageButton:PVUI.byId('generatePackageButton'),clearPackageButton:PVUI.byId('clearPackageButton'),generatedPromptOutput:PVUI.byId('generatedPromptOutput'),generatedModelFit:PVUI.byId('generatedModelFit'),generatedChanges:PVUI.byId('generatedChanges'),generatedWhyItWorks:PVUI.byId('generatedWhyItWorks'),copyGeneratedButton:PVUI.byId('copyGeneratedButton'),copyForChatGPTButton:PVUI.byId('copyForChatGPTButton'),copyForCopilotButton:PVUI.byId('copyForCopilotButton')};
function persist(){PVStorage.save('pv5-favorites',PVState.favorites);PVStorage.save('pv5-kit',PVState.kit);PVStorage.save('pv5-recent',PVState.recent);PVStorage.save('pv5-copied',PVState.copied)}
const isFavorite=id=>PVState.favorites.includes(id); const getPromptById=id=>PVState.prompts.find(p=>p.id===id); const activeVariantText=p=>(p.variants[PVState.activeVariants[p.id]||'Universal']||p.variants.Universal);
function toggleFavorite(id){PVState.favorites=isFavorite(id)?PVState.favorites.filter(x=>x!==id):[...PVState.favorites,id];persist();renderPrompts()} function addToKit(item){const k=`${item.type}:${item.id}`;PVState.kit=[item,...PVState.kit.filter(x=>`${x.type}:${x.id}`!==k)].slice(0,12);persist();renderKit()} function trackRecent(id){PVState.recent=[id,...PVState.recent.filter(x=>x!==id)].slice(0,8);persist();renderRecent()} function trackCopy(t){PVState.copied=[t,...PVState.copied.filter(x=>x!==t)].slice(0,8);persist();renderCopied()}
function renderCollections(){els.collectionGrid.innerHTML=PVState.collections.map(c=>`<article class="collection-card"><p class="section-kicker">Pack</p><h3>${PVUI.escapeHtml(c.title)}</h3><p>${PVUI.escapeHtml(c.description)}</p><div class="collection-list">${c.items.map(i=>`<span class="tag">${PVUI.escapeHtml(i)}</span>`).join('')}</div><p><strong>Why it matters:</strong> ${PVUI.escapeHtml(c.why_it_matters)}</p></article>`).join('')}
function getFilteredPrompts(){const q=els.searchInput.value.trim().toLowerCase();const c=els.categorySelect.value;const m=els.modelSelect.value;return PVState.prompts.filter(p=>{const hay=[p.title,p.summary,p.use_when,p.do_not_use_when,p.rare_insight,p.model_fit_note,p.category].join(' ').toLowerCase();return(!q||hay.includes(q))&&(c==='all'||p.category===c)&&(m==='all'||p.best_model===m||Object.keys(p.variants).includes(m))})}
function renderPrompts(){const prompts=getFilteredPrompts();if(!prompts.length){els.promptGrid.innerHTML=PVUI.renderEmpty('No flagship prompts match the current filters.');return;}els.promptGrid.innerHTML=prompts.map(p=>`<article class="prompt-card"><div class="prompt-head"><div><h3 class="prompt-title">${PVUI.escapeHtml(p.title)}</h3><p class="prompt-summary">${PVUI.escapeHtml(p.summary)}</p></div><button class="favorite ${isFavorite(p.id)?'favorite-on':''}" data-favorite="${p.id}" type="button">${isFavorite(p.id)?'★':'☆'}</button></div><div class="prompt-meta"><span class="metric">Quality <strong>${p.quality_score}/20</strong></span><span class="metric">Viral <strong>${p.viral_score}/20</strong></span><span class="metric">Best <strong>${PVUI.escapeHtml(p.best_model)}</strong></span></div><div class="variant-tabs">${['Universal','Claude','Copilot','Gemini'].map(v=>`<button class="variant-tab ${(PVState.activeVariants[p.id]||'Universal')===v?'active':''}" data-variant="${p.id}" data-variant-name="${v}" type="button">${v}</button>`).join('')}</div><pre class="code">${PVUI.escapeHtml(activeVariantText(p))}</pre><div class="card-actions"><button class="button button-primary" data-copy="${p.id}" type="button">Copy best default</button><button class="button button-secondary" data-details="${p.id}" type="button">See breakdown</button><button class="button button-secondary" data-kit="${p.id}" type="button">Save to kit</button></div></article>`).join('');document.querySelectorAll('[data-favorite]').forEach(b=>b.addEventListener('click',()=>toggleFavorite(b.dataset.favorite)));document.querySelectorAll('[data-variant]').forEach(b=>b.addEventListener('click',()=>{PVState.activeVariants[b.dataset.variant]=b.dataset.variantName;renderPrompts()}));document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const p=getPromptById(b.dataset.copy);await PVUI.copy(activeVariantText(p));trackCopy(p.title);const old=b.textContent;b.textContent='Copied ✓';setTimeout(()=>b.textContent=old,900)}));document.querySelectorAll('[data-details]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.details)));document.querySelectorAll('[data-kit]').forEach(b=>b.addEventListener('click',()=>{const p=getPromptById(b.dataset.kit);addToKit({type:'prompt',id:p.id,title:p.title,text:activeVariantText(p)})}))}
function renderKit(){els.kitList.innerHTML=PVState.kit.length?PVState.kit.map(i=>`<div class="kit-item">${PVUI.escapeHtml(i.title)}</div>`).join(''):PVUI.renderEmpty('No saved prompts yet.')} function renderRecent(){els.recentList.innerHTML=PVState.recent.length?PVState.recent.map(id=>{const p=getPromptById(id);return p?`<button class="kit-item" data-open-recent="${p.id}" type="button">${PVUI.escapeHtml(p.title)}</button>`:''}).join(''):PVUI.renderEmpty('Nothing opened yet.');document.querySelectorAll('[data-open-recent]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.openRecent)))} function renderCopied(){els.copiedList.innerHTML=PVState.copied.length?PVState.copied.map(t=>`<div class="kit-item">${PVUI.escapeHtml(t)}</div>`).join(''):PVUI.renderEmpty('Nothing copied yet.')}
function openDetail(id){const p=getPromptById(id);if(!p)return;trackRecent(id);renderRecent();els.detailContent.innerHTML=`<p class="section-kicker">Flagship prompt</p><h2>${PVUI.escapeHtml(p.title)}</h2><p>${PVUI.escapeHtml(p.summary)}</p><div class="boundary"><span class="meta-label">Rare insight</span><p>${PVUI.escapeHtml(p.rare_insight)}</p></div><div class="detail-grid"><div class="detail-box"><h3>Use when</h3><p>${PVUI.escapeHtml(p.use_when)}</p></div><div class="detail-box"><h3>Do not use when</h3><p>${PVUI.escapeHtml(p.do_not_use_when)}</p></div></div><div class="detail-box"><h3>Why this model</h3><p>${PVUI.escapeHtml(p.model_fit_note)}</p></div><div class="detail-grid"><div class="detail-box"><h3>Weak prompt</h3><pre class="code">${PVUI.escapeHtml(p.compare.weak)}</pre></div><div class="detail-box"><h3>Improved prompt</h3><pre class="code">${PVUI.escapeHtml(p.compare.improved)}</pre></div></div><div class="detail-box"><h3>Why it got better</h3><ul class="list">${p.compare.why_better.map(i=>`<li>${PVUI.escapeHtml(i)}</li>`).join('')}</ul></div><div class="detail-grid"><div class="detail-box"><h3>Common failure</h3><p>${PVUI.escapeHtml(p.common_failure)}</p><p><strong>Why:</strong> ${PVUI.escapeHtml(p.failure_why)}</p></div><div class="detail-box"><h3>Quick patch</h3><p>${PVUI.escapeHtml(p.quick_patch)}</p></div></div><div class="detail-grid"><div class="detail-box"><h3>Example input</h3><pre class="code">${PVUI.escapeHtml(p.example.input)}</pre></div><div class="detail-box"><h3>Expected output</h3><pre class="code">${PVUI.escapeHtml(p.example.output)}</pre></div></div><div class="detail-box"><h3>Prompt tiers</h3><div class="detail-grid"><div><h4>${PVUI.escapeHtml(p.tier_labels.default)}</h4><pre class="code">${PVUI.escapeHtml(p.default_prompt)}</pre></div><div><h4>${PVUI.escapeHtml(p.tier_labels.power)}</h4><pre class="code">${PVUI.escapeHtml(p.power_prompt)}</pre></div></div><div><h4>${PVUI.escapeHtml(p.tier_labels.minimal)}</h4><pre class="code">${PVUI.escapeHtml(p.minimal_prompt)}</pre></div></div><div class="detail-box"><h3>Model variants</h3><div class="variant-tabs">${['Universal','Claude','Copilot','Gemini'].map(v=>`<button class="variant-tab detail-variant ${(PVState.activeVariants[p.id]||'Universal')===v?'active':''}" data-detail-variant="${p.id}" data-detail-variant-name="${v}" type="button">${v}</button>`).join('')}</div><pre class="code">${PVUI.escapeHtml(activeVariantText(p))}</pre></div><div class="detail-box"><h3>Key improvements</h3><ul class="list">${p.key_improvements.map(i=>`<li>${PVUI.escapeHtml(i)}</li>`).join('')}</ul></div>`;els.detailDialog.showModal();document.querySelectorAll('[data-detail-variant]').forEach(b=>b.addEventListener('click',()=>{PVState.activeVariants[b.dataset.detailVariant]=b.dataset.detailVariantName;openDetail(b.dataset.detailVariant)}))}
function buildPackage(type,raw){if(!raw.trim())return null; if(type==='image') return {bestModel:'Gemini',whyModel:'Best on Gemini because spatial and sensory phrasing usually improves image ideation.',whyItWorks:'Better image prompts control composition, light, material realism, and exclusions instead of relying on vague style adjectives.',changes:['Added one clear visual objective','Forced scene, lighting, and material detail','Removed vague wording and generic visual noise'],default:`Create one premium image for the following idea:

${raw}

Requirements:
- one dominant focal point
- clear scene or environment
- controlled lighting
- tactile material detail
- deliberate color palette
- avoid clutter and stock-photo feel

Return:
1) final image prompt
2) short negative prompt
3) one-line caption`,power:`Act as a creative director and image prompt engineer. Turn this rough idea into one strong visual concept:

${raw}

Requirements:
- one hero subject only
- one composition hierarchy only
- one intended audience reaction
- define scene, shot type, lighting behavior, material realism, palette, and exclusions

Return:
A) final image prompt
B) negative prompt
C) 3 optional style shifts`,minimal:`Turn this idea into one clean, strong image prompt with a clear focal point and no clutter:

${raw}`}; if(type==='email') return {bestModel:'Copilot',whyModel:'Best on Copilot because work-task formatting and action-oriented outputs matter most here.',whyItWorks:'Good rewrite prompts preserve the real ask, remove emotional drag, and rebuild the message around action and consequence.',changes:['Clarified the actual request','Removed defensiveness and repetition','Forced a cleaner structure'],default:`Rewrite the draft or idea below into a calm, concise, professional email:

${raw}

Requirements:
- preserve the real intent
- make the ask obvious
- remove vagueness, repetition, and emotional spillover

Return:
A) polished version
B) shorter version
C) 3 subject lines`,power:`Act as an executive communications editor. Turn the draft or idea below into a calm, action-ready email:

${raw}

Priorities:
1) preserve intent
2) clarify the actual ask
3) remove emotional drag
4) improve structure`,minimal:`Rewrite this into a concise professional email with a clear ask:

${raw}`}; if(type==='workflow') return {bestModel:'Copilot',whyModel:'Best on Copilot because workflow problems benefit from ranked issues and future-state outputs.',whyItWorks:'Workflow prompts improve when they separate structural failure from interpersonal friction and force ranked, usable outputs.',changes:['Turned vague frustration into diagnosable process logic','Forced ranked issues','Added ownership and timing structure'],default:`Analyze the workflow or process below and improve it:

${raw}

Return:
1) current-state diagnosis
2) top issues ranked by impact
3) improved workflow step by step
4) quick wins
5) checklist or tracker fields
6) implementation risks`,power:`Act as an operations strategist and process designer. Analyze the workflow below and turn it into a more reliable system:

${raw}

Requirements:
- distinguish structural problems from interpersonal problems
- identify bottlenecks, missed ownership, handoff failures, and delay sources
- rank issues by impact`,minimal:`Analyze this workflow, rank the biggest issues, and propose a cleaner future-state process:

${raw}`}; return {bestModel:'Claude',whyModel:'Best on Claude because this task depends on reasoning quality and uncertainty handling.',whyItWorks:'Research prompts become useful when they optimize for decision pressure, not completeness.',changes:['Defined a core question','Separated knowns from unknowns','Forced trade-offs and recommendation'],default:`Build a decision-oriented research synthesis about the following topic or question:

${raw}

Return:
1) core question
2) subquestions
3) knowns
4) unknowns
5) trade-offs
6) implications
7) recommendation
8) confidence note`,power:`Act as a lead research analyst producing a decision memo on the topic below:

${raw}

Requirements:
- define the core question
- derive the minimum subquestions
- separate high-confidence findings from thin-evidence claims
- identify trade-offs and disagreement points`,minimal:`Build a decision-oriented research synthesis on this topic and return core question, knowns, unknowns, trade-offs, recommendation, and confidence note:

${raw}`}}
function renderGeneratedPackage(){const pkg=PVState.generatedPackage;if(!pkg){launcherEls.generatedPromptOutput.textContent='';launcherEls.generatedModelFit.textContent='—';launcherEls.generatedChanges.innerHTML='';launcherEls.generatedWhyItWorks.textContent='—';return;} launcherEls.generatedModelFit.textContent=`${pkg.bestModel} — ${pkg.whyModel}`;const tab=PVState.generatedTab;const text=tab==='power'?pkg.power:tab==='minimal'?pkg.minimal:pkg.default;launcherEls.generatedPromptOutput.textContent=text;launcherEls.generatedChanges.innerHTML=pkg.changes.map(i=>`<li>${PVUI.escapeHtml(i)}</li>`).join('');launcherEls.generatedWhyItWorks.textContent=pkg.whyItWorks}
function bindLauncher(){document.querySelectorAll('.output-tab').forEach(btn=>btn.addEventListener('click',()=>{PVState.generatedTab=btn.dataset.outputTab;document.querySelectorAll('.output-tab').forEach(x=>x.classList.toggle('active',x.dataset.outputTab===PVState.generatedTab));renderGeneratedPackage()}));launcherEls.generatePackageButton.addEventListener('click',()=>{const raw=launcherEls.rawIdeaInput.value.trim();if(!raw)return;PVState.generatedPackage=buildPackage(launcherEls.taskTypeSelect.value,raw);PVState.generatedTab='default';document.querySelectorAll('.output-tab').forEach(x=>x.classList.toggle('active',x.dataset.outputTab==='default'));renderGeneratedPackage()});launcherEls.clearPackageButton.addEventListener('click',()=>{launcherEls.rawIdeaInput.value='';PVState.generatedPackage=null;renderGeneratedPackage()});launcherEls.copyGeneratedButton.addEventListener('click',async()=>{if(!PVState.generatedPackage)return;await PVUI.copy(launcherEls.generatedPromptOutput.textContent);trackCopy('Generated prompt package')});launcherEls.copyForChatGPTButton.addEventListener('click',async()=>{if(!PVState.generatedPackage)return;await PVUI.copy(launcherEls.generatedPromptOutput.textContent);trackCopy('Copied for ChatGPT')});launcherEls.copyForCopilotButton.addEventListener('click',async()=>{if(!PVState.generatedPackage)return;await PVUI.copy(launcherEls.generatedPromptOutput.textContent);trackCopy('Copied for Copilot')})}
els.closeDialogButton.addEventListener('click',()=>els.detailDialog.close());[els.searchInput,els.categorySelect,els.modelSelect].forEach(el=>el.addEventListener('input',renderPrompts));els.copyViewButton.addEventListener('click',async()=>{await PVUI.copy(location.href);const old=els.copyViewButton.textContent;els.copyViewButton.textContent='View link copied ✓';setTimeout(()=>els.copyViewButton.textContent=old,900)});els.copyBuilderButton.addEventListener('click',async()=>{await PVUI.copy(PVUI.byId('builderOutput').textContent);trackCopy('Image builder prompt')});els.saveBuilderButton.addEventListener('click',()=>addToKit({type:'builder',id:'builder-'+Date.now(),title:'Saved image builder prompt',text:PVUI.byId('builderOutput').textContent}));els.styleToggles.addEventListener('click',e=>{const chip=e.target.closest('[data-style]');if(!chip)return;PVState.activeStyle=chip.dataset.style;document.querySelectorAll('#styleToggles .chip').forEach(x=>x.classList.toggle('chip-active',x.dataset.style===PVState.activeStyle));PVLab.build()});
const [pr,cr]=await Promise.all([fetch('data/prompts.json'),fetch('data/collections.json')]);PVState.prompts=await pr.json();PVState.collections=await cr.json();PVState.prompts.forEach(p=>{if(!PVState.activeVariants[p.id])PVState.activeVariants[p.id]='Universal'});renderCollections();PVLab.renderFields();PVLab.build();renderKit();renderRecent();renderCopied();renderPrompts();bindLauncher();})();
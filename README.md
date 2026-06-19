<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prompt Vault V4 — Better prompts, not prompt wallpaper</title>
  <meta name="description" content="Model-aware prompt systems for Claude, Copilot, and Gemini — with compare cards, examples, and a fast image builder." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/main.css" />
</head>
<body>
  <div class="shell">
    <header class="hero">
      <p class="eyebrow">Static • fast • free • model-aware</p>
      <h1>Better prompts, not prompt wallpaper</h1>
      <p class="hero-copy">Model-aware prompt systems for Claude, Copilot, and Gemini — with compare cards, examples, and copy-ready collections.</p>
      <p class="hero-sub">Built to be useful fast. Static, free, and disciplined.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#collections">Browse collections</a>
        <a class="button button-secondary" href="#compare-preview">Open compare mode</a>
        <a class="button button-secondary" href="#builder">Try the image builder</a>
      </div>
    </header>

    <section class="difference">
      <article class="mini-card">
        <h2>Proof &gt; claims</h2>
        <p>Each flagship prompt includes weak vs improved, usage boundaries, failure modes, and example output shape.</p>
      </article>
      <article class="mini-card">
        <h2>Collections &gt; chaos</h2>
        <p>Three curated packs instead of a bloated prompt cemetery.</p>
      </article>
      <article class="mini-card">
        <h2>Model-aware</h2>
        <p>Universal prompts plus Claude, Copilot, and Gemini variants where it actually matters.</p>
      </article>
    </section>

    <section id="collections" class="section">
      <div class="section-head">
        <div>
          <p class="section-kicker">Collections</p>
          <h2>Three focused packs. No filler.</h2>
        </div>
      </div>
      <div id="collectionGrid" class="collection-grid"></div>
    </section>

    <section id="compare-preview" class="section compare-preview">
      <div class="section-head">
        <div>
          <p class="section-kicker">Compare mode</p>
          <h2>See exactly why a stronger prompt works better.</h2>
        </div>
      </div>
      <div class="compare-frame">
        <div class="compare-column">
          <p class="compare-label">Weak</p>
          <pre id="previewWeak" class="code"></pre>
        </div>
        <div class="compare-column">
          <p class="compare-label">Improved</p>
          <pre id="previewImproved" class="code"></pre>
        </div>
      </div>
      <div id="previewWhy" class="why-list"></div>
    </section>

    <section class="section toolbar-section">
      <div class="toolbar">
        <label>
          <span>Search</span>
          <input id="searchInput" type="search" placeholder="Search the six flagship prompts" />
        </label>
        <label>
          <span>Category</span>
          <select id="categorySelect">
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="work">Work</option>
            <option value="thinking">Thinking</option>
          </select>
        </label>
        <label>
          <span>Model</span>
          <select id="modelSelect">
            <option value="all">All</option>
            <option value="Claude">Claude</option>
            <option value="Copilot">Copilot</option>
            <option value="Gemini">Gemini</option>
          </select>
        </label>
        <button id="copyViewButton" class="button button-secondary toolbar-button">Copy view link</button>
      </div>
    </section>

    <section class="main-grid">
      <section class="section prompt-section">
        <div class="section-head">
          <div>
            <p class="section-kicker">Flagship prompts</p>
            <h2>Six prompts that actually earn their place.</h2>
          </div>
        </div>
        <div id="promptGrid" class="prompt-grid"></div>
      </section>

      <aside class="side-panel">
        <section id="builder" class="builder-card">
          <p class="section-kicker">Image builder</p>
          <h2>Build an image prompt in under a minute.</h2>
          <div id="builderFields" class="builder-fields"></div>
          <div class="builder-style-row" id="styleToggles">
            <button class="chip chip-active" data-style="clean">Clean</button>
            <button class="chip" data-style="gritty">Gritty</button>
            <button class="chip" data-style="cinematic">Cinematic</button>
          </div>
          <pre id="builderOutput" class="code builder-output"></pre>
          <div class="builder-actions">
            <button id="copyBuilderButton" class="button button-primary">Copy prompt</button>
            <button id="saveBuilderButton" class="button button-secondary">Save to local kit</button>
          </div>
        </section>

        <section class="kit-card">
          <p class="section-kicker">Local kit</p>
          <h2>Saved prompts</h2>
          <div id="kitList" class="kit-list"></div>
        </section>

        <section class="kit-card">
          <p class="section-kicker">Recent</p>
          <h2>Recently opened</h2>
          <div id="recentList" class="kit-list"></div>
        </section>
      </aside>
    </section>
  </div>

  <dialog id="detailDialog" class="dialog">
    <div class="dialog-inner">
      <button id="closeDialogButton" class="dialog-close" aria-label="Close">×</button>
      <div id="detailContent"></div>
    </div>
  </dialog>

  <script src="scripts/state.js"></script>
  <script src="scripts/ui.js"></script>
  <script src="scripts/lab.js"></script>
  <script src="scripts/app.js"></script>
</body>
</html>

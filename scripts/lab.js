window.PVLab = {
  fields: [
    ['subject', 'Subject', 'e.g. matte black fragrance bottle'],
    ['scene', 'Scene', 'e.g. wet basalt slab'],
    ['reaction', 'Audience reaction', 'e.g. elite + mysterious'],
    ['lighting', 'Lighting', 'e.g. hard flash + amber rim light'],
    ['lens', 'Lens / framing', 'e.g. macro lens, tight crop'],
    ['texture', 'Texture emphasis', 'e.g. condensation, controlled reflections'],
    ['palette', 'Palette', 'e.g. charcoal, silver, amber'],
    ['exclusions', 'Exclusions', 'e.g. clutter, muddy lighting, text artifacts']
  ],

  renderFields() {
    const container = PVUI.byId('builderFields');
    container.innerHTML = this.fields.map(([key, label, placeholder]) => `
      <label>
        <span class="meta-label">${label}</span>
        <input data-builder-key="${key}" placeholder="${placeholder}" />
      </label>
    `).join('');

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.build());
    });
  },

  styleSuffix(style) {
    if (style === 'gritty') {
      return 'Add slight grit, edge, and tactile imperfection while preserving a clean focal hierarchy.';
    }
    if (style === 'cinematic') {
      return 'Increase depth, atmosphere, and film-still intensity with disciplined lighting and mood.';
    }
    return 'Keep the output controlled, premium, and visually clean.';
  },

  build() {
    const values = {};
    document.querySelectorAll('[data-builder-key]').forEach(input => {
      values[input.dataset.builderKey] = input.value.trim();
    });

    const style = PVState.activeStyle;

    const output = `You are a creative director and image prompt engineer.

Create one hero image for ${values.subject || '[subject]'}.

Scene: ${values.scene || '[scene]'}
Desired audience reaction: ${values.reaction || '[reaction]'}
Lighting: ${values.lighting || '[lighting]'}
Lens / framing: ${values.lens || '[lens]'}
Texture emphasis: ${values.texture || '[texture]'}
Palette: ${values.palette || '[palette]'}
Exclusions: ${values.exclusions || '[exclusions]'}

Style mode: ${style}
${this.styleSuffix(style)}

Return:
1) final image prompt
2) short negative prompt
3) one-line social caption`;

    PVUI.byId('builderOutput').textContent = output;
    return output;
  }
};

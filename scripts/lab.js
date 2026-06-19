window.PVLab={fields:[['subject','Subject','e.g. matte black fragrance bottle'],['scene','Scene','e.g. wet basalt slab'],['reaction','Audience reaction','e.g. elite + mysterious'],['lighting','Lighting','e.g. hard flash + amber rim light'],['lens','Lens / framing','e.g. macro lens, tight crop'],['texture','Texture emphasis','e.g. condensation, controlled reflections'],['palette','Palette','e.g. charcoal, silver, amber'],['exclusions','Exclusions','e.g. clutter, muddy lighting, text artifacts']],renderFields(){const c=PVUI.byId('builderFields');c.innerHTML=this.fields.map(([k,l,p])=>`<label><span>${l}</span><input data-builder-key="${k}" placeholder="${p}"></label>`).join('');c.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>this.build()))},styleSuffix(s){if(s==='gritty')return 'Add slight grit and tactile imperfection.';if(s==='cinematic')return 'Increase depth, atmosphere, and film-still intensity.';return 'Keep the output controlled and visually clean.'},build(){const v={};document.querySelectorAll('[data-builder-key]').forEach(i=>v[i.dataset.builderKey]=i.value.trim());const s=PVState.activeStyle;const text=`You are a creative director and image prompt engineer.

Create one hero image for ${v.subject||'[subject]'}.

Scene: ${v.scene||'[scene]'}
Desired audience reaction: ${v.reaction||'[reaction]'}
Lighting: ${v.lighting||'[lighting]'}
Lens / framing: ${v.lens||'[lens]'}
Texture emphasis: ${v.texture||'[texture]'}
Palette: ${v.palette||'[palette]'}
Exclusions: ${v.exclusions||'[exclusions]'}

Style mode: ${s}
${this.styleSuffix(s)}

Return:
1) final image prompt
2) short negative prompt
3) one-line social caption`;PVUI.byId('builderOutput').textContent=text;return text}};
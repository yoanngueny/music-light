// remove 'submitFrame' in WebGLRenderer render function
// remove 'return' (isPresenting) in WebGLRenderer setSize function
// add 'if (pass instanceof RenderPass == false) this.renderer.vr.enabled = false;' before 'pass.render'
// then after 'if (pass instanceof RenderPass == false) this.renderer.vr.enabled = true;' in EffectComposer

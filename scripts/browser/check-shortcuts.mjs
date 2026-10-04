import assert from 'node:assert/strict';

export async function verifyShortcutEditingContracts(page) {
  const results = await page.evaluate(async (root) => {
    const { isZdpTextEntryTarget, shouldZdpIgnoreShortcutEvent } = await import(`/@fs/${root}/src/lib/shortcuts.ts`);
    const surface = document.createElement('div');
    surface.innerHTML = `
      <div contenteditable="true"><span id="inherited">Text</span><span contenteditable="false"><span id="readonly-island">Static</span></span></div>
      <div contenteditable="plaintext-only" id="plaintext">Text</div>
      <div contenteditable="PLAINTEXT-ONLY" id="uppercase">Text</div>
      <input id="native-input">
      <div role="textbox" id="aria-textbox"></div>
      <div id="static"></div>
    `;
    document.body.append(surface);
    const results = [];
    const record = (event) => results.push({
      ignore: shouldZdpIgnoreShortcutEvent(event),
      allowEditing: shouldZdpIgnoreShortcutEvent(event, { allowTextEntryTarget: true })
    });
    document.addEventListener('keydown', record);
    try {
      for (const id of ['inherited', 'readonly-island', 'plaintext', 'uppercase', 'native-input', 'aria-textbox', 'static']) {
        surface.querySelector(`#${id}`).dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
      }
      const shadowHost = document.createElement('div');
      surface.append(shadowHost);
      const shadow = shadowHost.attachShadow({ mode: 'open' });
      const shadowInput = document.createElement('input');
      shadow.append(shadowInput);
      shadowInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true, composed: true }));
      const iframe = document.createElement('iframe');
      surface.append(iframe);
      const input = iframe.contentDocument.createElement('input');
      iframe.contentDocument.body.append(input);
      const adopted = document.createElement('div');
      adopted.innerHTML = `
        <input id="adopted-input">
        <div contenteditable="plaintext-only"><span id="adopted-editor">Text</span><span contenteditable="false" id="adopted-readonly">Static</span></div>
      `;
      iframe.contentDocument.body.append(adopted);
      const frameEvents = [];
      const recordFrame = (event) => frameEvents.push({
        ignore: shouldZdpIgnoreShortcutEvent(event),
        allowEditing: shouldZdpIgnoreShortcutEvent(event, { allowTextEntryTarget: true })
      });
      iframe.contentDocument.addEventListener('keydown', recordFrame);
      try {
        for (const id of ['adopted-input', 'adopted-editor', 'adopted-readonly']) {
          adopted.querySelector(`#${id}`).dispatchEvent(new iframe.contentWindow.KeyboardEvent('keydown', { key: 'n', bubbles: true }));
        }
        return {
          events: results, frameEvents,
          adoptedHasFrameConstructor: adopted instanceof iframe.contentWindow.HTMLElement,
          iframeInput: isZdpTextEntryTarget(input), nonElement: isZdpTextEntryTarget(document)
        };
      } finally {
        iframe.contentDocument.removeEventListener('keydown', recordFrame);
      }
    } finally {
      document.removeEventListener('keydown', record);
      surface.remove();
    }
  }, process.cwd().replaceAll('\\', '/'));
  assert.deepEqual(results.events.map((event) => event.ignore), [true, false, true, true, true, true, false, true]);
  assert.ok(results.events.every((event) => !event.allowEditing), 'Consumers may explicitly allow shortcuts during editing.');
  assert.equal(results.adoptedHasFrameConstructor, false, 'The fixture must exercise adoption across realms.');
  assert.deepEqual(results.frameEvents.map((event) => event.ignore), [true, true, false]);
  assert.ok(results.frameEvents.every((event) => !event.allowEditing));
  assert.equal(results.iframeInput, true);
  assert.equal(results.nonElement, false);
}

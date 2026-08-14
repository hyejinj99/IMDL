/* Research-note attachment extension for the static MVP.
   Small files are stored as data URLs in localStorage with the note. */
(() => {
  const MAX_FILES = 3;
  const MAX_BYTES = 750 * 1024;
  let draftAttachments = [];

  const style = document.createElement('style');
  style.textContent = `
    .attachment-box{border:1px solid #e5eaf0;border-radius:12px;padding:14px;background:#fbfcfe}
    .attachment-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .attachment-title{font-weight:800}.attachment-help{font-size:11px;color:#6e7a8a;line-height:1.45}
    .file-pick{display:inline-flex;align-items:center;gap:7px;border:1px solid #cfd8e6;background:#fff;color:#2f5bd3;border-radius:9px;padding:8px 11px;font-weight:700;cursor:pointer}
    .file-pick input{display:none}.attachment-list{display:grid;gap:8px;margin-top:10px}
    .attachment-item{border:1px solid #e1e6ed;background:#fff;border-radius:10px;padding:10px}
    .attachment-row{display:flex;align-items:center;gap:10px}.attachment-icon{font-size:20px}.attachment-info{min-width:0;flex:1}
    .attachment-name{font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.attachment-meta{font-size:11px;color:#7b8694;margin-top:2px}
    .attachment-actions{display:flex;gap:5px;flex-wrap:wrap}.attachment-actions button,.attachment-actions a{border:0;background:#eef3ff;color:#3159bf;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none}
    .attachment-actions .remove-file{background:#fff0ef;color:#b64743}.attachment-preview{display:none;margin-top:9px;padding-top:9px;border-top:1px solid #edf0f4}
    .attachment-preview.open{display:block}.attachment-preview pre{white-space:pre-wrap;max-height:200px;overflow:auto;background:#f6f8fb;padding:10px;border-radius:8px;font-size:12px;line-height:1.5;margin:0}
    .attachment-preview img{max-width:100%;max-height:260px;border-radius:8px;display:block}.attachment-preview iframe{width:100%;height:260px;border:1px solid #e4e8ee;border-radius:8px;background:white}
    .note-attachment-badge{display:inline-block;margin-top:9px;font-size:11px;color:#53627a;background:#f0f3f7;padding:4px 7px;border-radius:999px}
  `;
  document.head.appendChild(style);

  const noteForm = document.querySelector('#noteDialog form');
  const actions = noteForm?.querySelector('.dialog-actions');
  if (!noteForm || !actions) return;

  const box = document.createElement('div');
  box.className = 'attachment-box';
  box.innerHTML = `
    <div class="attachment-head">
      <div>
        <div class="attachment-title">📎 파일 첨부</div>
        <div class="attachment-help">.md, .txt, 이미지, PDF 등 · 최대 ${MAX_FILES}개 · 파일당 750KB</div>
      </div>
      <label class="file-pick">＋ 파일 선택<input id="noteFileInput" type="file" multiple></label>
    </div>
    <div class="attachment-help">Markdown(.md)과 텍스트(.txt)는 미리보기 후 <strong>본문으로 불러오기</strong>가 가능합니다.</div>
    <div id="attachmentList" class="attachment-list"></div>
  `;
  noteForm.insertBefore(box, actions);

  const input = document.querySelector('#noteFileInput');
  const list = document.querySelector('#attachmentList');

  function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }
  function extension(name='') { return name.split('.').pop().toLowerCase(); }
  function isText(a) { return ['md','markdown','txt','csv','json','log','r','py','js','html','css'].includes(extension(a.name)) || (a.type || '').startsWith('text/'); }
  function icon(a) {
    const ext = extension(a.name);
    if ((a.type || '').startsWith('image/')) return '🖼️';
    if (ext === 'pdf' || a.type === 'application/pdf') return '📕';
    if (['md','markdown'].includes(ext)) return 'Ⓜ️';
    if (isText(a)) return '📄';
    if (['ppt','pptx'].includes(ext)) return '📊';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx','csv'].includes(ext)) return '📈';
    return '📎';
  }
  function dataUrlToText(dataUrl) {
    try {
      const encoded = dataUrl.split(',')[1] || '';
      const binary = atob(encoded);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch { return ''; }
  }
  function renderAttachments() {
    list.innerHTML = draftAttachments.map((a, i) => {
      const text = isText(a) ? dataUrlToText(a.data) : '';
      let preview = '<div class="attachment-help">이 파일 형식은 브라우저 미리보기를 지원하지 않습니다.</div>';
      if ((a.type || '').startsWith('image/')) preview = `<img src="${a.data}" alt="${escapeHtml(a.name)}">`;
      else if (a.type === 'application/pdf' || extension(a.name) === 'pdf') preview = `<iframe src="${a.data}" title="${escapeHtml(a.name)}"></iframe>`;
      else if (isText(a)) preview = `<pre>${escapeHtml(text.slice(0,10000))}</pre>`;
      return `<div class="attachment-item" data-attachment-index="${i}">
        <div class="attachment-row">
          <div class="attachment-icon">${icon(a)}</div>
          <div class="attachment-info"><div class="attachment-name">${escapeHtml(a.name)}</div><div class="attachment-meta">${formatBytes(a.size)} · ${escapeHtml(a.type || '파일')}</div></div>
          <div class="attachment-actions">
            <button type="button" class="preview-file">미리보기</button>
            ${isText(a) ? '<button type="button" class="import-file">본문으로 불러오기</button>' : ''}
            <a href="${a.data}" download="${escapeHtml(a.name)}">열기</a>
            <button type="button" class="remove-file">삭제</button>
          </div>
        </div>
        <div class="attachment-preview">${preview}</div>
      </div>`;
    }).join('');

    list.querySelectorAll('.attachment-item').forEach(item => {
      const i = Number(item.dataset.attachmentIndex);
      item.querySelector('.preview-file').onclick = () => item.querySelector('.attachment-preview').classList.toggle('open');
      const importBtn = item.querySelector('.import-file');
      if (importBtn) importBtn.onclick = () => {
        const text = dataUrlToText(draftAttachments[i].data);
        const body = document.querySelector('#noteBody');
        const separator = body.value.trim() ? '\n\n' : '';
        body.value += `${separator}${text}`;
        body.focus();
      };
      item.querySelector('.remove-file').onclick = () => {
        draftAttachments.splice(i, 1);
        renderAttachments();
      };
    });
  }

  input.addEventListener('change', async () => {
    const files = [...input.files];
    input.value = '';
    for (const file of files) {
      if (draftAttachments.length >= MAX_FILES) { alert(`첨부 파일은 최대 ${MAX_FILES}개까지 가능합니다.`); break; }
      if (file.size > MAX_BYTES) { alert(`${file.name}: 현재 MVP에서는 파일당 750KB까지만 저장할 수 있습니다.`); continue; }
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      draftAttachments.push({ id: String(Date.now()) + Math.random().toString(16).slice(2), name:file.name, type:file.type, size:file.size, data });
    }
    renderAttachments();
  });

  // Extend the existing note editor so saved attachments reappear when editing.
  const originalOpenNoteDialog = openNoteDialog;
  openNoteDialog = function(id = null) {
    originalOpenNoteDialog(id);
    if (id) {
      const note = researchNotes.find(n => Number(n.id) === Number(id));
      draftAttachments = (note?.attachments || []).map(a => ({...a}));
    } else {
      draftAttachments = [];
    }
    renderAttachments();
  };

  // Replace note save handler to persist attachments together with the note.
  document.querySelector('#saveNoteBtn').onclick = e => {
    const title = document.querySelector('#noteTitle').value.trim();
    const body = document.querySelector('#noteBody').value.trim();
    if (!title || !body) { e.preventDefault(); return; }
    const id = Number(document.querySelector('#noteId').value) || null;
    const today = new Date().toISOString().slice(0,10);
    const folderId = document.querySelector('#noteFolder').value || null;
    const visibility = document.querySelector('#noteVisibility').value;
    const attachments = draftAttachments.map(a => ({...a}));
    if (id) {
      const n = researchNotes.find(x => Number(x.id) === Number(id));
      if (n && n.author === currentUser.name) Object.assign(n,{folderId,title,body,visibility,attachments,updated:today});
    } else {
      researchNotes.unshift({id:uid(),folderId,title,body,visibility,attachments,author:currentUser.name,date:today,updated:today});
    }
    try { saveNotes(); }
    catch (err) {
      e.preventDefault();
      alert('브라우저 저장공간이 부족합니다. 첨부 파일 크기나 개수를 줄여주세요.');
      return;
    }
    setTimeout(() => {
      noteScope='mine'; selectedFolderId='all';
      document.querySelectorAll('.note-tab').forEach(x=>x.classList.toggle('active',x.dataset.noteScope==='mine'));
      renderFolders(); renderNotes(); enhanceNoteCards();
    },20);
  };

  // Add attachment count to research-note cards without changing the main renderer.
  function enhanceNoteCards() {
    const cards = [...document.querySelectorAll('#notesList .note-card')];
    let data = researchNotes.filter(n => noteScope === 'mine' ? n.author === currentUser.name : n.visibility === 'public');
    if (selectedFolderId !== 'all') {
      const ids = descendants(selectedFolderId);
      data = data.filter(n => n.folderId && ids.includes(String(n.folderId)));
    }
    data.sort((a,b)=>b.updated.localeCompare(a.updated));
    cards.forEach((card,i) => {
      const count = data[i]?.attachments?.length || 0;
      if (!count) return;
      const title = card.querySelector('h3');
      if (title && !card.querySelector('.note-attachment-badge')) title.insertAdjacentHTML('afterend', `<span class="note-attachment-badge">📎 첨부 ${count}개</span>`);
    });
  }

  const originalRenderNotes = renderNotes;
  renderNotes = function() { originalRenderNotes(); enhanceNoteCards(); };
})();

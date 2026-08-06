// Database Structure nitialization (Local Storage Persistence)
let state = JSON.parse(localStorage.getItem('fm_state')) || {
    currentFolderId: 'root',
    folders: [
        { id: 'root', name: 'Root', parentId: null }
    ],
    files: [],
    notes: []
};

let activeFileId = null;
let contextMenuOpen = null;

// Initialize Lucide Icons
lucide.createIcons();

// Save state helper
function saveState() {
    localStorage.setItem('fm_state', JSON.stringify(state));
}

// Extension to Icon & Color Mapper
function getFileTypeDetails(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js': return { icon: 'code-2', color: '#f7df1e' };
        case 'py': return { icon: 'terminal', color: '#3776ab' };
        case 'html': return { icon: 'file-code', color: '#e34f26' };
        case 'css': return { icon: 'palette', color: '#1572b6' };
        case 'json': return { icon: 'file-json', color: '#000000' };
        case 'zip': return { icon: 'file-archive', color: '#eab308' };
        case 'png':
        case 'jpg': return { icon: 'image', color: '#ec4899' };
        default: return { icon: 'file-text', color: '#9ca3af' };
    }
}

// Render Core UI components
function renderWorkspace() {
    const grid = document.getElementById('file-grid');
    grid.innerHTML = '';

    // Render Folders
    const subFolders = state.folders.filter(f => f.parentId === state.currentFolderId);
    subFolders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-top">
                <i data-lucide="folder" class="file-icon" style="color: #6366f1"></i>
                <button class="btn-icon context-btn" data-id="${folder.id}" data-type="folder"><i data-lucide="more-vertical"></i></button>
            </div>
            <div>
                <div class="card-title">${folder.name}</div>
                <div class="card-meta">Folder</div>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.context-btn')) {
                state.currentFolderId = folder.id;
                renderWorkspace();
                renderBreadcrumbs();
            }
        });
        grid.appendChild(card);
    });

    // Render Files
    const currentFiles = state.files.filter(f => f.folderId === state.currentFolderId);
    currentFiles.forEach(file => {
        const details = getFileTypeDetails(file.name);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-top">
                <i data-lucide="${details.icon}" class="file-icon" style="color: ${details.color}"></i>
                <button class="btn-icon context-btn" data-id="${file.id}" data-type="file"><i data-lucide="more-vertical"></i></button>
            </div>
            <div>
                <div class="card-title">${file.name}</div>
                <div class="card-meta">${file.lines || 0} lines</div>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.context-btn')) {
                if (file.name.endsWith('.zip')) {
                    openZipViewer(file);
                } else {
                    openEditor(file.id);
                }
            }
        });
        grid.appendChild(card);
    });

    lucide.createIcons();
    attachContextMenuListeners();
}

// Breadcrumbs Navigation Generator
function renderBreadcrumbs() {
    const breadcrumbs = document.getElementById('breadcrumbs');
    breadcrumbs.innerHTML = '';
    
    let chain = [];
    let curr = state.folders.find(f => f.id === state.currentFolderId);
    while (curr) {
        chain.unshift(curr);
        curr = state.folders.find(f => f.id === curr.parentId);
    }

    chain.forEach((folder, idx) => {
        const span = document.createElement('span');
        span.className = 'crumb';
        span.innerText = folder.name;
        span.onclick = () => {
            state.currentFolderId = folder.id;
            renderWorkspace();
            renderBreadcrumbs();
        };
        breadcrumbs.appendChild(span);

        if (idx < chain.length - 1) {
            const separator = document.createElement('span');
            separator.innerText = ' / ';
            breadcrumbs.appendChild(separator);
        }
    });
}

// Editor Functionality & Dynamic Line Counter
const editorArea = document.getElementById('file-editor-textarea');
const lineNumbers = document.getElementById('line-numbers');

editorArea.addEventListener('input', updateLineNumbers);
editorArea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editorArea.scrollTop;
});

function updateLineNumbers() {
    const lines = editorArea.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
}

function openEditor(fileId) {
    activeFileId = fileId;
    const file = state.files.find(f => f.id === fileId);
    
    document.getElementById('editor-file-name').value = file.name;
    editorArea.value = file.content || '';
    
    document.getElementById('workspace-view').classList.add('hidden');
    document.getElementById('editor-view').classList.remove('hidden');
    
    updateLineNumbers();
}

document.getElementById('btn-close-editor').onclick = () => {
    document.getElementById('editor-view').classList.add('hidden');
    document.getElementById('workspace-view').classList.remove('hidden');
    renderWorkspace();
};

document.getElementById('btn-save-file').onclick = () => {
    const file = state.files.find(f => f.id === activeFileId);
    if (file) {
        file.name = document.getElementById('editor-file-name').value;
        file.content = editorArea.value;
        file.lines = editorArea.value.split('\n').length;
        saveState();
        showModal('Success', 'File saved successfully!', false);
    }
};

document.getElementById('btn-clear-editor').onclick = () => {
    showModal('Clear Editor', 'Are you sure you want to clear all contents?', true, () => {
        editorArea.value = '';
        updateLineNumbers();
    });
};

document.getElementById('font-style-select').onchange = (e) => {
    editorArea.className = e.target.value;
};

// ZIP Archive Reader Engine
function openZipViewer(file) {
    document.getElementById('workspace-view').classList.add('hidden');
    const zipView = document.getElementById('zip-view');
    zipView.classList.remove('hidden');
    document.getElementById('zip-file-name').innerText = file.name;

    const zipContentDiv = document.getElementById('zip-contents');
    zipContentDiv.innerHTML = 'Loading archive content...';

    JSZip.loadAsync(file.rawBase64 || file.content).then(zip => {
        zipContentDiv.innerHTML = '';
        zip.forEach((relativePath, zipEntry) => {
            const item = document.createElement('div');
            item.className = 'zip-item';
            item.innerHTML = `<i data-lucide="${zipEntry.dir ? 'folder' : 'file'}"></i> <span>${relativePath}</span>`;
            zipContentDiv.appendChild(item);
        });
        lucide.createIcons();
    }).catch(() => {
        zipContentDiv.innerHTML = 'Unable to preview ZIP file contents (Invalid or raw format).';
    });
}

document.getElementById('btn-close-zip').onclick = () => {
    document.getElementById('zip-view').classList.add('hidden');
    document.getElementById('workspace-view').classList.remove('hidden');
};

// Creation & File Upload Handlers
document.getElementById('btn-create-folder').onclick = () => {
    promptModal('New Folder', 'Enter folder name:', (name) => {
        if (name) {
            state.folders.push({ id: 'f_' + Date.now(), name: name, parentId: state.currentFolderId });
            saveState();
            renderWorkspace();
        }
    });
};

document.getElementById('btn-create-file').onclick = () => {
    promptModal('New File', 'Enter file name (e.g., script.js):', (name) => {
        if (name) {
            const newFile = { id: 'file_' + Date.now(), name: name, content: '', lines: 1, folderId: state.currentFolderId };
            state.files.push(newFile);
            saveState();
            renderWorkspace();
            openEditor(newFile.id);
        }
    });
};

document.getElementById('file-upload-input').onchange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            state.files.push({
                id: 'file_' + Date.now() + Math.random(),
                name: file.name,
                content: evt.target.result,
                lines: evt.target.result.split('\n').length,
                folderId: state.currentFolderId
            });
            saveState();
            renderWorkspace();
        };
        reader.readAsText(file);
    });
};

// Context Menu (Options) Event Handlers
function attachContextMenuListeners() {
    document.querySelectorAll('.context-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            
            removeContextMenus();

            const menu = document.createElement('div');
            menu.className = 'menu-dropdown';
            menu.innerHTML = `
                <button class="menu-item" id="opt-rename"><i data-lucide="edit-3"></i> Rename</button>
                <button class="menu-item" id="opt-delete" style="color:var(--danger)"><i data-lucide="trash-2"></i> Delete</button>
            `;

            btn.parentElement.appendChild(menu);
            lucide.createIcons();

            document.getElementById('opt-rename').onclick = () => {
                promptModal('Rename', 'Enter new name:', (newName) => {
                    if (newName) {
                        if (type === 'folder') state.folders.find(f => f.id === id).name = newName;
                        else state.files.find(f => f.id === id).name = newName;
                        saveState();
                        renderWorkspace();
                    }
                });
            };

            document.getElementById('opt-delete').onclick = () => {
                showModal('Confirm Delete', 'Are you sure you want to delete this item?', true, () => {
                    if (type === 'folder') state.folders = state.folders.filter(f => f.id !== id);
                    else state.files = state.files.filter(f => f.id !== id);
                    saveState();
                    renderWorkspace();
                });
            };
        };
    });
}

function removeContextMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.remove());
}
window.onclick = () => removeContextMenus();

// Custom Modal System Implementation
const modal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-message');
const modalInputWrap = document.getElementById('modal-input-wrap');
const modalInput = document.getElementById('modal-input');
const modalConfirmBtn = document.getElementById('modal-btn-confirm');
const modalCancelBtn = document.getElementById('modal-btn-cancel');

function showModal(title, msg, isConfirm = false, onConfirm = null) {
    modalTitle.innerText = title;
    modalMsg.innerText = msg;
    modalInputWrap.classList.add('hidden');
    modal.classList.remove('hidden');

    modalCancelBtn.onclick = () => modal.classList.add('hidden');
    modalConfirmBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    };
}

function promptModal(title, msg, onConfirm) {
    modalTitle.innerText = title;
    modalMsg.innerText = msg;
    modalInput.value = '';
    modalInputWrap.classList.remove('hidden');
    modal.classList.remove('hidden');

    modalCancelBtn.onclick = () => modal.classList.add('hidden');
    modalConfirmBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm(modalInput.value);
    };
}

// Navigation Tabs
document.getElementById('btn-files').onclick = () => {
    document.getElementById('notes-view').classList.add('hidden');
    document.getElementById('workspace-view').classList.remove('hidden');
    document.getElementById('btn-notes').classList.remove('active');
    document.getElementById('btn-files').classList.add('active');
};

document.getElementById('btn-notes').onclick = () => {
    document.getElementById('workspace-view').classList.add('hidden');
    document.getElementById('notes-view').classList.remove('hidden');
    document.getElementById('btn-files').classList.remove('active');
    document.getElementById('btn-notes').classList.add('active');
    renderNotes();
};

// Notes System
function renderNotes() {
    const grid = document.getElementById('notes-grid');
    grid.innerHTML = '';
    state.notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <textarea placeholder="Write a note...">${note.text}</textarea>
            <button class="btn btn-danger btn-icon" style="align-self: flex-end"><i data-lucide="trash"></i></button>
        `;
        const txt = card.querySelector('textarea');
        txt.oninput = () => {
            note.text = txt.value;
            saveState();
        };
        card.querySelector('button').onclick = () => {
            state.notes = state.notes.filter(n => n.id !== note.id);
            saveState();
            renderNotes();
        };
        grid.appendChild(card);
    });
    lucide.createIcons();
}

document.getElementById('btn-add-note').onclick = () => {
    state.notes.push({ id: 'n_' + Date.now(), text: '' });
    saveState();
    renderNotes();
};

// Initial App Startup
renderWorkspace();
renderBreadcrumbs();

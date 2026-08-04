/* =================================
FileForge - Main JavaScript
================================= */

/* =================================
Elements
================================= */
const newFileBtn = document.getElementById("newFileBtn");
const createFileBtn = document.getElementById("createFileBtn");
const newFolderBtn = document.getElementById("newFolderBtn");
const mobileFileUpload = document.getElementById("mobileFileUpload");

const newFileModal = document.getElementById("newFileModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelFileBtn = document.getElementById("cancelFileBtn");
const confirmCreateBtn = document.getElementById("confirmCreateBtn");
const newFileName = document.getElementById("newFileName");

const newFolderModal = document.getElementById("newFolderModal");
const closeFolderModalBtn = document.getElementById("closeFolderModalBtn");
const cancelFolderBtn = document.getElementById("cancelFolderBtn");
const confirmCreateFolderBtn = document.getElementById("confirmCreateFolderBtn");
const newFolderName = document.getElementById("newFolderName");

const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmOkBtn = document.getElementById("confirmOkBtn");

const fileList = document.getElementById("fileList");
const fileCount = document.getElementById("fileCount");
const searchFiles = document.getElementById("searchFiles");
const breadcrumbs = document.getElementById("breadcrumbs");

const fileName = document.getElementById("fileName");
const textEditor = document.getElementById("textEditor");
const activeFileHeaderIcon = document.getElementById("activeFileHeaderIcon");
const fontStyleSelect = document.getElementById("fontStyleSelect");

const lineCount = document.getElementById("lineCount");
const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");
const saveStatus = document.getElementById("saveStatus");

const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const deleteBtn = document.getElementById("deleteBtn");

const tabFiles = document.getElementById("tabFiles");
const tabNotes = document.getElementById("tabNotes");
const explorerView = document.getElementById("explorerView");
const notesView = document.getElementById("notesView");
const quickNotesArea = document.getElementById("quickNotesArea");

/* =================================
Profile Elements
================================= */
const profileModal = document.getElementById("profileModal");
const displayNameInput = document.getElementById("displayNameInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const profileChipBtn = document.getElementById("profileChipBtn");
const topbarUserName = document.getElementById("topbarUserName");
const profileCooldownMsg = document.getElementById("profileCooldownMsg");

const PROFILE_KEY = "fileforge_profile_v2";
const STORAGE_KEY = "fileforge_files_v2";
const NOTES_KEY = "fileforge_quick_notes_v1";

let userProfile = null;
let items = [];
let activeFileId = null;
let currentFolderId = "root";
let onConfirmCallback = null;

/* =================================
Extension & Icon Mapper
================================= */
function getFileIconClass(filename) {
    if (!filename.includes(".")) return "fa-regular fa-file-code";
    const ext = filename.split(".").pop().toLowerCase();

    const iconMap = {
        js: "fa-brands fa-js",
        ts: "fa-solid fa-code",
        py: "fa-brands fa-python",
        html: "fa-brands fa-html5",
        css: "fa-brands fa-css3-alt",
        json: "fa-solid fa-code",
        cpp: "fa-solid fa-c",
        c: "fa-solid fa-c",
        java: "fa-brands fa-java",
        php: "fa-brands fa-php",
        react: "fa-brands fa-react",
        vue: "fa-brands fa-vuejs",
        md: "fa-solid fa-file-pen",
        txt: "fa-regular fa-file-lines"
    };

    return iconMap[ext] || "fa-regular fa-file-code";
}

/* =================================
Load & Save Data
================================= */
function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed)) items = parsed;
        }

        const savedNotes = localStorage.getItem(NOTES_KEY);
        if (savedNotes) quickNotesArea.value = savedNotes;
    } catch (e) {
        console.error("Load error:", e);
        items = [];
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        showSavedStatus();
    } catch (e) {
        console.error("Save error:", e);
        saveStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Save failed`;
    }
}

let statusTimer;
function showSavedStatus() {
    clearTimeout(statusTimer);
    saveStatus.innerHTML = `<i class="fa-solid fa-cloud-check"></i> Saved`;
    statusTimer = setTimeout(() => {
        saveStatus.innerHTML = `<i class="fa-solid fa-cloud"></i> Ready`;
    }, 1500);
}

/* =================================
Custom Dialog Modal
================================= */
function customConfirm(title, message, callback) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    onConfirmCallback = callback;
    confirmModal.classList.add("show");
    confirmModal.setAttribute("aria-hidden", "false");
}

function closeConfirmModal() {
    confirmModal.classList.remove("show");
    confirmModal.setAttribute("aria-hidden", "true");
    onConfirmCallback = null;
}

confirmCancelBtn.addEventListener("click", closeConfirmModal);
confirmOkBtn.addEventListener("click", () => {
    if (onConfirmCallback) onConfirmCallback();
    closeConfirmModal();
});

/* =================================
Create Items (File / Folder)
================================= */
function createFile(name, content = "") {
    let fileNameVal = name ? name.trim() : newFileName.value.trim();
    if (!fileNameVal) fileNameVal = "untitled.txt";

    const newFile = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type: "file",
        name: fileNameVal,
        content: content,
        parentId: currentFolderId,
        fontStyle: "font-default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    items.unshift(newFile);
    activeFileId = newFile.id;

    saveData();
    renderExplorer();
    openActiveFile();
    closeModal(newFileModal);
}

function createFolder() {
    let folderNameVal = newFolderName.value.trim();
    if (!folderNameVal) folderNameVal = "New Folder";

    const newFolder = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type: "folder",
        name: folderNameVal,
        parentId: currentFolderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    items.unshift(newFolder);
    saveData();
    renderExplorer();
    closeModal(newFolderModal);
}

/* =================================
Mobile File Upload
================================= */
mobileFileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        createFile(file.name, event.target.result);
    };
    reader.readAsText(file);
    mobileFileUpload.value = "";
});

/* =================================
Explorer / Folder Logic
================================= */
function openFolder(folderId) {
    currentFolderId = folderId;
    renderExplorer();
    renderBreadcrumbs();
}

function renderBreadcrumbs() {
    breadcrumbs.innerHTML = "";
    let path = [];
    let curr = currentFolderId;

    while (curr !== "root") {
        const folderObj = items.find((i) => i.id === curr && i.type === "folder");
        if (folderObj) {
            path.unshift(folderObj);
            curr = folderObj.parentId;
        } else {
            curr = "root";
        }
    }

    // Root
    const rootSpan = document.createElement("span");
    rootSpan.className = `crumb ${currentFolderId === "root" ? "active" : ""}`;
    rootSpan.innerHTML = `<i class="fa-solid fa-house"></i> Root`;
    rootSpan.onclick = () => openFolder("root");
    breadcrumbs.appendChild(rootSpan);

    path.forEach((f, idx) => {
        const sep = document.createElement("span");
        sep.textContent = " / ";
        breadcrumbs.appendChild(sep);

        const span = document.createElement("span");
        span.className = `crumb ${idx === path.length - 1 ? "active" : ""}`;
        span.textContent = f.name;
        span.onclick = () => openFolder(f.id);
        breadcrumbs.appendChild(span);
    });
}

function renderExplorer() {
    fileList.innerHTML = "";
    const searchText = searchFiles.value.trim().toLowerCase();

    let currentItems = items.filter((item) => {
        if (searchText) {
            return item.name.toLowerCase().includes(searchText);
        }
        return item.parentId === currentFolderId;
    });

    fileCount.textContent = `${currentItems.length} items`;

    if (currentItems.length === 0) {
        fileList.innerHTML = `
            <div class="empty-files">
                <i class="fa-regular fa-folder-open"></i>
                <h3>No files or folders</h3>
                <p>Add a file or folder to keep organized.</p>
            </div>
        `;
        return;
    }

    currentItems.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `file-item ${item.id === activeFileId ? "active" : ""}`;

        const iconDiv = document.createElement("div");
        iconDiv.className = "file-item-icon";

        if (item.type === "folder") {
            iconDiv.innerHTML = `<i class="fa-solid fa-folder" style="color: #f7d070;"></i>`;
        } else {
            const iconClass = getFileIconClass(item.name);
            iconDiv.innerHTML = `<i class="${iconClass}"></i>`;
        }

        const infoDiv = document.createElement("div");
        infoDiv.className = "file-item-info";

        const titleDiv = document.createElement("div");
        titleDiv.className = "file-item-name";
        titleDiv.textContent = item.name;

        const dateDiv = document.createElement("div");
        dateDiv.className = "file-item-date";
        dateDiv.textContent = formatDate(item.updatedAt);

        infoDiv.append(titleDiv, dateDiv);
        btn.append(iconDiv, infoDiv);

        btn.onclick = () => {
            if (item.type === "folder") {
                openFolder(item.id);
            } else {
                enableEditor();
                openFile(item.id);
            }
        };

        fileList.appendChild(btn);
    });
}

/* =================================
File Operations
================================= */
function openFile(id) {
    const selected = items.find((i) => i.id === id && i.type === "file");
    if (!selected) return;

    activeFileId = selected.id;
    fileName.value = selected.name;
    textEditor.value = selected.content || "";

    const iconClass = getFileIconClass(selected.name);
    activeFileHeaderIcon.className = iconClass;

    fontStyleSelect.value = selected.fontStyle || "font-default";
    textEditor.className = selected.fontStyle || "font-default";

    updateStatistics();
    renderExplorer();
}

function openActiveFile() {
    if (!activeFileId) {
        showNoFile();
        return;
    }
    openFile(activeFileId);
}

function showNoFile() {
    fileName.value = "No file selected";
    textEditor.value = "";
    fileName.disabled = true;
    textEditor.disabled = true;
    activeFileHeaderIcon.className = "fa-regular fa-file-lines";
    updateStatistics();
}

function enableEditor() {
    fileName.disabled = false;
    textEditor.disabled = false;
}

function updateFileContent() {
    if (!activeFileId) return;
    const activeFile = items.find((i) => i.id === activeFileId);
    if (!activeFile) return;

    activeFile.content = textEditor.value;
    activeFile.updatedAt = new Date().toISOString();

    saveData();
    updateStatistics();
}

function renameFile() {
    if (!activeFileId) return;
    const activeFile = items.find((i) => i.id === activeFileId);
    if (!activeFile) return;

    let newName = fileName.value.trim();
    if (!newName) {
        newName = "untitled.txt";
        fileName.value = newName;
    }

    activeFile.name = newName;
    activeFile.updatedAt = new Date().toISOString();

    activeFileHeaderIcon.className = getFileIconClass(newName);

    saveData();
    renderExplorer();
}

fontStyleSelect.addEventListener("change", (e) => {
    const style = e.target.value;
    textEditor.className = style;

    if (activeFileId) {
        const activeFile = items.find((i) => i.id === activeFileId);
        if (activeFile) {
            activeFile.fontStyle = style;
            saveData();
        }
    }
});

/* =================================
Statistics & Helper
================================= */
function updateStatistics() {
    const content = textEditor.value;
    const lines = content === "" ? 1 : content.split("\n").length;
    const cleanText = content.trim();
    const words = cleanText === "" ? 0 : cleanText.split(/\s+/).length;

    lineCount.textContent = lines;
    wordCount.textContent = words;
    characterCount.textContent = content.length;
}

function formatDate(date) {
    const time = new Date(date);
    if (Number.isNaN(time.getTime())) return "Saved";
    return time.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/* =================================
Clear / Delete Buttons
================================= */
function clearContent() {
    if (!activeFileId) return;
    customConfirm("Clear Content", "Are you sure you want to clear all text in this file?", () => {
        textEditor.value = "";
        updateFileContent();
    });
}

function deleteFile() {
    if (!activeFileId) return;
    const activeFile = items.find((i) => i.id === activeFileId);
    const title = activeFile ? activeFile.name : "this file";

    customConfirm("Delete Item", `Are you sure you want to delete "${title}"?`, () => {
        items = items.filter((i) => i.id !== activeFileId);
        const remainingFiles = items.filter((i) => i.type === "file");
        activeFileId = remainingFiles.length > 0 ? remainingFiles[0].id : null;

        saveData();
        renderExplorer();
        openActiveFile();
    });
}

function downloadFile() {
    if (!activeFileId) return;
    const activeFile = items.find((i) => i.id === activeFileId);
    if (!activeFile) return;

    const fileBlob = new Blob([activeFile.content], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
}

/* =================================
Sidebar Tabs (Explorer / Notes)
================================= */
tabFiles.addEventListener("click", () => {
    tabFiles.classList.add("active");
    tabNotes.classList.remove("active");
    explorerView.classList.remove("hidden");
    notesView.classList.add("hidden");
});

tabNotes.addEventListener("click", () => {
    tabNotes.classList.add("active");
    tabFiles.classList.remove("active");
    notesView.classList.remove("hidden");
    explorerView.classList.add("hidden");
});

quickNotesArea.addEventListener("input", () => {
    localStorage.setItem(NOTES_KEY, quickNotesArea.value);
});

/* =================================
Modals
================================= */
function openModal(modal) {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

newFileBtn.onclick = () => openModal(newFileModal);
createFileBtn.onclick = () => openModal(newFileModal);
closeModalBtn.onclick = () => closeModal(newFileModal);
cancelFileBtn.onclick = () => closeModal(newFileModal);
confirmCreateBtn.onclick = () => createFile();

newFolderBtn.onclick = () => openModal(newFolderModal);
closeFolderModalBtn.onclick = () => closeModal(newFolderModal);
cancelFolderBtn.onclick = () => closeModal(newFolderModal);
confirmCreateFolderBtn.onclick = () => createFolder();

/* =================================
User Profile System
================================= */
function loadProfile() {
    try {
        const saved = localStorage.getItem(PROFILE_KEY);
        if (saved) userProfile = JSON.parse(saved);
    } catch (e) {
        console.error("Profile load error:", e);
    }
}

function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    updateProfileUI();
}

function canChangeName() {
    if (!userProfile || !userProfile.nameChangedAt) return true;
    const lastChanged = new Date(userProfile.nameChangedAt).getTime();
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    return now - lastChanged >= SEVEN_DAYS;
}

function updateProfileUI() {
    if (userProfile && userProfile.displayName) {
        topbarUserName.textContent = userProfile.displayName;
    }
}

function openProfileModal() {
    if (userProfile) {
        displayNameInput.value = userProfile.displayName;
        closeProfileBtn.classList.remove("hidden");

        if (!canChangeName()) {
            displayNameInput.disabled = true;
            saveProfileBtn.disabled = true;
            profileCooldownMsg.textContent = "You can only change your name once every 7 days.";
            profileCooldownMsg.style.color = "#ff5268";
        } else {
            displayNameInput.disabled = false;
            saveProfileBtn.disabled = false;
            profileCooldownMsg.textContent = "You can change your display name now.";
            profileCooldownMsg.style.color = "#38d996";
        }
    } else {
        closeProfileBtn.classList.add("hidden");
    }
    openModal(profileModal);
}

saveProfileBtn.addEventListener("click", () => {
    let nameVal = displayNameInput.value.trim();
    if (!nameVal) nameVal = "Malik";

    if (!userProfile) {
        userProfile = {
            displayName: nameVal,
            createdAt: new Date().toISOString(),
            nameChangedAt: new Date().toISOString()
        };
    } else {
        if (!canChangeName()) return;
        userProfile.displayName = nameVal;
        userProfile.nameChangedAt = new Date().toISOString();
    }

    saveProfile();
    closeModal(profileModal);
});

profileChipBtn.onclick = openProfileModal;
closeProfileBtn.onclick = () => closeModal(profileModal);

/* =================================
Event Listeners & Init
================================= */
textEditor.addEventListener("input", updateFileContent);
fileName.addEventListener("input", renameFile);
searchFiles.addEventListener("input", renderExplorer);

clearBtn.addEventListener("click", clearContent);
deleteBtn.addEventListener("click", deleteFile);
downloadBtn.addEventListener("click", downloadFile);

loadProfile();
loadData();
renderBreadcrumbs();
renderExplorer();

if (userProfile) {
    updateProfileUI();
} else {
    openProfileModal();
}

const initialFiles = items.filter((i) => i.type === "file");
if (initialFiles.length > 0) {
    activeFileId = initialFiles[0].id;
    enableEditor();
    openActiveFile();
} else {
    showNoFile();
}

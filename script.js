/* =================================
   FileForge - Main JavaScript
   المرحلة الحالية:
   ملفات + فولدرات + مذكرات + مهملات
   رفع + تحميل + نشر + بروفايل + ID
   ================================= */

const $ = (id) => document.getElementById(id);

/* =================================
   Elements
================================= */

const newFileBtn = $("newFileBtn");
const createFileBtn = $("createFileBtn");

const newFileModal = $("newFileModal");
const closeModalBtn = $("closeModalBtn");
const cancelFileBtn = $("cancelFileBtn");
const confirmCreateBtn = $("confirmCreateBtn");
const newFileName = $("newFileName");

const fileList = $("fileList");
const emptyFiles = $("emptyFiles");
const fileCount = $("fileCount");
const searchFiles = $("searchFiles");

const fileName = $("fileName");
const textEditor = $("textEditor");

const lineCount = $("lineCount");
const wordCount = $("wordCount");
const characterCount = $("characterCount");

const saveStatus = $("saveStatus");

const downloadBtn = $("downloadBtn");
const clearBtn = $("clearBtn");
const deleteBtn = $("deleteBtn");

const profileModal = $("profileModal");
const displayNameInput = $("displayNameInput");
const saveProfileBtn = $("saveProfileBtn");

/* =================================
   Storage Keys
================================= */

const FILES_KEY = "fileforge_files_v2";
const PROFILE_KEY = "fileforge_profile_v2";
const NOTES_KEY = "fileforge_notes_v2";
const FOLDERS_KEY = "fileforge_folders_v2";
const TRASH_KEY = "fileforge_trash_v2";
const POSTS_KEY = "fileforge_posts_v2";

/* =================================
   Data
================================= */

let files = [];
let notes = [];
let folders = [];
let trash = [];
let posts = [];

let activeFileId = null;

let userProfile = null;

let currentView = "files";

let statusTimer;

/* =================================
   Helpers
================================= */

function createId(prefix = "FF") {

    const random = Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase();

    const time = Date.now()
        .toString(36)
        .slice(-7)
        .toUpperCase();

    return `${prefix}-${random}-${time}`;

}

function escapeHtml(text) {

    const element =
        document.createElement("div");

    element.textContent =
        String(text ?? "");

    return element.innerHTML;

}

function formatDate(date) {

    const time =
        new Date(date);

    if (
        Number.isNaN(
            time.getTime()
        )
    ) {

        return "Unknown date";

    }

    return time.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}

function showAppMessage(
    message,
    type = "success"
) {

    let toast =
        document.querySelector(
            ".fileforge-toast"
        );

    if (!toast) {

        toast =
            document.createElement("div");

        toast.className =
            "fileforge-toast";

        document.body.appendChild(
            toast
        );

    }

    toast.textContent =
        message;

    toast.dataset.type =
        type;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toast.timer
    );

    toast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}

/* =================================
   Custom Confirm
================================= */

function customConfirm(
    title,
    message
) {

    return new Promise(
        resolve => {

            const old =
                document.querySelector(
                    ".confirm-overlay"
                );

            if (old) {

                old.remove();

            }

            const overlay =
                document.createElement(
                    "div"
                );

            overlay.className =
                "confirm-overlay";

            overlay.innerHTML = `

                <div class="confirm-box">

                    <div class="confirm-icon">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                    </div>

                    <h2>
                        ${escapeHtml(title)}
                    </h2>

                    <p>
                        ${escapeHtml(message)}
                    </p>

                    <div class="confirm-actions">

                        <button
                            class="cancel-btn"
                            type="button"
                        >
                            Cancel
                        </button>

                        <button
                            class="create-btn confirm-danger"
                            type="button"
                        >
                            Continue
                        </button>

                    </div>

                </div>

            `;

            const buttons =
                overlay.querySelectorAll(
                    "button"
                );

            buttons[0]
            .addEventListener(
                "click",
                () => {

                    overlay.remove();

                    resolve(false);

                }
            );

            buttons[1]
            .addEventListener(
                "click",
                () => {

                    overlay.remove();

                    resolve(true);

                }
            );

            document.body.appendChild(
                overlay
            );

        }
    );

}

/* =================================
   Local Storage
================================= */

function loadData() {

    try {

        files =
            JSON.parse(
                localStorage.getItem(
                    FILES_KEY
                )
                || "[]"
            );

        notes =
            JSON.parse(
                localStorage.getItem(
                    NOTES_KEY
                )
                || "[]"
            );

        folders =
            JSON.parse(
                localStorage.getItem(
                    FOLDERS_KEY
                )
                || "[]"
            );

        trash =
            JSON.parse(
                localStorage.getItem(
                    TRASH_KEY
                )
                || "[]"
            );

        posts =
            JSON.parse(
                localStorage.getItem(
                    POSTS_KEY
                )
                || "[]"
            );

        userProfile =
            JSON.parse(
                localStorage.getItem(
                    PROFILE_KEY
                )
                || "null"
            );

    } catch (error) {

        console.error(
            error
        );

        files = [];
        notes = [];
        folders = [];
        trash = [];
        posts = [];

    }

}

function saveAll() {

    try {

        localStorage.setItem(
            FILES_KEY,
            JSON.stringify(files)
        );

        localStorage.setItem(
            NOTES_KEY,
            JSON.stringify(notes)
        );

        localStorage.setItem(
            FOLDERS_KEY,
            JSON.stringify(folders)
        );

        localStorage.setItem(
            TRASH_KEY,
            JSON.stringify(trash)
        );

        localStorage.setItem(
            POSTS_KEY,
            JSON.stringify(posts)
        );

        if (userProfile) {

            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(
                    userProfile
                )
            );

        }

        showSavedStatus();

    } catch (error) {

        console.error(
            error
        );

        showAppMessage(
            "Could not save data",
            "error"
        );

    }

}

/* =================================
   Save Status
================================= */

function showSavedStatus() {

    if (!saveStatus) {

        return;

    }

    clearTimeout(
        statusTimer
    );

    saveStatus.innerHTML = `
        <i class="fa-solid fa-cloud-check"></i>
        Saved
    `;

    statusTimer =
        setTimeout(
            () => {

                saveStatus.innerHTML = `
                    <i class="fa-solid fa-cloud"></i>
                    Ready
                `;

            },
            1500
        );

}

/* =================================
   Profile
================================= */

function createDeviceId() {

    return createId(
        "FF"
    );

}

function createProfile() {

    let name =
        displayNameInput
        .value
        .trim();

    if (!name) {

        name =
            "FileForge User";

    }

    userProfile = {

        displayName:
            name,

        deviceId:
            createDeviceId(),

        createdAt:
            new Date()
            .toISOString(),

        nameChangedAt:
            new Date()
            .toISOString()

    };

    saveAll();

    closeProfileModal();

    showAppMessage(
        `Welcome, ${name}!`
    );

}

function openProfileModal() {

    if (!profileModal) {

        return;

    }

    profileModal
    .classList
    .add("show");

    profileModal
    .setAttribute(
        "aria-hidden",
        "false"
    );

    setTimeout(
        () => {

            displayNameInput
            ?.focus();

        },
        150
    );

}

function closeProfileModal() {

    profileModal
    ?.classList
    .remove("show");

    profileModal
    ?.setAttribute(
        "aria-hidden",
        "true"
    );

}

/* =================================
   File Creation
================================= */

function openModal() {

    newFileModal
    ?.classList
    .add("show");

    newFileModal
    ?.setAttribute(
        "aria-hidden",
        "false"
    );

    if (newFileName) {

        newFileName.value =
            "";

    }

    setTimeout(
        () => {

            newFileName
            ?.focus();

        },
        100
    );

}

function closeModal() {

    newFileModal
    ?.classList
    .remove("show");

    newFileModal
    ?.setAttribute(
        "aria-hidden",
        "true"
    );

}

function createFile() {

    let name =
        newFileName
        .value
        .trim();

    if (!name) {

        name =
            "Untitled File";

    }

    const now =
        new Date()
        .toISOString();

    const file = {

        id:
            createId("FILE"),

        name,

        content: "",

        folderId:
            null,

        ownerId:
            userProfile
            ?.deviceId
            || "LOCAL",

        createdAt:
            now,

        updatedAt:
            now

    };

    files.unshift(
        file
    );

    activeFileId =
        file.id;

    currentView =
        "files";

    saveAll();

    closeModal();

    enableEditor();

    renderCurrentView();

    openFile(
        file.id
    );

    showAppMessage(
        "File created"
    );

}

/* =================================
   Open File
================================= */

function openFile(id) {

    const file =
        files.find(
            item =>
            item.id === id
        );

    if (!file) {

        return;

    }

    activeFileId =
        file.id;

    enableEditor();

    fileName.value =
        file.name;

    textEditor.value =
        file.content;

    updateStatistics();

    renderCurrentView();

}

/* =================================
   Editor
================================= */

function enableEditor() {

    fileName.disabled =
        false;

    textEditor.disabled =
        false;

    downloadBtn.disabled =
        false;

    clearBtn.disabled =
        false;

    deleteBtn.disabled =
        false;

}

function disableEditor() {

    fileName.disabled =
        true;

    textEditor.disabled =
        true;

    downloadBtn.disabled =
        true;

    clearBtn.disabled =
        true;

    deleteBtn.disabled =
        true;

}

function showNoFile() {

    activeFileId =
        null;

    fileName.value =
        "No file selected";

    textEditor.value =
        "";

    disableEditor();

    updateStatistics();

}

function updateFileContent() {

    if (!activeFileId) {

        return;

    }

    const file =
        files.find(
            item =>
            item.id ===
            activeFileId
        );

    if (!file) {

        return;

    }

    file.content =
        textEditor.value;

    file.updatedAt =
        new Date()
        .toISOString();

    saveAll();

    updateStatistics();

}

function renameFile() {

    if (!activeFileId) {

        return;

    }

    const file =
        files.find(
            item =>
            item.id ===
            activeFileId
        );

    if (!file) {

        return;

    }

    let name =
        fileName
        .value
        .trim();

    if (!name) {

        name =
            "Untitled File";

        fileName.value =
            name;

    }

    file.name =
        name;

    file.updatedAt =
        new Date()
        .toISOString();

    saveAll();

    renderCurrentView();

}

/* =================================
   Statistics
================================= */

function updateStatistics() {

    const content =
        textEditor
        ?.value
        || "";

    const lines =
        content === ""
        ? 1
        : content
        .split("\n")
        .length;

    const clean =
        content.trim();

    const words =
        clean === ""
        ? 0
        : clean
        .split(/\s+/)
        .length;

    lineCount.textContent =
        lines;

    wordCount.textContent =
        words;

    characterCount.textContent =
        content.length;

}

/* =================================
   Render Files
================================= */

function renderFiles() {

    if (!fileList) {

        return;

    }

    const search =
        searchFiles
        ?.value
        .trim()
        .toLowerCase()
        || "";

    const result =
        files.filter(
            file =>
            file.name
            .toLowerCase()
            .includes(search)
        );

    fileCount.textContent =
        `${files.length} ${
            files.length === 1
            ? "file"
            : "files"
        }`;

    fileList.innerHTML =
        "";

    if (
        result.length === 0
    ) {

        fileList.innerHTML = `

            <div class="empty-files">

                <i class="fa-regular fa-folder-open"></i>

                <h3>
                    ${
                        files.length
                        ? "No files found"
                        : "No files yet"
                    }
                </h3>

                <p>
                    ${
                        files.length
                        ? "Try another search."
                        : "Create your first file to start writing."
                    }
                </p>

            </div>

        `;

        return;

    }

    result.forEach(
        file => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "file-item";

            if (
                file.id ===
                activeFileId
            ) {

                button.classList.add(
                    "active"
                );

            }

            button.innerHTML = `

                <div class="file-item-icon">

                    <i class="fa-regular fa-file-lines"></i>

                </div>

                <div class="file-item-info">

                    <div class="file-item-name">

                        ${escapeHtml(
                            file.name
                        )}

                    </div>

                    <div class="file-item-date">

                        ${formatDate(
                            file.updatedAt
                        )}

                    </div>

                </div>

            `;

            button.addEventListener(
                "click",
                () => {

                    openFile(
                        file.id
                    );

                }
            );

            fileList.appendChild(
                button
            );

        }
    );

}

/* =================================
   Notes
================================= */

function renderNotes() {

    fileList.innerHTML =
        "";

    fileCount.textContent =
        `${notes.length} notes`;

    if (
        notes.length === 0
    ) {

        fileList.innerHTML = `

            <div class="empty-files">

                <i class="fa-regular fa-note-sticky"></i>

                <h3>
                    No notes yet
                </h3>

                <p>
                    Your private notes will appear here.
                </p>

            </div>

        `;

        return;

    }

    notes.forEach(
        note => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "file-item";

            button.innerHTML = `

                <div class="file-item-icon">

                    <i class="fa-regular fa-note-sticky"></i>

                </div>

                <div class="file-item-info">

                    <div class="file-item-name">

                        ${escapeHtml(
                            note.name
                        )}

                    </div>

                    <div class="file-item-date">

                        ${formatDate(
                            note.updatedAt
                        )}

                    </div>

                </div>

            `;

            button.addEventListener(
                "click",
                () => {

                    textEditor.value =
                        note.content;

                    fileName.value =
                        note.name;

                    enableEditor();

                    activeFileId =
                        null;

                    showAppMessage(
                        "Note opened"
                    );

                }
            );

            fileList.appendChild(
                button
            );

        }
    );

}

/* =================================
   Trash
================================= */

function renderTrash() {

    fileList.innerHTML =
        "";

    fileCount.textContent =
        `${trash.length} items`;

    if (
        trash.length === 0
    ) {

        fileList.innerHTML = `

            <div class="empty-files">

                <i class="fa-solid fa-trash"></i>

                <h3>
                    Trash is empty
                </h3>

                <p>
                    Deleted files will appear here.
                </p>

            </div>

        `;

        return;

    }

    trash.forEach(
        item => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "file-item";

            button.innerHTML = `

                <div class="file-item-icon">

                    <i class="fa-solid fa-trash"></i>

                </div>

                <div class="file-item-info">

                    <div class="file-item-name">

                        ${escapeHtml(
                            item.name
                        )}

                    </div>

                    <div class="file-item-date">

                        Deleted:
                        ${formatDate(
                            item.deletedAt
                        )}

                    </div>

                </div>

            `;

            button.addEventListener(
                "click",
                async () => {

                    const restore =
                        await customConfirm(
                            "Restore file?",
                            `Restore "${item.name}"?`
                        );

                    if (!restore) {

                        return;

                    }

                    delete item.deletedAt;

                    files.unshift(
                        item
                    );

                    trash =
                        trash.filter(
                            old =>
                            old.id !==
                            item.id
                        );

                    saveAll();

                    renderTrash();

                    showAppMessage(
                        "File restored"
                    );

                }
            );

            fileList.appendChild(
                button
            );

        }
    );

}

/* =================================
   Current View
================================= */

function renderCurrentView() {

    if (
        currentView ===
        "notes"
    ) {

        renderNotes();

        return;

    }

    if (
        currentView ===
        "trash"
    ) {

        renderTrash();

        return;

    }

    renderFiles();

}

/* =================================
   Clear
================================= */

async function clearContent() {

    if (!activeFileId) {

        return;

    }

    const allowed =
        await customConfirm(
            "Clear file?",
            "All text inside this file will be removed."
        );

    if (!allowed) {

        return;

    }

    textEditor.value =
        "";

    updateFileContent();

    showAppMessage(
        "File cleared"
    );

}

/* =================================
   Delete
================================= */

async function deleteFile() {

    if (!activeFileId) {

        return;

    }

    const file =
        files.find(
            item =>
            item.id ===
            activeFileId
        );

    if (!file) {

        return;

    }

    const allowed =
        await customConfirm(
            "Move to trash?",
            `"${file.name}" can be restored later.`
        );

    if (!allowed) {

        return;

    }

    files =
        files.filter(
            item =>
            item.id !==
            activeFileId
        );

    trash.unshift({
        ...file,
        deletedAt:
            new Date()
            .toISOString()
    });

    activeFileId =
        null;

    saveAll();

    showNoFile();

    renderCurrentView();

    showAppMessage(
        "Moved to trash"
    );

}

/* =================================
   Download
================================= */

function downloadFile() {

    if (!activeFileId) {

        return;

    }

    const file =
        files.find(
            item =>
            item.id ===
            activeFileId
        );

    if (!file) {

        return;

    }

    const blob =
        new Blob(
            [file.content],
            {
                type:
                "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        file.name;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    showAppMessage(
        "Download started"
    );

}

/* =================================
   Navigation
================================= */

function setupNavigation() {

    const navButtons =
        document.querySelectorAll(
            "[data-view]"
        );

    navButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentView =
                        button.dataset.view;

                    navButtons.forEach(
                        item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                    button.classList.add(
                        "active"
                    );

                    if (
                        currentView ===
                        "files"
                    ) {

                        renderFiles();

                    }

                    if (
                        currentView ===
                        "notes"
                    ) {

                        renderNotes();

                    }

                    if (
                        currentView ===
                        "trash"
                    ) {

                        renderTrash();

                    }

                    if (
                        currentView ===
                        "shared"
                    ) {

                        fileList.innerHTML = `

                            <div class="empty-files">

                                <i class="fa-solid fa-users"></i>

                                <h3>
                                    Shared With Me
                                </h3>

                                <p>
                                    Shared files will appear here after MongoDB is connected.
                                </p>

                            </div>

                        `;

                    }

                    if (
                        currentView ===
                        "published"
                    ) {

                        fileList.innerHTML = `

                            <div class="empty-files">

                                <i class="fa-solid fa-earth-americas"></i>

                                <h3>
                                    Explore
                                </h3>

                                <p>
                                    Published files will appear here after MongoDB is connected.
                                </p>

                            </div>

                        `;

                    }

                }
            );

        }
    );

}

/* =================================
   Events
================================= */

newFileBtn
?.addEventListener(
    "click",
    openModal
);

createFileBtn
?.addEventListener(
    "click",
    openModal
);

closeModalBtn
?.addEventListener(
    "click",
    closeModal
);

cancelFileBtn
?.addEventListener(
    "click",
    closeModal
);

confirmCreateBtn
?.addEventListener(
    "click",
    createFile
);

newFileName
?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            createFile();

        }

    }
);

newFileModal
?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            newFileModal
        ) {

            closeModal();

        }

    }
);

textEditor
?.addEventListener(
    "input",
    updateFileContent
);

fileName
?.addEventListener(
    "input",
    renameFile
);

fileName
?.addEventListener(
    "blur",
    renameFile
);

searchFiles
?.addEventListener(
    "input",
    renderCurrentView
);

clearBtn
?.addEventListener(
    "click",
    clearContent
);

deleteBtn
?.addEventListener(
    "click",
    deleteFile
);

downloadBtn
?.addEventListener(
    "click",
    downloadFile
);

saveProfileBtn
?.addEventListener(
    "click",
    createProfile
);

displayNameInput
?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            createProfile();

        }

    }
);

/* =================================
   Start
================================= */

loadData();

setupNavigation();

renderFiles();

if (
    files.length > 0
) {

    openFile(
        files[0].id
    );

} else {

    showNoFile();

}

if (!userProfile) {

    openProfileModal();

}

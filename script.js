/* =================================
FileForge - Main JavaScript
================================= */

/* =================================
Elements
================================= */

const newFileBtn = document.getElementById("newFileBtn");
const createFileBtn = document.getElementById("createFileBtn");

const newFileModal = document.getElementById("newFileModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelFileBtn = document.getElementById("cancelFileBtn");
const confirmCreateBtn = document.getElementById("confirmCreateBtn");

const newFileName = document.getElementById("newFileName");

const fileList = document.getElementById("fileList");
const emptyFiles = document.getElementById("emptyFiles");

const fileCount = document.getElementById("fileCount");
const searchFiles = document.getElementById("searchFiles");

const fileName = document.getElementById("fileName");
const textEditor = document.getElementById("textEditor");

const lineCount = document.getElementById("lineCount");
const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");

const saveStatus = document.getElementById("saveStatus");

const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const deleteBtn = document.getElementById("deleteBtn");

/* =================================
Storage
================================= */

const STORAGE_KEY = "fileforge_files_v1";

let files = [];
let activeFileId = null;

/* =================================
Load Files
================================= */

function loadFiles() {

try {

    const savedFiles =
        localStorage.getItem(STORAGE_KEY);

    if (savedFiles) {

        const parsedFiles =
            JSON.parse(savedFiles);

        if (Array.isArray(parsedFiles)) {

            files = parsedFiles;

        }

    }

} catch (error) {

    console.error(
        "Could not load files:",
        error
    );

    files = [];

}

}

/* =================================
Save Files
================================= */

function saveFiles() {

try {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(files)
    );

    showSavedStatus();

} catch (error) {

    console.error(
        "Could not save files:",
        error
    );

    saveStatus.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        Save failed
    `;

}

}

/* =================================
Saved Status
================================= */

let statusTimer;

function showSavedStatus() {

clearTimeout(statusTimer);

saveStatus.innerHTML = `
    <i class="fa-solid fa-cloud-check"></i>
    Saved
`;

statusTimer = setTimeout(() => {

    saveStatus.innerHTML = `
        <i class="fa-solid fa-cloud"></i>
        Ready
    `;

}, 1500);

}

/* =================================
Create File
================================= */

function createFile() {

let name =
    newFileName.value.trim();


if (name === "") {

    name = "Untitled File";

}


const newFile = {

    id:
        Date.now().toString()
        +
        Math.random()
        .toString(36)
        .slice(2),

    name: name,

    content: "",

    createdAt:
        new Date().toISOString(),

    updatedAt:
        new Date().toISOString()

};


files.unshift(newFile);

activeFileId =
    newFile.id;


saveFiles();

renderFiles();

openActiveFile();

closeModal();

}

/* =================================
Open File
================================= */

function openFile(id) {

const selectedFile =
    files.find(
        file =>
        file.id === id
    );


if (!selectedFile) {

    return;

}


activeFileId =
    selectedFile.id;


fileName.value =
    selectedFile.name;


textEditor.value =
    selectedFile.content;


updateStatistics();

renderFiles();

}

/* =================================
Open Active File
================================= */

function openActiveFile() {

if (!activeFileId) {

    showNoFile();

    return;

}


openFile(
    activeFileId
);

}

/* =================================
No File Screen
================================= */

function showNoFile() {

fileName.value =
    "No file selected";

textEditor.value =
    "";


fileName.disabled =
    true;

textEditor.disabled =
    true;


updateStatistics();

}

/* =================================
Enable Editor
================================= */

function enableEditor() {

fileName.disabled =
    false;

textEditor.disabled =
    false;

}

/* =================================
Update File Content
================================= */

function updateFileContent() {

if (!activeFileId) {

    return;

}


const activeFile =
    files.find(
        file =>
        file.id === activeFileId
    );


if (!activeFile) {

    return;

}


activeFile.content =
    textEditor.value;

activeFile.updatedAt =
    new Date().toISOString();


saveFiles();

updateStatistics();

}

/* =================================
Rename File
================================= */

function renameFile() {

if (!activeFileId) {

    return;

}


const activeFile =
    files.find(
        file =>
        file.id === activeFileId
    );


if (!activeFile) {

    return;

}


let newName =
    fileName.value.trim();


if (newName === "") {

    newName =
        "Untitled File";

    fileName.value =
        newName;

}


activeFile.name =
    newName;

activeFile.updatedAt =
    new Date().toISOString();


saveFiles();

renderFiles();

}

/* =================================
Statistics
================================= */

function updateStatistics() {

const content =
    textEditor.value;


const lines =
    content === ""
    ? 1
    : content.split("\n").length;


const cleanText =
    content.trim();


const words =
    cleanText === ""
    ? 0
    : cleanText
    .split(/\s+/)
    .length;


const characters =
    content.length;


lineCount.textContent =
    lines;


wordCount.textContent =
    words;


characterCount.textContent =
    characters;

}

/* =================================
Render Files
================================= */

function renderFiles() {

fileList.innerHTML =
    "";


const searchText =
    searchFiles.value
    .trim()
    .toLowerCase();


const filteredFiles =
    files.filter(file => {

        return file.name
        .toLowerCase()
        .includes(searchText);

    });


fileCount.textContent =
    `${files.length} ${
        files.length === 1
        ? "file"
        : "files"
    }`;


if (filteredFiles.length === 0) {

    const message =
        files.length === 0
        ? `
            <div class="empty-files">

                <i class="fa-regular fa-folder-open"></i>

                <h3>No files yet</h3>

                <p>
                    Create your first file
                    to start writing.
                </p>

            </div>
        `
        : `
            <div class="empty-files">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>No files found</h3>

                <p>
                    Try a different search.
                </p>

            </div>
        `;


    fileList.innerHTML =
        message;

    return;

}


filteredFiles.forEach(file => {

    const fileButton =
        document.createElement("button");


    fileButton.type =
        "button";


    fileButton.className =
        "file-item";


    if (
        file.id ===
        activeFileId
    ) {

        fileButton.classList.add(
            "active"
        );

    }


    const fileIcon =
        document.createElement("div");

    fileIcon.className =
        "file-item-icon";

    fileIcon.innerHTML =
        `
            <i class="fa-regular fa-file-lines"></i>
        `;


    const fileInfo =
        document.createElement("div");

    fileInfo.className =
        "file-item-info";


    const fileTitle =
        document.createElement("div");

    fileTitle.className =
        "file-item-name";

    fileTitle.textContent =
        file.name;


    const fileDate =
        document.createElement("div");

    fileDate.className =
        "file-item-date";

    fileDate.textContent =
        formatDate(
            file.updatedAt
        );


    fileInfo.append(
        fileTitle,
        fileDate
    );


    fileButton.append(
        fileIcon,
        fileInfo
    );


    fileButton.addEventListener(
        "click",
        () => {

            enableEditor();

            openFile(
                file.id
            );

        }
    );


    fileList.appendChild(
        fileButton
    );

});

}

/* =================================
Format Date
================================= */

function formatDate(date) {

const time =
    new Date(date);


if (
    Number.isNaN(
        time.getTime()
    )
) {

    return "Saved";

}


return time.toLocaleString(
    "en-US",
    {

        month:
            "short",

        day:
            "numeric",

        hour:
            "numeric",

        minute:
            "2-digit"

    }
);

}

/* =================================
Clear Content
================================= */

function clearContent() {

if (!activeFileId) {

    return;

}


const shouldClear =
    confirm(
        "Clear all text in this file?"
    );


if (!shouldClear) {

    return;

}


textEditor.value =
    "";


updateFileContent();

}

/* =================================
Delete File
================================= */

function deleteFile() {

if (!activeFileId) {

    return;

}


const activeFile =
    files.find(
        file =>
        file.id === activeFileId
    );


const fileTitle =
    activeFile
    ? activeFile.name
    : "this file";


const shouldDelete =
    confirm(
        `Delete "${fileTitle}"?`
    );


if (!shouldDelete) {

    return;

}


files =
    files.filter(
        file =>
        file.id !==
        activeFileId
    );


activeFileId =
    files.length > 0
    ? files[0].id
    : null;


saveFiles();

renderFiles();

openActiveFile();

}

/* =================================
Download File
================================= */

function downloadFile() {

if (!activeFileId) {

    return;

}


const activeFile =
    files.find(
        file =>
        file.id === activeFileId
    );


if (!activeFile) {

    return;

}


const fileContent =
    activeFile.content;


const fileBlob =
    new Blob(
        [fileContent],
        {
            type:
            "text/plain;charset=utf-8"
        }
    );


const downloadUrl =
    URL.createObjectURL(
        fileBlob
    );


const link =
    document.createElement("a");


link.href =
    downloadUrl;


link.download =
    activeFile.name;


document.body.appendChild(
    link
);


link.click();


link.remove();


URL.revokeObjectURL(
    downloadUrl
);

}

/* =================================
Modal
================================= */

function openModal() {

newFileModal
.classList
.add("show");


newFileModal
.setAttribute(
    "aria-hidden",
    "false"
);


newFileName.value =
    "";


setTimeout(() => {

    newFileName.focus();

}, 100);

}

function closeModal() {

newFileModal
.classList
.remove("show");


newFileModal
.setAttribute(
    "aria-hidden",
    "true"
);


newFileName.value =
    "";

}

/* =================================
Events
================================= */

newFileBtn.addEventListener(
"click",
openModal
);

createFileBtn.addEventListener(
"click",
openModal
);

closeModalBtn.addEventListener(
"click",
closeModal
);

cancelFileBtn.addEventListener(
"click",
closeModal
);

confirmCreateBtn.addEventListener(
"click",
createFile
);

newFileName.addEventListener(
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

newFileModal.addEventListener(
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

textEditor.addEventListener(
"input",
updateFileContent
);

fileName.addEventListener(
"input",
renameFile
);

fileName.addEventListener(
"blur",
renameFile
);

searchFiles.addEventListener(
"input",
renderFiles
);

clearBtn.addEventListener(
"click",
clearContent
);

deleteBtn.addEventListener(
"click",
deleteFile
);

downloadBtn.addEventListener(
"click",
downloadFile
);

/* =================================
Start App
================================= */

loadFiles();

renderFiles();

if (files.length > 0) {

activeFileId =
    files[0].id;

enableEditor();

openActiveFile();

} else {

showNoFile();

}

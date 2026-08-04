/* =================================
FileForge - Main JavaScript
================================= */

/* =================================
Elements
================================= */

const newFileBtn =
document.getElementById("newFileBtn");

const createFileBtn =
document.getElementById("createFileBtn");

const newFolderBtn =
document.getElementById("newFolderBtn");

const createFolderBtn =
document.getElementById("createFolderBtn");

const uploadBtn =
document.getElementById("uploadBtn");

const fileUploadInput =
document.getElementById("fileUploadInput");


const newFileModal =
document.getElementById("newFileModal");

const closeModalBtn =
document.getElementById("closeModalBtn");

const cancelFileBtn =
document.getElementById("cancelFileBtn");

const confirmCreateBtn =
document.getElementById("confirmCreateBtn");

const newFileName =
document.getElementById("newFileName");


const newFolderModal =
document.getElementById("newFolderModal");

const closeFolderModalBtn =
document.getElementById(
"closeFolderModalBtn"
);

const cancelFolderBtn =
document.getElementById(
"cancelFolderBtn"
);

const confirmFolderBtn =
document.getElementById(
"confirmFolderBtn"
);

const newFolderName =
document.getElementById(
"newFolderName"
);


const fileList =
document.getElementById("fileList");

const fileCount =
document.getElementById("fileCount");

const searchFiles =
document.getElementById("searchFiles");


const fileName =
document.getElementById("fileName");

const textEditor =
document.getElementById("textEditor");

const currentFileIcon =
document.getElementById(
"currentFileIcon"
);


const lineCount =
document.getElementById("lineCount");

const wordCount =
document.getElementById("wordCount");

const characterCount =
document.getElementById(
"characterCount"
);


const saveStatus =
document.getElementById(
"saveStatus"
);


const downloadBtn =
document.getElementById(
"downloadBtn"
);

const clearBtn =
document.getElementById(
"clearBtn"
);

const deleteBtn =
document.getElementById(
"deleteBtn"
);

const renameBtn =
document.getElementById(
"renameBtn"
);

const moveBtn =
document.getElementById(
"moveBtn"
);


const styleBtn =
document.getElementById(
"styleBtn"
);

const styleDropdown =
document.getElementById(
"styleDropdown"
);


const moreActionsBtn =
document.getElementById(
"moreActionsBtn"
);

const moreDropdown =
document.getElementById(
"moreDropdown"
);


const breadcrumbPath =
document.getElementById(
"breadcrumbPath"
);

const homeBreadcrumb =
document.getElementById(
"homeBreadcrumb"
);


/* =================================
Notes
================================= */

const notesEditor =
document.getElementById(
"notesEditor"
);

const toggleNotesBtn =
document.getElementById(
"toggleNotesBtn"
);

const notesContent =
document.getElementById(
"notesContent"
);


/* =================================
Warning Modal
================================= */

const warningModal =
document.getElementById(
"warningModal"
);

const warningTitle =
document.getElementById(
"warningTitle"
);

const warningText =
document.getElementById(
"warningText"
);

const warningCancelBtn =
document.getElementById(
"warningCancelBtn"
);

const warningConfirmBtn =
document.getElementById(
"warningConfirmBtn"
);

let warningAction =
null;


/* =================================
Profile
================================= */

const profileModal =
document.getElementById(
"profileModal"
);

const displayNameInput =
document.getElementById(
"displayNameInput"
);

const saveProfileBtn =
document.getElementById(
"saveProfileBtn"
);


const PROFILE_KEY =
"fileforge_profile_v2";

let userProfile =
null;


/* =================================
Storage
================================= */

const STORAGE_KEY =
"fileforge_workspace_v2";

const NOTES_KEY =
"fileforge_notes_v1";


let items = [];

let activeFileId =
null;

let currentFolderId =
null;


/* =================================
ID
================================= */

function createId() {

return (
Date.now()
.toString(36)
+
Math.random()
.toString(36)
.slice(2, 10)
);

}


/* =================================
Load Workspace
================================= */

function loadWorkspace() {

try {

const saved =
localStorage.getItem(
STORAGE_KEY
);

if (!saved) {

items = [];

return;

}


const parsed =
JSON.parse(saved);


if (
Array.isArray(parsed)
) {

items =
parsed;

}

} catch (error) {

console.error(
"Could not load workspace:",
error
);

items = [];

}

}


/* =================================
Save Workspace
================================= */

function saveWorkspace() {

try {

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(items)
);

showSavedStatus();

} catch (error) {

console.error(
"Could not save workspace:",
error
);

saveStatus.innerHTML = `
<i class="fa-solid fa-triangle-exclamation"></i>
Storage full
`;

}

}


/* =================================
Save Status
================================= */

let statusTimer;


function showSavedStatus() {

clearTimeout(
statusTimer
);


saveStatus.innerHTML = `
<i class="fa-solid fa-cloud-check"></i>
Saved
`;


statusTimer =
setTimeout(() => {

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
newFileName
.value
.trim();


if (
name === ""
) {

name =
"Untitled File.txt";

}


const file = {

id:
createId(),

type:
"file",

name:
name,

content:
"",

parentId:
currentFolderId,

font:
"normal",

createdAt:
new Date()
.toISOString(),

updatedAt:
new Date()
.toISOString()

};


items.unshift(
file
);


activeFileId =
file.id;


saveWorkspace();

closeFileModal();

renderWorkspace();

openFile(
file.id
);

}


/* =================================
Create Folder
================================= */

function createFolder() {

let name =
newFolderName
.value
.trim();


if (
name === ""
) {

name =
"New Folder";

}


const folder = {

id:
createId(),

type:
"folder",

name:
name,

parentId:
currentFolderId,

createdAt:
new Date()
.toISOString(),

updatedAt:
new Date()
.toISOString()

};


items.unshift(
folder
);


saveWorkspace();

closeFolderModal();

renderWorkspace();

}


/* =================================
Open File
================================= */

function openFile(id) {

const file =
items.find(
item =>
item.id === id
);


if (
!file ||
file.type !== "file"
) {

return;

}


activeFileId =
file.id;


enableEditor();


fileName.value =
file.name;


textEditor.value =
file.content || "";


setEditorFont(
file.font || "normal"
);


currentFileIcon.innerHTML =
getFileIcon(
file.name
);


updateStatistics();

renderWorkspace();

}


/* =================================
Open Folder
================================= */

function openFolder(id) {

const folder =
items.find(
item =>
item.id === id
);


if (
!folder ||
folder.type !== "folder"
) {

return;

}


currentFolderId =
folder.id;


activeFileId =
null;


showNoFile();

renderWorkspace();

}


/* =================================
Back To Home
================================= */

function goHome() {

currentFolderId =
null;

activeFileId =
null;

showNoFile();

renderWorkspace();

}


/* =================================
No File
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


currentFileIcon.innerHTML = `
<i class="fa-regular fa-file-lines"></i>
`;


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
Update Content
================================= */

function updateFileContent() {

if (
!activeFileId
) {

return;

}


const file =
items.find(
item =>
item.id ===
activeFileId
);


if (
!file
) {

return;

}


file.content =
textEditor.value;


file.updatedAt =
new Date()
.toISOString();


saveWorkspace();

updateStatistics();

}


/* =================================
Rename
================================= */

function renameFile() {

if (
!activeFileId
) {

return;

}


const file =
items.find(
item =>
item.id ===
activeFileId
);


if (
!file
) {

return;

}


let name =
fileName.value
.trim();


if (
name === ""
) {

name =
"Untitled File.txt";

fileName.value =
name;

}


file.name =
name;


file.updatedAt =
new Date()
.toISOString();


currentFileIcon.innerHTML =
getFileIcon(
name
);


saveWorkspace();

renderWorkspace();

}


/* =================================
Rename Using Menu
================================= */

function renameFromMenu() {

if (
!activeFileId
) {

return;

}


fileName.focus();

fileName.select();

closeMenus();

}


/* =================================
Move File
================================= */

function moveFile() {

if (
!activeFileId
) {

return;

}


const file =
items.find(
item =>
item.id ===
activeFileId
);


if (
!file
) {

return;

}


file.parentId =
currentFolderId;


file.updatedAt =
new Date()
.toISOString();


saveWorkspace();

renderWorkspace();

closeMenus();

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
Get File Icon
================================= */

function getFileIcon(name) {

const extension =
name
.split(".")
.pop()
.toLowerCase();


const icons = {

js:
"fa-brands fa-js",

jsx:
"fa-brands fa-react",

ts:
"fa-brands fa-js",

tsx:
"fa-brands fa-react",

html:
"fa-brands fa-html5",

css:
"fa-brands fa-css3-alt",

json:
"fa-solid fa-code",

py:
"fa-brands fa-python",

java:
"fa-brands fa-java",

php:
"fa-brands fa-php",

c:
"fa-solid fa-c",

cpp:
"fa-solid fa-c",

cs:
"fa-solid fa-code",

zip:
"fa-solid fa-file-zipper",

rar:
"fa-solid fa-file-zipper",

png:
"fa-solid fa-file-image",

jpg:
"fa-solid fa-file-image",

jpeg:
"fa-solid fa-file-image",

webp:
"fa-solid fa-file-image",

gif:
"fa-solid fa-file-image",

mp3:
"fa-solid fa-file-audio",

wav:
"fa-solid fa-file-audio",

mp4:
"fa-solid fa-file-video",

pdf:
"fa-solid fa-file-pdf",

txt:
"fa-solid fa-file-lines"

};


const icon =
icons[extension]
||
"fa-regular fa-file";


return `
<i class="${icon}"></i>
`;

}


/* =================================
Render Workspace
================================= */

function renderWorkspace() {

fileList.innerHTML =
"";


const search =
searchFiles
.value
.trim()
.toLowerCase();


let visibleItems =
items.filter(
item => {

const sameFolder =
item.parentId ===
currentFolderId;


const matchesSearch =
item.name
.toLowerCase()
.includes(search);


return (
search !== ""
? matchesSearch
: sameFolder
);

}
);


visibleItems.sort(
(a, b) => {

if (
a.type === "folder" &&
b.type !== "folder"
) {

return -1;

}


if (
a.type !== "folder" &&
b.type === "folder"
) {

return 1;

}


return a.name
.localeCompare(
b.name
);

}
);


fileCount.textContent =
`${visibleItems.length} ${
visibleItems.length === 1
? "item"
: "items"
}`;


updateBreadcrumb();


if (
visibleItems.length === 0
) {

fileList.innerHTML = `

<div class="empty-files">

<i class="fa-regular fa-folder-open"></i>

<h3>
This folder is empty
</h3>

<p>
Create a file, folder,
or upload a file.
</p>

</div>

`;

return;

}


visibleItems.forEach(
item => {

const row =
document.createElement(
"div"
);


row.className =
"file-item";


if (
item.id ===
activeFileId
) {

row.classList.add(
"active"
);

}


const icon =
document.createElement(
"div"
);


icon.className =
"file-item-icon";


icon.innerHTML =
item.type === "folder"
? `
<i class="fa-solid fa-folder"></i>
`
: getFileIcon(
item.name
);


const info =
document.createElement(
"div"
);


info.className =
"file-item-info";


const title =
document.createElement(
"div"
);


title.className =
"file-item-name";


title.textContent =
item.name;


const date =
document.createElement(
"div"
);


date.className =
"file-item-date";


date.textContent =
item.type === "folder"
? "Folder"
: formatDate(
item.updatedAt
);


info.append(
title,
date
);


const options =
document.createElement(
"button"
);


options.type =
"button";


options.className =
"item-options";


options.innerHTML = `
<i class="fa-solid fa-ellipsis"></i>
`;


options.addEventListener(
"click",
event => {

event.stopPropagation();

showItemMenu(
item,
options
);

}
);


row.append(
icon,
info,
options
);


row.addEventListener(
"click",
() => {

if (
item.type ===
"folder"
) {

openFolder(
item.id
);

} else {

openFile(
item.id
);

}

}
);


fileList.appendChild(
row
);

}
);

}


/* =================================
Item Menu
================================= */

function showItemMenu(
item,
button
) {

document
.querySelectorAll(
".item-menu"
)
.forEach(
menu =>
menu.remove()
);


const menu =
document.createElement(
"div"
);


menu.className =
"item-menu";


menu.innerHTML = `

<button data-action="rename">
<i class="fa-solid fa-pen"></i>
Rename
</button>

<button data-action="move">
<i class="fa-solid fa-folder-tree"></i>
Move here
</button>

<button data-action="download">
<i class="fa-solid fa-download"></i>
Download
</button>

<button
class="danger"
data-action="delete"
>
<i class="fa-solid fa-trash"></i>
Delete
</button>

`;


button
.parentElement
.appendChild(
menu
);


menu.addEventListener(
"click",
event => {

const action =
event.target
.closest("button")
?.dataset
.action;


if (
!action
) {

return;

}


if (
action ===
"rename"
) {

renameItem(
item
);

}


if (
action ===
"move"
) {

item.parentId =
currentFolderId;

saveWorkspace();

renderWorkspace();

}


if (
action ===
"download" &&
item.type ===
"file"
) {

downloadItem(
item
);

}


if (
action ===
"delete"
) {

askDeleteItem(
item
);

}


menu.remove();

}
);

}


/* =================================
Rename Any Item
================================= */

function renameItem(item) {

const newName =
prompt(
"Enter a new name:",
item.name
);


if (
!newName ||
newName.trim() === ""
) {

return;

}


item.name =
newName.trim();


item.updatedAt =
new Date()
.toISOString();


saveWorkspace();

renderWorkspace();

}


/* =================================
Delete Item
================================= */

function askDeleteItem(item) {

openWarning(

`Delete "${item.name}"?`,

item.type === "folder"
? "The folder and everything inside it will be deleted."
: "This file will be permanently removed.",

() => {

deleteItem(
item.id
);

}

);

}


function deleteItem(id) {

const children =
items.filter(
item =>
item.parentId === id
);


children.forEach(
child => {

deleteItem(
child.id
);

}
);


items =
items.filter(
item =>
item.id !== id
);


if (
activeFileId === id
) {

activeFileId =
null;

showNoFile();

}


saveWorkspace();

renderWorkspace();

}


/* =================================
Custom Warning
================================= */

function openWarning(
title,
text,
action
) {

warningTitle.textContent =
title;


warningText.textContent =
text;


warningAction =
action;


warningModal
.classList
.add("show");


warningModal
.setAttribute(
"aria-hidden",
"false"
);

}


function closeWarning() {

warningModal
.classList
.remove("show");


warningModal
.setAttribute(
"aria-hidden",
"true"
);


warningAction =
null;

}


/* =================================
Clear Content
================================= */

function clearContent() {

if (
!activeFileId
) {

return;

}


openWarning(

"Clear this file?",

"All text inside this file will be removed.",

() => {

textEditor.value =
"";

updateFileContent();

}

);

}


/* =================================
Download
================================= */

function downloadItem(file) {

const blob =
new Blob(

[
file.content || ""
],

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


document.body
.appendChild(
link
);


link.click();

link.remove();


URL.revokeObjectURL(
url
);

}


function downloadFile() {

const file =
items.find(
item =>
item.id ===
activeFileId
);


if (
file
) {

downloadItem(
file
);

}

}


/* =================================
Upload
================================= */

function uploadFiles(
selectedFiles
) {

Array
.from(
selectedFiles
)
.forEach(
browserFile => {

const reader =
new FileReader();


reader.onload =
event => {

const item = {

id:
createId(),

type:
"file",

name:
browserFile.name,

content:
typeof event.target.result ===
"string"
? event.target.result
: "",

parentId:
currentFolderId,

font:
"normal",

createdAt:
new Date()
.toISOString(),

updatedAt:
new Date()
.toISOString()

};


items.unshift(
item
);


saveWorkspace();

renderWorkspace();

};


reader.readAsText(
browserFile
);

}
);

}


/* =================================
Fonts
================================= */

function setEditorFont(font) {

textEditor
.dataset
.font =
font;


const fonts = {

normal:
"Inter, Arial, sans-serif",

serif:
"Georgia, serif",

mono:
"Consolas, monospace",

handwriting:
"cursive",

modern:
"system-ui, sans-serif"

};


textEditor.style.fontFamily =
fonts[font]
||
fonts.normal;

}


function changeFont(font) {

if (
!activeFileId
) {

return;

}


const file =
items.find(
item =>
item.id ===
activeFileId
);


if (
!file
) {

return;

}


file.font =
font;


setEditorFont(
font
);


saveWorkspace();

styleDropdown
.classList
.remove("show");

}


/* =================================
Breadcrumb
================================= */

function updateBreadcrumb() {

breadcrumbPath.innerHTML =
"";


let folderId =
currentFolderId;


const path = [];


while (
folderId
) {

const folder =
items.find(
item =>
item.id ===
folderId
);


if (
!folder
) {

break;

}


path.unshift(
folder
);


folderId =
folder.parentId;

}


path.forEach(
folder => {

const separator =
document.createElement(
"span"
);


separator.textContent =
" / ";


const button =
document.createElement(
"button"
);


button.type =
"button";


button.textContent =
folder.name;


button.addEventListener(
"click",
() => {

currentFolderId =
folder.id;

activeFileId =
null;

showNoFile();

renderWorkspace();

}
);


breadcrumbPath.append(
separator,
button
);

}
);

}


/* =================================
Date
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


return time
.toLocaleString(
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
Modals
================================= */

function openFileModal() {

newFileModal
.classList
.add("show");


newFileName.value =
"";


setTimeout(
() => {

newFileName.focus();

},
100
);

}


function closeFileModal() {

newFileModal
.classList
.remove("show");

}


function openFolderModal() {

newFolderModal
.classList
.add("show");


newFolderName.value =
"";


setTimeout(
() => {

newFolderName.focus();

},
100
);

}


function closeFolderModal() {

newFolderModal
.classList
.remove("show");

}


/* =================================
Notes
================================= */

function loadNotes() {

notesEditor.value =
localStorage.getItem(
NOTES_KEY
)
||
"";

}


function saveNotes() {

localStorage.setItem(
NOTES_KEY,
notesEditor.value
);

}


/* =================================
Profile
================================= */

function loadProfile() {

try {

const saved =
localStorage.getItem(
PROFILE_KEY
);


if (
saved
) {

userProfile =
JSON.parse(
saved
);

}

} catch {

userProfile =
null;

}

}


function createProfile() {

const name =
displayNameInput
.value
.trim()
||
"FileForge User";


userProfile = {

displayName:
name,

createdAt:
new Date()
.toISOString()

};


localStorage.setItem(

PROFILE_KEY,

JSON.stringify(
userProfile
)

);


profileModal
.classList
.remove("show");

}


/* =================================
Menus
================================= */

function closeMenus() {

moreDropdown
.classList
.remove("show");


styleDropdown
.classList
.remove("show");

}


/* =================================
Events
================================= */

newFileBtn
.addEventListener(
"click",
openFileModal
);


createFileBtn
.addEventListener(
"click",
openFileModal
);


newFolderBtn
.addEventListener(
"click",
openFolderModal
);


createFolderBtn
.addEventListener(
"click",
openFolderModal
);


uploadBtn
.addEventListener(
"click",
() => {

fileUploadInput.click();

}
);


fileUploadInput
.addEventListener(
"change",
event => {

uploadFiles(
event.target.files
);

event.target.value =
"";

}
);


confirmCreateBtn
.addEventListener(
"click",
createFile
);


confirmFolderBtn
.addEventListener(
"click",
createFolder
);


closeModalBtn
.addEventListener(
"click",
closeFileModal
);


cancelFileBtn
.addEventListener(
"click",
closeFileModal
);


closeFolderModalBtn
.addEventListener(
"click",
closeFolderModal
);


cancelFolderBtn
.addEventListener(
"click",
closeFolderModal
);


newFileName
.addEventListener(
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


newFolderName
.addEventListener(
"keydown",
event => {

if (
event.key ===
"Enter"
) {

createFolder();

}

}
);


textEditor
.addEventListener(
"input",
updateFileContent
);


fileName
.addEventListener(
"input",
renameFile
);


searchFiles
.addEventListener(
"input",
renderWorkspace
);


downloadBtn
.addEventListener(
"click",
downloadFile
);


clearBtn
.addEventListener(
"click",
clearContent
);


deleteBtn
.addEventListener(
"click",
() => {

const file =
items.find(
item =>
item.id ===
activeFileId
);


if (
file
) {

askDeleteItem(
file
);

}

}
);


renameBtn
.addEventListener(
"click",
renameFromMenu
);


moveBtn
.addEventListener(
"click",
moveFile
);


moreActionsBtn
.addEventListener(
"click",
event => {

event.stopPropagation();

moreDropdown
.classList
.toggle("show");

styleDropdown
.classList
.remove("show");

}
);


styleBtn
.addEventListener(
"click",
event => {

event.stopPropagation();

styleDropdown
.classList
.toggle("show");

moreDropdown
.classList
.remove("show");

}
);


styleDropdown
.querySelectorAll(
"button"
)
.forEach(
button => {

button.addEventListener(
"click",
() => {

changeFont(
button.dataset.font
);

}
);

}
);


homeBreadcrumb
.addEventListener(
"click",
goHome
);


warningCancelBtn
.addEventListener(
"click",
closeWarning
);


warningConfirmBtn
.addEventListener(
"click",
() => {

if (
warningAction
) {

warningAction();

}

closeWarning();

}
);


notesEditor
.addEventListener(
"input",
saveNotes
);


toggleNotesBtn
.addEventListener(
"click",
() => {

notesContent
.classList
.toggle("hidden");

}
);


saveProfileBtn
.addEventListener(
"click",
createProfile
);


displayNameInput
.addEventListener(
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


document
.addEventListener(
"click",
() => {

closeMenus();

document
.querySelectorAll(
".item-menu"
)
.forEach(
menu =>
menu.remove()
);

}
);


/* =================================
Start App
================================= */

loadProfile();

loadWorkspace();

loadNotes();

renderWorkspace();

showNoFile();


if (
!userProfile
) {

profileModal
.classList
.add("show");

}

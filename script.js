/* =================================
   FileForge — Complete Script
================================= */

"use strict";

/* =================================
   Elements
================================= */

const $ = (id) => document.getElementById(id);

const elements = {
    homeBtn: $("homeBtn"),

    profileBtn: $("profileBtn"),
    profileName: $("profileName"),

    onlineCount: $("onlineCount"),

    newFileBtn: $("newFileBtn"),
    createFileBtn: $("createFileBtn"),
    createFolderBtn: $("createFolderBtn"),
    emptyCreateBtn: $("emptyCreateBtn"),

    fileList: $("fileList"),
    fileCount: $("fileCount"),
    sidebarTitle: $("sidebarTitle"),

    searchFiles: $("searchFiles"),

    uploadBtn: $("uploadBtn"),
    fileUploadInput: $("fileUploadInput"),

    activeItemIcon: $("activeItemIcon"),
    fileName: $("fileName"),

    textEditor: $("textEditor"),
    editorEmpty: $("editorEmpty"),

    fontStyle: $("fontStyle"),

    saveStatus: $("saveStatus"),
    saveInfoText: $("saveInfoText"),

    lineCount: $("lineCount"),
    wordCount: $("wordCount"),
    characterCount: $("characterCount"),

    shareBtn: $("shareBtn"),
    downloadBtn: $("downloadBtn"),
    clearBtn: $("clearBtn"),
    publishBtn: $("publishBtn"),
    deleteBtn: $("deleteBtn"),

    trashCount: $("trashCount"),

    newFileModal: $("newFileModal"),
    newFileName: $("newFileName"),
    newFileFolder: $("newFileFolder"),
    confirmCreateBtn: $("confirmCreateBtn"),

    folderModal: $("folderModal"),
    folderNameInput: $("folderNameInput"),
    confirmFolderBtn: $("confirmFolderBtn"),

    profileModal: $("profileModal"),
    displayNameInput: $("displayNameInput"),
    saveProfileBtn: $("saveProfileBtn"),

    profileSettingsModal: $("profileSettingsModal"),
    profileNameInput: $("profileNameInput"),
    nameChangeInfo: $("nameChangeInfo"),
    deviceIdText: $("deviceIdText"),
    copyIdBtn: $("copyIdBtn"),
    updateProfileBtn: $("updateProfileBtn"),

    shareModal: $("shareModal"),
    shareIdInput: $("shareIdInput"),
    sharedUsersList: $("sharedUsersList"),
    addSharedUserBtn: $("addSharedUserBtn"),

    permissionsModal: $("permissionsModal"),

    permissionView: $("permissionView"),
    permissionEdit: $("permissionEdit"),
    permissionAdd: $("permissionAdd"),
    permissionDelete: $("permissionDelete"),
    permissionDownload: $("permissionDownload"),
    permissionAll: $("permissionAll"),

    savePermissionsBtn: $("savePermissionsBtn"),

    publishModal: $("publishModal"),
    publishDescription: $("publishDescription"),
    publishVisibility: $("publishVisibility"),
    previewLines: $("previewLines"),
    confirmPublishBtn: $("confirmPublishBtn"),

    toast: $("toast"),
    toastIcon: $("toastIcon"),
    toastText: $("toastText")
};


/* =================================
   Storage Keys
================================= */

const STORAGE = {
    items: "fileforge_items",
    profile: "fileforge_profile",
    deviceId: "fileforge_device_id",
    activeId: "fileforge_active_id",
    view: "fileforge_view"
};


/* =================================
   App Data
================================= */

let items = [];

let activeItemId = null;

let currentView = "files";

let saveTimer = null;

let currentPermissionUser = null;


/* =================================
   Helpers
================================= */

function createId() {

    return (
        Date.now()
        .toString(36)
        +
        Math.random()
        .toString(36)
        .slice(2, 9)
    );
}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = String(value);

    return div.innerHTML;
}


function getDateText(time) {

    const date = new Date(time);

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function getDeviceId() {

    let id = localStorage.getItem(
        STORAGE.deviceId
    );

    if (id) {

        return id;
    }

    const letters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

    const numbers =
        "23456789";

    function randomPart(
        characters,
        length
    ) {

        let result = "";

        for (
            let i = 0;
            i < length;
            i++
        ) {

            result +=
                characters[
                    Math.floor(
                        Math.random()
                        *
                        characters.length
                    )
                ];
        }

        return result;
    }

    id =
        "FF-"
        +
        randomPart(
            letters + numbers,
            6
        )
        +
        "-"
        +
        randomPart(
            letters + numbers,
            6
        );

    localStorage.setItem(
        STORAGE.deviceId,
        id
    );

    return id;
}


function getProfile() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE.profile
            )
        );

    } catch {

        return null;
    }
}


function saveProfile(
    profile
) {

    localStorage.setItem(
        STORAGE.profile,
        JSON.stringify(profile)
    );
}


function saveItems() {

    localStorage.setItem(
        STORAGE.items,
        JSON.stringify(items)
    );
}


function loadItems() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.items
                )
            );

        items =
            Array.isArray(saved)
            ? saved
            : [];

    } catch {

        items = [];
    }
}


function getActiveItem() {

    return items.find(
        item =>
        item.id === activeItemId
    );
}


function showToast(
    message,
    type = "success"
) {

    const icons = {

        success:
            "fa-circle-check",

        error:
            "fa-circle-xmark",

        warning:
            "fa-triangle-exclamation",

        info:
            "fa-circle-info"
    };

    elements.toastIcon.className =
        "fa-solid "
        +
        (
            icons[type]
            ||
            icons.success
        );

    elements.toastText.textContent =
        message;

    elements.toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {

                elements.toast
                .classList
                .remove(
                    "show"
                );

            },
            2600
        );
}


function openModal(
    modal
) {

    if (!modal) {

        return;
    }

    modal.classList.add(
        "show"
    );
}


function closeModal(
    modal
) {

    if (!modal) {

        return;
    }

    modal.classList.remove(
        "show"
    );
}


function closeAllModals() {

    document
    .querySelectorAll(
        ".modal"
    )
    .forEach(
        modal => {

            modal.classList.remove(
                "show"
            );

        }
    );
}


/* =================================
   Profile
================================= */

function setupProfile() {

    const profile =
        getProfile();

    const deviceId =
        getDeviceId();

    elements.deviceIdText.textContent =
        deviceId;

    if (
        !profile
        ||
        !profile.name
    ) {

        openModal(
            elements.profileModal
        );

        setTimeout(
            () => {

                elements
                .displayNameInput
                .focus();

            },
            100
        );

        return;
    }

    elements.profileName.textContent =
        profile.name;
}


function saveFirstProfile() {

    const name =
        elements
        .displayNameInput
        .value
        .trim();

    if (
        name.length < 2
    ) {

        showToast(
            "Enter a name with at least 2 characters.",
            "warning"
        );

        return;
    }

    const profile = {

        name:

            name.slice(
                0,
                30
            ),

        lastNameChange:

            Date.now()
    };

    saveProfile(
        profile
    );

    elements.profileName.textContent =
        profile.name;

    closeModal(
        elements.profileModal
    );

    showToast(
        "Welcome to FileForge!"
    );
}


function openProfileSettings() {

    const profile =
        getProfile();

    if (!profile) {

        openModal(
            elements.profileModal
        );

        return;
    }

    elements.profileNameInput.value =
        profile.name;

    elements.deviceIdText.textContent =
        getDeviceId();

    const week =
        7
        *
        24
        *
        60
        *
        60
        *
        1000;

    const remaining =
        week
        -
        (
            Date.now()
            -
            profile.lastNameChange
        );

    if (
        remaining > 0
    ) {

        const days =
            Math.ceil(
                remaining
                /
                (
                    24
                    *
                    60
                    *
                    60
                    *
                    1000
                )
            );

        elements
        .nameChangeInfo
        .textContent =

            "You can change your name again in "
            +
            days
            +
            " day"
            +
            (
                days === 1
                ? ""
                : "s"
            )
            +
            ".";

    } else {

        elements
        .nameChangeInfo
        .textContent =

            "You can change your display name now.";
    }

    openModal(
        elements.profileSettingsModal
    );
}


function updateProfile() {

    const profile =
        getProfile();

    if (!profile) {

        return;
    }

    const name =
        elements
        .profileNameInput
        .value
        .trim();

    if (
        name.length < 2
    ) {

        showToast(
            "Enter a valid display name.",
            "warning"
        );

        return;
    }

    if (
        name === profile.name
    ) {

        closeModal(
            elements
            .profileSettingsModal
        );

        return;
    }

    const week =
        7
        *
        24
        *
        60
        *
        60
        *
        1000;

    if (
        Date.now()
        -
        profile.lastNameChange
        <
        week
    ) {

        showToast(
            "Your name can only be changed once every 7 days.",
            "warning"
        );

        return;
    }

    profile.name =
        name.slice(
            0,
            30
        );

    profile.lastNameChange =
        Date.now();

    saveProfile(
        profile
    );

    elements.profileName.textContent =
        profile.name;

    closeModal(
        elements
        .profileSettingsModal
    );

    showToast(
        "Profile updated."
    );
}


/* =================================
   Views
================================= */

const viewData = {

    files: {

        title:
            "My Files",

        icon:
            "fa-folder"
    },

    notes: {

        title:
            "My Notes",

        icon:
            "fa-note-sticky"
    },

    shared: {

        title:
            "Shared With Me",

        icon:
            "fa-users"
    },

    explore: {

        title:
            "Explore",

        icon:
            "fa-earth-americas"
    },

    trash: {

        title:
            "Trash",

        icon:
            "fa-trash"
    }
};


function setView(
    view
) {

    currentView =
        view;

    localStorage.setItem(
        STORAGE.view,
        view
    );

    document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        button => {

            button
            .classList
            .toggle(

                "active",

                button.dataset.view
                ===
                view

            );

        }
    );

    elements.sidebarTitle.textContent =
        viewData[view]
        .title;

    activeItemId = null;

    localStorage.removeItem(
        STORAGE.activeId
    );

    updateEditor();

    renderItems();
}


/* =================================
   Items
================================= */

function getVisibleItems() {

    if (
        currentView
        ===
        "trash"
    ) {

        return items.filter(
            item =>
            item.trashed
        );
    }

    if (
        currentView
        ===
        "notes"
    ) {

        return items.filter(
            item =>

                !item.trashed

                &&

                item.type
                ===
                "file"

                &&

                item.isNote
        );
    }

    if (
        currentView
        ===
        "shared"
    ) {

        return items.filter(
            item =>

                !item.trashed

                &&

                item.sharedWith

                &&

                item.sharedWith.length
                >
                0
        );
    }

    if (
        currentView
        ===
        "explore"
    ) {

        return items.filter(
            item =>

                !item.trashed

                &&

                item.published
        );
    }

    return items.filter(
        item =>
        !item.trashed
    );
}


function getSearchItems() {

    const query =
        elements
        .searchFiles
        .value
        .trim()
        .toLowerCase();

    let result =
        getVisibleItems();

    if (
        !query
    ) {

        return result;
    }

    return result.filter(
        item =>

            item.name
            .toLowerCase()
            .includes(
                query
            )
    );
}


function renderItems() {

    const visible =
        getSearchItems();

    elements.fileCount.textContent =

        visible.length
        +
        (
            visible.length
            ===
            1
            ? " item"
            : " items"
        );

    elements.trashCount.textContent =

        items.filter(
            item =>
            item.trashed
        ).length;

    if (
        visible.length
        ===
        0
    ) {

        elements.fileList.innerHTML = `

            <div class="empty-files">

                <i class="fa-regular fa-folder-open"></i>

                <h3>
                    No items here
                </h3>

                <p>
                    Create a file or folder to get started.
                </p>

            </div>

        `;

        return;
    }

    const sorted =
        [
            ...visible
        ]
        .sort(
            (
                a,
                b
            ) => {

                if (
                    a.type
                    !==
                    b.type
                ) {

                    return (
                        a.type
                        ===
                        "folder"
                    )
                    ? -1
                    : 1;
                }

                return (
                    b.updatedAt
                    -
                    a.updatedAt
                );

            }
        );

    elements.fileList.innerHTML =

        sorted
        .map(
            item => {

                const isFolder =

                    item.type
                    ===
                    "folder";

                const active =

                    item.id
                    ===
                    activeItemId;

                const icon =

                    isFolder

                    ? "fa-folder"

                    : (
                        item.uploaded

                        ? "fa-file-arrow-up"

                        : "fa-file-lines"
                    );

                return `

                    <button
                        class="
                            file-item
                            ${
                                isFolder
                                ?
                                "folder-item"
                                :
                                ""
                            }
                            ${
                                active
                                ?
                                "active"
                                :
                                ""
                            }
                        "
                        data-item-id="
                            ${item.id}
                        "
                        type="button"
                    >

                        <span
                            class="
                                file-item-icon
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    ${icon}
                                "
                            ></i>

                        </span>

                        <span
                            class="
                                file-item-info
                            "
                        >

                            <span
                                class="
                                    file-item-name
                                "
                            >

                                ${
                                    escapeHtml(
                                        item.name
                                    )
                                }

                            </span>

                            <span
                                class="
                                    file-item-date
                                "
                            >

                                ${
                                    getDateText(
                                        item.updatedAt
                                    )
                                }

                            </span>

                        </span>

                        <button
                            class="
                                item-menu-btn
                            "
                            data-menu-id="
                                ${item.id}
                            "
                            type="button"
                            title="Options"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-ellipsis
                                "
                            ></i>

                        </button>

                    </button>

                `;

            }
        )
        .join("");
}


/* =================================
   Create File
================================= */

function updateFolderOptions() {

    const folders =
        items.filter(
            item =>

                item.type
                ===
                "folder"

                &&

                !item.trashed
        );

    elements.newFileFolder.innerHTML =

        `
        <option value="root">
            My Files
        </option>
        `

        +

        folders
        .map(
            folder => `

                <option
                    value="
                        ${folder.id}
                    "
                >

                    ${
                        escapeHtml(
                            folder.name
                        )
                    }

                </option>

            `
        )
        .join("");
}


function openNewFileModal() {

    updateFolderOptions();

    elements.newFileName.value =
        "";

    openModal(
        elements.newFileModal
    );

    setTimeout(
        () => {

            elements
            .newFileName
            .focus();

        },
        100
    );
}


function createFile() {

    let name =
        elements
        .newFileName
        .value
        .trim();

    if (
        !name
    ) {

        showToast(
            "Enter a file name.",
            "warning"
        );

        return;
    }

    if (
        !name.includes(
            "."
        )
    ) {

        name +=
            ".txt";
    }

    const now =
        Date.now();

    const item = {

        id:
            createId(),

        type:
            "file",

        name:
            name.slice(
                0,
                100
            ),

        content:
            "",

        folder:
            elements
            .newFileFolder
            .value,

        isNote:
            currentView
            ===
            "notes",

        uploaded:
            false,

        trashed:
            false,

        published:
            false,

        sharedWith:
            [],

        createdAt:
            now,

        updatedAt:
            now
    };

    items.unshift(
        item
    );

    saveItems();

    closeModal(
        elements.newFileModal
    );

    activeItemId =
        item.id;

    localStorage.setItem(
        STORAGE.activeId,
        item.id
    );

    renderItems();

    updateEditor();

    showToast(
        "File created."
    );
}


/* =================================
   Create Folder
================================= */

function openFolderModal() {

    elements.folderNameInput.value =
        "";

    openModal(
        elements.folderModal
    );

    setTimeout(
        () => {

            elements
            .folderNameInput
            .focus();

        },
        100
    );
}


function createFolder() {

    const name =
        elements
        .folderNameInput
        .value
        .trim();

    if (
        !name
    ) {

        showToast(
            "Enter a folder name.",
            "warning"
        );

        return;
    }

    const now =
        Date.now();

    items.unshift({

        id:
            createId(),

        type:
            "folder",

        name:
            name.slice(
                0,
                80
            ),

        content:
            "",

        trashed:
            false,

        published:
            false,

        sharedWith:
            [],

        createdAt:
            now,

        updatedAt:
            now
    });

    saveItems();

    closeModal(
        elements.folderModal
    );

    renderItems();

    showToast(
        "Folder created."
    );
}


/* =================================
   Select Item
================================= */

function selectItem(
    id
) {

    const item =
        items.find(
            current =>
            current.id
            ===
            id
        );

    if (
        !item
    ) {

        return;
    }

    if (
        item.type
        ===
        "folder"
    ) {

        showToast(
            "Folders are ready for organization.",
            "info"
        );

        return;
    }

    activeItemId =
        id;

    localStorage.setItem(
        STORAGE.activeId,
        id
    );

    updateEditor();

    renderItems();
}


/* =================================
   Editor
================================= */

function setEditorEnabled(
    enabled
) {

    elements.fileName.disabled =
        !enabled;

    elements.textEditor.disabled =
        !enabled;

    elements.fontStyle.disabled =
        !enabled;

    elements.shareBtn.disabled =
        !enabled;

    elements.downloadBtn.disabled =
        !enabled;

    elements.clearBtn.disabled =
        !enabled;

    elements.publishBtn.disabled =
        !enabled;

    elements.deleteBtn.disabled =
        !enabled;
}


function updateEditor() {

    const item =
        getActiveItem();

    if (
        !item
        ||
        item.type
        !==
        "file"
        ||
        item.trashed
    ) {

        setEditorEnabled(
            false
        );

        elements.fileName.value =
            "";

        elements.textEditor.value =
            "";

        elements.editorEmpty
        .classList
        .add(
            "show"
        );

        elements.activeItemIcon.className =

            "fa-regular "
            +
            (
                viewData[
                    currentView
                ]?.icon
                ||
                "fa-file-lines"
            );

        updateStats(
            ""
        );

        return;
    }

    setEditorEnabled(
        true
    );

    elements.editorEmpty
    .classList
    .remove(
        "show"
    );

    elements.fileName.value =
        item.name;

    elements.textEditor.value =
        item.content
        ||
        "";

    elements.activeItemIcon.className =

        "fa-regular fa-file-lines";

    updateStats(
        item.content
        ||
        ""
    );

    applyFontStyle(
        item.fontStyle
        ||
        "mono"
    );

    elements.fontStyle.value =

        item.fontStyle
        ||
        "mono";
}


function updateStats(
    text
) {

    const value =
        text
        ||
        "";

    const lines =

        value
        ?
        value.split(
            "\n"
        ).length
        :
        0;

    const words =

        value
        .trim()

        ?

        value
        .trim()
        .split(
            /\s+/
        )
        .length

        :

        0;

    elements.lineCount.textContent =
        lines;

    elements.wordCount.textContent =
        words;

    elements.characterCount.textContent =
        value.length;
}


function setSaveStatus(
    text,
    saving = false
) {

    elements.saveStatus.innerHTML =

        `
        <i
            class="
                fa-solid
                ${
                    saving
                    ?
                    "fa-cloud-arrow-up"
                    :
                    "fa-cloud"
                }
            "
        ></i>

        ${escapeHtml(text)}
        `;

    elements.saveInfoText.textContent =
        text;
}


function saveActiveFile(
    silent = false
) {

    const item =
        getActiveItem();

    if (
        !item
        ||
        item.type
        !==
        "file"
    ) {

        return;
    }

    item.name =
        elements
        .fileName
        .value
        .trim()
        ||
        "Untitled.txt";

    item.content =
        elements
        .textEditor
        .value;

    item.updatedAt =
        Date.now();

    item.fontStyle =
        elements
        .fontStyle
        .value;

    saveItems();

    renderItems();

    setSaveStatus(
        "Saved"
    );

    if (
        !silent
    ) {

        showToast(
            "File saved."
        );
    }
}


function queueAutoSave() {

    setSaveStatus(
        "Saving...",
        true
    );

    clearTimeout(
        saveTimer
    );

    saveTimer =
        setTimeout(
            () => {

                saveActiveFile(
                    true
                );

            },
            550
        );
}


function applyFontStyle(
    style
) {

    elements.textEditor.classList.remove(

        "editor-normal",

        "editor-mono",

        "editor-serif",

        "editor-handwritten"

    );

    elements.textEditor.classList.add(

        "editor-"
        +
        style

    );
}


/* =================================
   Clear
================================= */

function clearFile() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    if (
        !confirm(
            "Clear all text in this file?"
        )
    ) {

        return;
    }

    elements.textEditor.value =
        "";

    updateStats(
        ""
    );

    saveActiveFile(
        true
    );

    showToast(
        "File cleared."
    );
}


/* =================================
   Delete / Trash
================================= */

function deleteActiveFile() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    if (
        !confirm(
            "Move this file to Trash?"
        )
    ) {

        return;
    }

    item.trashed =
        true;

    item.updatedAt =
        Date.now();

    saveItems();

    activeItemId =
        null;

    localStorage.removeItem(
        STORAGE.activeId
    );

    updateEditor();

    renderItems();

    showToast(
        "Moved to Trash."
    );
}


function deleteItemById(
    id
) {

    const item =
        items.find(
            current =>
            current.id
            ===
            id
        );

    if (
        !item
    ) {

        return;
    }

    if (
        currentView
        ===
        "trash"
    ) {

        if (
            !confirm(
                "Delete permanently?"
            )
        ) {

            return;
        }

        items =
            items.filter(
                current =>
                current.id
                !==
                id
            );

        showToast(
            "Deleted permanently."
        );

    } else {

        item.trashed =
            true;

        item.updatedAt =
            Date.now();

        showToast(
            "Moved to Trash."
        );
    }

    if (
        activeItemId
        ===
        id
    ) {

        activeItemId =
            null;

        updateEditor();
    }

    saveItems();

    renderItems();
}


function restoreItem(
    id
) {

    const item =
        items.find(
            current =>
            current.id
            ===
            id
        );

    if (
        !item
    ) {

        return;
    }

    item.trashed =
        false;

    item.updatedAt =
        Date.now();

    saveItems();

    renderItems();

    showToast(
        "Item restored."
    );
}


/* =================================
   Download
================================= */

function downloadFile() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    saveActiveFile(
        true
    );

    const blob =
        new Blob(

            [
                item.content
                ||
                ""
            ],

            {
                type:
                    "text/plain"
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
        item.name
        ||
        "file.txt";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Download started."
    );
}


/* =================================
   Upload
================================= */

function uploadFiles(
    files
) {

    if (
        !files
        ||
        !files.length
    ) {

        return;
    }

    let finished =
        0;

    [
        ...files
    ]
    .forEach(
        file => {

            const reader =
                new FileReader();

            reader.onload =
                () => {

                    const now =
                        Date.now();

                    items.unshift({

                        id:
                            createId(),

                        type:
                            "file",

                        name:
                            file.name,

                        content:

                            typeof reader.result
                            ===
                            "string"

                            ?

                            reader.result

                            :

                            "[Binary file uploaded]",

                        uploaded:
                            true,

                        isNote:
                            false,

                        trashed:
                            false,

                        published:
                            false,

                        sharedWith:
                            [],

                        createdAt:
                            now,

                        updatedAt:
                            now
                    });

                    finished++;

                    if (
                        finished
                        ===
                        files.length
                    ) {

                        saveItems();

                        renderItems();

                        showToast(

                            finished
                            +
                            " file"
                            +
                            (
                                finished
                                ===
                                1
                                ?
                                ""
                                :
                                "s"
                            )
                            +
                            " uploaded."

                        );
                    }

                };

            reader.onerror =
                () => {

                    finished++;

                };

            reader.readAsText(
                file
            );

        }
    );
}


/* =================================
   Share
================================= */

function openShareModal() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    elements.shareIdInput.value =
        "";

    renderSharedUsers();

    openModal(
        elements.shareModal
    );
}


function renderSharedUsers() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    if (
        !item.sharedWith
        ||
        item.sharedWith.length
        ===
        0
    ) {

        elements
        .sharedUsersList
        .innerHTML =

            `
            <div class="empty-files">

                <p>
                    This file is not shared yet.
                </p>

            </div>
            `;

        return;
    }

    elements
    .sharedUsersList
    .innerHTML =

        item
        .sharedWith
        .map(
            user => `

                <div
                    class="
                        permission-row
                    "
                >

                    <span>

                        ${
                            escapeHtml(
                                user.id
                            )
                        }

                    </span>

                    <button
                        class="
                            item-menu-btn
                        "
                        style="
                            opacity:1
                        "
                        data-permission-id="
                            ${user.id}
                        "
                        type="button"
                    >

                        <i
                            class="
                                fa-solid
                                fa-gear
                            "
                        ></i>

                    </button>

                </div>

            `
        )
        .join("");
}


function addSharedUser() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    const id =
        elements
        .shareIdInput
        .value
        .trim()
        .toUpperCase();

    if (
        !/^FF-[A-Z0-9]{6}-[A-Z0-9]{6}$/
        .test(
            id
        )
    ) {

        showToast(
            "Enter a valid FileForge ID.",
            "warning"
        );

        return;
    }

    if (
        id
        ===
        getDeviceId()
    ) {

        showToast(
            "You cannot share with yourself.",
            "warning"
        );

        return;
    }

    item.sharedWith =
        item.sharedWith
        ||
        [];

    if (
        item.sharedWith.some(
            user =>
            user.id
            ===
            id
        )
    ) {

        showToast(
            "This user was already added.",
            "warning"
        );

        return;
    }

    item.sharedWith.push({

        id:

            id,

        permissions: {

            view:
                true,

            edit:
                false,

            add:
                false,

            delete:
                false,

            download:
                true
        }
    });

    saveItems();

    elements.shareIdInput.value =
        "";

    renderSharedUsers();

    showToast(
        "User added."
    );
}


function openPermissions(
    userId
) {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    const user =
        item
        .sharedWith
        .find(
            current =>
            current.id
            ===
            userId
        );

    if (
        !user
    ) {

        return;
    }

    currentPermissionUser =
        user;

    const permissions =
        user.permissions;

    elements.permissionView.checked =
        !!permissions.view;

    elements.permissionEdit.checked =
        !!permissions.edit;

    elements.permissionAdd.checked =
        !!permissions.add;

    elements.permissionDelete.checked =
        !!permissions.delete;

    elements.permissionDownload.checked =
        !!permissions.download;

    elements.permissionAll.checked =

        !!permissions.view

        &&

        !!permissions.edit

        &&

        !!permissions.add

        &&

        !!permissions.delete

        &&

        !!permissions.download;

    openModal(
        elements.permissionsModal
    );
}


function savePermissions() {

    if (
        !currentPermissionUser
    ) {

        return;
    }

    const all =
        elements.permissionAll.checked;

    currentPermissionUser.permissions = {

        view:

            all
            ||
            elements.permissionView.checked,

        edit:

            all
            ||
            elements.permissionEdit.checked,

        add:

            all
            ||
            elements.permissionAdd.checked,

        delete:

            all
            ||
            elements.permissionDelete.checked,

        download:

            all
            ||
            elements.permissionDownload.checked
    };

    saveItems();

    closeModal(
        elements.permissionsModal
    );

    showToast(
        "Permissions saved."
    );
}


/* =================================
   Publish
================================= */

function openPublishModal() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    elements.publishDescription.value =

        item.publishDescription
        ||
        "";

    elements.publishVisibility.value =

        item.publishVisibility
        ||
        "public";

    elements.previewLines.value =

        item.previewLines
        ||
        900;

    openModal(
        elements.publishModal
    );
}


function publishFile() {

    const item =
        getActiveItem();

    if (
        !item
    ) {

        return;
    }

    item.published =
        true;

    item.publishDescription =

        elements
        .publishDescription
        .value
        .trim();

    item.publishVisibility =

        elements
        .publishVisibility
        .value;

    item.previewLines =

        Math.max(

            1,

            Math.min(

                900,

                Number(
                    elements
                    .previewLines
                    .value
                )
                ||
                1

            )

        );

    item.updatedAt =
        Date.now();

    saveItems();

    closeModal(
        elements.publishModal
    );

    renderItems();

    showToast(
        "File published."
    );
}


/* =================================
   Item Menu
================================= */

function openItemMenu(
    id
) {

    const item =
        items.find(
            current =>
            current.id
            ===
            id
        );

    if (
        !item
    ) {

        return;
    }

    if (
        currentView
        ===
        "trash"
    ) {

        const action =
            prompt(

                "Type RESTORE to restore or DELETE to delete permanently."

            );

        if (
            action
            ===
            "RESTORE"
        ) {

            restoreItem(
                id
            );

        }

        if (
            action
            ===
            "DELETE"
        ) {

            deleteItemById(
                id
            );

        }

        return;
    }

    const action =
        prompt(

            "Type RENAME or DELETE."

        );

    if (
        action
        ===
        "RENAME"
    ) {

        const name =
            prompt(
                "New name:",
                item.name
            );

        if (
            name
            &&
            name.trim()
        ) {

            item.name =
                name
                .trim()
                .slice(
                    0,
                    100
                );

            item.updatedAt =
                Date.now();

            saveItems();

            renderItems();

            if (
                activeItemId
                ===
                id
            ) {

                elements.fileName.value =
                    item.name;
            }

            showToast(
                "Item renamed."
            );
        }
    }

    if (
        action
        ===
        "DELETE"
    ) {

        deleteItemById(
            id
        );
    }
}


/* =================================
   Online
================================= */

function updateOnlineCount() {

    elements.onlineCount.textContent =
        "1";
}


/* =================================
   Events
================================= */

function bindEvents() {

    elements.homeBtn
    .addEventListener(

        "click",

        () => {

            setView(
                "files"
            );

        }

    );


    elements.profileBtn
    .addEventListener(

        "click",

        openProfileSettings

    );


    elements.saveProfileBtn
    .addEventListener(

        "click",

        saveFirstProfile

    );


    elements.updateProfileBtn
    .addEventListener(

        "click",

        updateProfile

    );


    elements.copyIdBtn
    .addEventListener(

        "click",

        async () => {

            try {

                await navigator
                .clipboard
                .writeText(

                    getDeviceId()

                );

                showToast(
                    "Device ID copied."
                );

            } catch {

                showToast(
                    "Could not copy the ID.",
                    "error"
                );

            }

        }

    );


    elements.newFileBtn
    .addEventListener(

        "click",

        openNewFileModal

    );


    elements.createFileBtn
    .addEventListener(

        "click",

        openNewFileModal

    );


    elements.emptyCreateBtn
    .addEventListener(

        "click",

        openNewFileModal

    );


    elements.createFolderBtn
    .addEventListener(

        "click",

        openFolderModal

    );


    elements.confirmCreateBtn
    .addEventListener(

        "click",

        createFile

    );


    elements.confirmFolderBtn
    .addEventListener(

        "click",

        createFolder

    );


    elements.searchFiles
    .addEventListener(

        "input",

        renderItems

    );


    elements.fileList
    .addEventListener(

        "click",

        event => {

            const menu =
                event
                .target
                .closest(
                    "[data-menu-id]"
                );

            if (
                menu
            ) {

                event
                .preventDefault();

                event
                .stopPropagation();

                openItemMenu(
                    menu.dataset.menuId
                );

                return;
            }

            const item =
                event
                .target
                .closest(
                    "[data-item-id]"
                );

            if (
                item
            ) {

                selectItem(
                    item.dataset.itemId
                );
            }

        }

    );


    document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(

        button => {

            button
            .addEventListener(

                "click",

                () => {

                    setView(

                        button
                        .dataset
                        .view

                    );

                }

            );

        }

    );


    elements.fileName
    .addEventListener(

        "input",

        () => {

            queueAutoSave();

        }

    );


    elements.textEditor
    .addEventListener(

        "input",

        () => {

            updateStats(

                elements
                .textEditor
                .value

            );

            queueAutoSave();

        }

    );


    elements.textEditor
    .addEventListener(

        "keydown",

        event => {

            if (
                event.key
                ===
                "Tab"
            ) {

                event.preventDefault();

                const start =
                    elements
                    .textEditor
                    .selectionStart;

                const end =
                    elements
                    .textEditor
                    .selectionEnd;

                const value =
                    elements
                    .textEditor
                    .value;

                elements
                .textEditor
                .value =

                    value.slice(
                        0,
                        start
                    )

                    +

                    "    "

                    +

                    value.slice(
                        end
                    );

                elements
                .textEditor
                .selectionStart =

                    start
                    +
                    4;

                elements
                .textEditor
                .selectionEnd =

                    start
                    +
                    4;

                updateStats(

                    elements
                    .textEditor
                    .value

                );

                queueAutoSave();

            }

        }

    );


    elements.fontStyle
    .addEventListener(

        "change",

        () => {

            applyFontStyle(

                elements
                .fontStyle
                .value

            );

            queueAutoSave();

        }

    );


    elements.clearBtn
    .addEventListener(

        "click",

        clearFile

    );


    elements.deleteBtn
    .addEventListener(

        "click",

        deleteActiveFile

    );


    elements.downloadBtn
    .addEventListener(

        "click",

        downloadFile

    );


    elements.uploadBtn
    .addEventListener(

        "click",

        () => {

            elements
            .fileUploadInput
            .click();

        }

    );


    elements.fileUploadInput
    .addEventListener(

        "change",

        event => {

            uploadFiles(

                event
                .target
                .files

            );

            event.target.value =
                "";

        }

    );


    elements.shareBtn
    .addEventListener(

        "click",

        openShareModal

    );


    elements.addSharedUserBtn
    .addEventListener(

        "click",

        addSharedUser

    );


    elements.sharedUsersList
    .addEventListener(

        "click",

        event => {

            const button =
                event
                .target
                .closest(
                    "[data-permission-id]"
                );

            if (
                button
            ) {

                openPermissions(

                    button
                    .dataset
                    .permissionId

                );

            }

        }

    );


    elements.permissionAll
    .addEventListener(

        "change",

        () => {

            const value =

                elements
                .permissionAll
                .checked;

            elements.permissionView.checked =
                value;

            elements.permissionEdit.checked =
                value;

            elements.permissionAdd.checked =
                value;

            elements.permissionDelete.checked =
                value;

            elements.permissionDownload.checked =
                value;

        }

    );


    elements.savePermissionsBtn
    .addEventListener(

        "click",

        savePermissions

    );


    elements.publishBtn
    .addEventListener(

        "click",

        openPublishModal

    );


    elements.confirmPublishBtn
    .addEventListener(

        "click",

        publishFile

    );


    document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(

        button => {

            button
            .addEventListener(

                "click",

                () => {

                    closeModal(

                        $(
                            button
                            .dataset
                            .close
                        )

                    );

                }

            );

        }

    );


    document
    .querySelectorAll(
        ".modal"
    )
    .forEach(

        modal => {

            modal
            .addEventListener(

                "click",

                event => {

                    if (
                        event.target
                        ===
                        modal

                        &&

                        modal
                        !==
                        elements
                        .profileModal
                    ) {

                        closeModal(
                            modal
                        );

                    }

                }

            );

        }

    );


    document
    .addEventListener(

        "keydown",

        event => {

            if (
                event.key
                ===
                "Escape"
            ) {

                closeAllModals();

            }

        }

    );


    window
    .addEventListener(

        "beforeunload",

        () => {

            saveActiveFile(
                true
            );

        }

    );
}


/* =================================
   Start
================================= */

function startApp() {

    loadItems();

    activeItemId =

        localStorage.getItem(
            STORAGE.activeId
        );

    currentView =

        localStorage.getItem(
            STORAGE.view
        )

        ||

        "files";

    setupProfile();

    bindEvents();

    updateOnlineCount();

    setView(
        currentView
    );

    if (
        activeItemId
    ) {

        const item =
            items.find(
                current =>

                    current.id
                    ===
                    activeItemId

                    &&

                    !current.trashed

            );

        if (
            item
        ) {

            updateEditor();

        }

    }

    setSaveStatus(
        "Ready"
    );
}


document
.addEventListener(

    "DOMContentLoaded",

    startApp

);

/* ================================
FileForge - Main Styles
================================ */

@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,400&family=Great+Vibes&display=swap");

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
}

:root {
  --background: #090b10;
  --background-soft: #10131a;
  --panel: #141821;
  --panel-light: #1a1f2a;
  --border: #282f3d;
  --border-light: #353e4f;
  --text: #f3f5f8;
  --text-soft: #9ba4b5;
  --text-dark: #687184;
  --primary: #6d5dfc;
  --primary-light: #887cff;
  --danger: #ff5268;
  --success: #38d996;
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

body {
  background: radial-gradient(circle at top right, rgba(109, 93, 252, 0.13), transparent 35%), var(--background);
  color: var(--text);
  font-family: "Inter", Arial, sans-serif;
  overflow: hidden;
}

.app {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 18px;
}

/* Topbar */
.topbar {
  width: 100%;
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  background: rgba(20, 24, 33, 0.85);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  margin-bottom: 15px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 13px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 20px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  border-radius: 14px;
  box-shadow: 0 8px 25px rgba(109, 93, 252, 0.3);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-chip-btn {
  background: var(--panel-light);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: 0.2s;
}

.profile-chip-btn:hover {
  border-color: var(--primary);
  color: white;
}

.upload-btn-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.new-file-btn {
  border: none;
  color: white;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  padding: 12px 17px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 8px 24px rgba(109, 93, 252, 0.25);
}

.new-file-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Workspace Layout */
.workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 15px;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(20, 24, 33, 0.88);
  border: 1px solid var(--border);
  border-radius: 18px;
  backdrop-filter: blur(18px);
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  color: var(--text-dark);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.tab-btn.active {
  color: var(--primary-light);
  border-bottom: 2px solid var(--primary);
  background: rgba(109, 93, 252, 0.05);
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tab-content.hidden {
  display: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px 10px;
}

.breadcrumbs {
  padding: 0 18px 10px;
  font-size: 11px;
  color: var(--text-dark);
  white-space: nowrap;
  overflow-x: auto;
}

.crumb {
  cursor: pointer;
  transition: 0.2s;
}

.crumb:hover, .crumb.active {
  color: var(--primary-light);
}

.search-box {
  position: relative;
  margin: 0 15px 10px;
}

.search-box i {
  position: absolute;
  top: 50%;
  left: 13px;
  transform: translateY(-50%);
  color: var(--text-dark);
}

.search-box input {
  width: 100%;
  height: 38px;
  padding: 0 14px 0 38px;
  color: var(--text);
  background: var(--background-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px 10px 15px;
}

.file-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px;
  margin-bottom: 5px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text);
  transition: 0.2s;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.035);
  border-color: var(--border);
}

.file-item.active {
  background: rgba(109, 93, 252, 0.13);
  border-color: rgba(109, 93, 252, 0.3);
}

.file-item-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--primary-light);
  background: rgba(109, 93, 252, 0.1);
  border-radius: 8px;
  font-size: 16px;
}

.file-item-name {
  font-size: 13px;
  font-weight: 600;
}

.notes-container {
  padding: 15px;
  flex: 1;
}

#quickNotesArea {
  width: 100%;
  height: 100%;
  background: var(--background-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  color: var(--text);
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
}

/* Editor */
.editor-section {
  display: flex;
  flex-direction: column;
  background: rgba(20, 24, 33, 0.9);
  border: 1px solid var(--border);
  border-radius: 18px;
  backdrop-filter: blur(18px);
}

.editor-header {
  min-height: 65px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
}

.font-style-picker {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--panel-light);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.font-style-picker select {
  background: transparent;
  border: none;
  color: var(--text);
  outline: none;
  cursor: pointer;
}

.editor-container {
  flex: 1;
  padding: 15px;
}

#textEditor {
  width: 100%;
  height: 100%;
  resize: none;
  background: #0c0f15;
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 18px;
  color: #e9edf5;
  outline: none;
  line-height: 1.7;
}

/* Dynamic Font Classes */
.font-default { font-family: "Fira Code", monospace; }
.font-sans { font-family: "Inter", sans-serif; }
.font-serif { font-family: "Playfair Display", serif; }
.font-fancy { font-family: "Great Vibes", cursive; font-size: 20px !important; }
.font-code { font-family: "Consolas", monospace; background: #05070a !important; color: #38d996 !important; }

/* Modals */
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

.modal.show { display: flex; }

.modal-box {
  width: 100%;
  max-width: 440px;
  background: #151923;
  border: 1px solid var(--border-light);
  border-radius: 18px;
}

.custom-dialog-box {
  text-align: center;
  padding: 25px;
}

.dialog-icon {
  font-size: 40px;
  color: var(--danger);
  margin-bottom: 15px;
}

.delete-confirm-btn {
  background: var(--danger) !important;
  border-color: var(--danger) !important;
}

.hidden { display: none !important; }

/* Responsive Rules */
@media (max-width: 850px) {
  body { overflow: auto; }
  .app { height: auto; min-height: 100dvh; }
  .workspace { grid-template-columns: 1fr; }
}

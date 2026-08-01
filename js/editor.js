/* Moore Tutoring Solutions — visual copy editor
   -------------------------------------------------
   Lets the site owner tweak any wording without touching code.

   Best way to use it (Windows):
     1. Double-click "Edit Website.bat" in the website folder.
     2. Your browser opens the site and editing mode is already on.
     3. Click any text on the page and type your changes.
     4. Click "Save" — the .html file in the folder is updated straight
        away, and the old version is kept in the _backups folder.

   If the page was opened by double-clicking the .html file instead
   (the address starts with "file:///"), the browser is not allowed to
   write to the folder on its own. Editing still works; the Save button
   asks where to put the updated file, and falls back to a normal
   download if that isn't available.

   Editing mode is invisible to normal visitors and changes nothing on
   the live site. */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var editMode = params.has("edit") || window.location.hash === "#edit";
  var dirty = false;
  /* Set to true once we know the local editing server is running */
  var canSaveDirect = false;

  function editUrl() {
    return window.location.href.split("#")[0].split("?")[0] + "?edit";
  }

  /* Ctrl+Shift+E toggles edit mode on and off */
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === "e") {
      e.preventDefault();
      if (editMode) {
        exitEditor();
      } else {
        window.location.href = editUrl();
      }
    }
  });

  if (!editMode) return;

  /* ----- Make every text-bearing element editable ----- */
  var SKIP = { SCRIPT: 1, STYLE: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1 };

  function markEditable() {
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (SKIP[el.tagName] || el instanceof SVGElement) continue;
      if (el.closest(".mts-editor-bar")) continue;
      // Skip if an ancestor is already editable — the caret flows through it
      var host = el.parentElement && el.parentElement.closest('[contenteditable="true"]');
      if (host) continue;
      var hasText = false;
      for (var j = 0; j < el.childNodes.length; j++) {
        var n = el.childNodes[j];
        if (n.nodeType === 3 && n.textContent.trim() !== "") { hasText = true; break; }
      }
      if (hasText) el.setAttribute("contenteditable", "true");
    }
  }

  /* ----- Editor toolbar ----- */
  function buildBar() {
    var style = document.createElement("style");
    style.id = "mts-editor-style";
    style.textContent =
      "body { padding-bottom: 110px; }" +
      '[contenteditable="true"]:hover { outline: 2px dashed #2b4ee6; outline-offset: 3px; cursor: text; }' +
      '[contenteditable="true"]:focus { outline: 3px solid #ffd449; outline-offset: 3px; }' +
      ".mts-editor-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999; background: #10182b; color: #fff; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 18px; padding: 14px 18px; font-family: Inter, system-ui, sans-serif; font-size: 14px; box-shadow: 0 -6px 24px rgba(16,24,43,0.35); }" +
      ".mts-editor-bar strong { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.12em; color: #ffd449; }" +
      ".mts-editor-bar button { font: inherit; font-weight: 700; border-radius: 999px; padding: 9px 20px; cursor: pointer; border: 2px solid transparent; }" +
      ".mts-editor-bar .mts-dl { background: #2b4ee6; color: #fff; }" +
      ".mts-editor-bar .mts-dl:hover { background: #1d38b4; }" +
      ".mts-editor-bar .mts-exit { background: transparent; color: #fff; border-color: rgba(255,255,255,0.5); }" +
      ".mts-editor-bar .mts-exit:hover { border-color: #fff; }" +
      /* Toast sits above the bar. Absolute inside the fixed bar keeps it out of
         the bar's flex flow, so it can never nudge the buttons around. */
      ".mts-editor-toast { position: absolute; left: 50%; bottom: calc(100% + 14px); z-index: 1; width: max-content; max-width: min(460px, calc(100vw - 32px)); box-sizing: border-box; text-align: left; background: #fff; color: #10182b; border-left: 5px solid #2b4ee6; border-radius: 12px; padding: 13px 18px; font-family: Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.5; box-shadow: 0 10px 30px rgba(16,24,43,0.35); opacity: 0; transform: translateX(-50%) translateY(8px); transition: opacity 0.25s ease, transform 0.25s ease; pointer-events: none; }" +
      ".mts-editor-toast.is-visible { opacity: 1; transform: translateX(-50%) translateY(0); }" +
      ".mts-editor-toast strong { display: block; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; color: #1d38b4; margin-bottom: 4px; }" +
      ".mts-editor-toast code { font-family: 'IBM Plex Mono', monospace; font-size: 13px; }" +
      ".mts-editor-toast .mts-toast-tip { display: block; margin-top: 4px; color: #55607a; font-size: 13px; }" +
      /* Fallback placement if the toast ever lands outside the bar */
      ".mts-editor-toast.mts-toast-float { position: fixed; bottom: 130px; z-index: 10000; }" +
      "@media (prefers-reduced-motion: reduce) { .mts-editor-toast { transition: none; transform: translateX(-50%); } .mts-editor-toast.is-visible { transform: translateX(-50%); } }" +
      "@media (max-width: 640px) { .mts-editor-bar { font-size: 13px; } .mts-editor-toast { font-size: 13px; } }";
    document.head.appendChild(style);

    var bar = document.createElement("div");
    bar.className = "mts-editor-bar";
    bar.innerHTML =
      "<strong>EDITING MODE</strong>" +
      "<span>Click any text to change it. Links are disabled while editing.</span>" +
      '<button type="button" class="mts-dl">' +
      (canSaveDirect ? "Save to website folder" : "Save updated page") +
      "</button>" +
      '<button type="button" class="mts-exit">Exit without saving</button>';
    document.body.appendChild(bar);

    bar.querySelector(".mts-dl").addEventListener("click", savePage);
    bar.querySelector(".mts-exit").addEventListener("click", exitEditor);
  }

  /* ----- Non-blocking confirmation message -----
     A native alert() runs in the same tick as the download click and can
     interrupt the browser's download, so the save confirmation is shown as a
     toast that fades itself out instead. */
  var toastEl = null;
  var toastTimers = [];

  /* parts: array of plain strings, or { code: "index.html" } for the
     monospaced file-name bits. */
  function showToast(headingText, parts, tipText) {
    for (var t = 0; t < toastTimers.length; t++) window.clearTimeout(toastTimers[t]);
    toastTimers = [];

    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "mts-editor-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
    }

    toastEl.textContent = "";

    var heading = document.createElement("strong");
    heading.textContent = headingText;
    toastEl.appendChild(heading);

    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      if (typeof part === "string") {
        toastEl.appendChild(document.createTextNode(part));
      } else {
        var file = document.createElement("code");
        file.textContent = '"' + part.code + '"';
        toastEl.appendChild(file);
      }
    }

    if (tipText) {
      var tip = document.createElement("span");
      tip.className = "mts-toast-tip";
      tip.textContent = tipText;
      toastEl.appendChild(tip);
    }

    var bar = document.querySelector(".mts-editor-bar");
    if (bar) {
      toastEl.classList.remove("mts-toast-float");
      bar.appendChild(toastEl);
    } else {
      toastEl.classList.add("mts-toast-float");
      document.body.appendChild(toastEl);
    }

    // Next frame, so the transition runs from the hidden state
    toastTimers.push(
      window.setTimeout(function () { toastEl.classList.add("is-visible"); }, 20)
    );
    toastTimers.push(
      window.setTimeout(function () { toastEl.classList.remove("is-visible"); }, 6000)
    );
    toastTimers.push(
      window.setTimeout(function () {
        if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 6400)
    );
  }

  /* ----- Keep the page inert while editing ----- */
  function neutralizePage() {
    // Open every FAQ item so its answer text can be edited
    var details = document.querySelectorAll("details");
    for (var i = 0; i < details.length; i++) details[i].setAttribute("open", "");

    // Block link navigation, accordion toggling, and form submits
    document.addEventListener(
      "click",
      function (e) {
        if (e.target.closest(".mts-editor-bar")) return;
        if (e.target.closest("a, button, summary")) e.preventDefault();
      },
      true
    );
    document.addEventListener(
      "submit",
      function (e) { e.preventDefault(); },
      true
    );
  }

  /* ----- Save: serialize a cleaned copy of the page ----- */
  function serializePage() {
    var clone = document.documentElement.cloneNode(true);

    var strip = clone.querySelectorAll(".mts-editor-bar, #mts-editor-style");
    for (var i = 0; i < strip.length; i++) strip[i].remove();

    var editable = clone.querySelectorAll("[contenteditable]");
    for (i = 0; i < editable.length; i++) editable[i].removeAttribute("contenteditable");

    var revealed = clone.querySelectorAll(".reveal.is-visible, .mark.is-visible");
    for (i = 0; i < revealed.length; i++) revealed[i].classList.remove("is-visible");

    var details = clone.querySelectorAll("details[open]");
    for (i = 0; i < details.length; i++) details[i].removeAttribute("open");

    var menu = clone.querySelector(".nav__menu");
    if (menu) menu.classList.remove("is-open");
    var toggle = clone.querySelector(".nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");

    var success = clone.querySelectorAll(".form-success, .form-error");
    for (i = 0; i < success.length; i++) {
      success[i].classList.remove("is-visible");
      success[i].removeAttribute("tabindex");
    }

    // Calendly fills its containers with a live iframe at page load — empty
    // them again so the saved file keeps the plain embed placeholder.
    var cal = clone.querySelectorAll(".calendly-inline-widget");
    for (i = 0; i < cal.length; i++) cal[i].innerHTML = "";
    var calExtra = clone.querySelectorAll(".calendly-overlay, .calendly-badge-widget, .calendly-popup-content");
    for (i = 0; i < calExtra.length; i++) calExtra[i].remove();

    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  /* Which file are we editing? e.g. "about.html" */
  function pageFileName() {
    var last = window.location.pathname.split("/").pop() || "";
    try { last = decodeURIComponent(last); } catch (err) { /* keep as-is */ }
    if (!last || last.indexOf(".htm") === -1) return "index.html";
    return last;
  }

  function setSaving(on) {
    var btn = document.querySelector(".mts-editor-bar .mts-dl");
    if (!btn) return;
    btn.disabled = on;
    btn.textContent = on
      ? "Saving…"
      : canSaveDirect ? "Save to website folder" : "Save updated page";
  }

  /* The Save button. Three ways to save, best one first:
       1. The local editing server writes the file for us.
       2. The browser's own "save to a folder" permission (Chrome / Edge).
       3. A plain download the owner moves into the folder by hand. */
  function savePage() {
    var html = serializePage();
    var name = pageFileName();

    if (canSaveDirect) {
      saveToServer(html, name);
    } else {
      saveWithPicker(html, name);
    }
  }

  function saveToServer(html, name) {
    setSaving(true);
    window
      .fetch("/__save", {
        method: "POST",
        headers: { "Content-Type": "text/html;charset=utf-8", "X-MTS-File": name },
        body: html
      })
      .then(function (res) {
        return res.text().then(function (text) {
          if (!res.ok) throw new Error(text || ("Server said " + res.status));
          return text;
        });
      })
      .then(function () {
        dirty = false;
        setSaving(false);
        showToast(
          "SAVED!",
          [
            "Your changes are now in ",
            { code: name },
            " in the website folder — nothing to move or rename."
          ],
          "The previous version was copied into the _backups folder."
        );
      })
      .catch(function (err) {
        setSaving(false);
        showToast(
          "COULDN'T SAVE",
          [
            "The editing window may have been closed. Reopen ",
            { code: "Edit Website.bat" },
            " and try again. (" + err.message + ")"
          ],
          "Your edits are still on screen — don't reload the page."
        );
      });
  }

  /* Opened straight from the folder (file:///…). The page can't write to
     disk by itself, so ask the browser for a save location; if that isn't
     supported, fall back to a normal download. */
  function saveWithPicker(html, name) {
    if (typeof window.showSaveFilePicker !== "function") {
      downloadPage(html, name);
      return;
    }

    var opts = {
      suggestedName: name,
      types: [{ description: "Web page", accept: { "text/html": [".html"] } }]
    };

    window
      .showSaveFilePicker(opts)
      .then(function (handle) {
        return handle.createWritable().then(function (writable) {
          return writable.write(html).then(function () {
            return writable.close();
          });
        });
      })
      .then(function () {
        dirty = false;
        showToast(
          "SAVED!",
          ["Your changes were written to ", { code: name }, "."],
          "Tip: double-click \"Edit Website.bat\" next time and Save happens automatically."
        );
      })
      .catch(function (err) {
        if (err && err.name === "AbortError") return; // owner cancelled — do nothing
        downloadPage(html, name);
      });
  }

  function downloadPage(html, name) {
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    dirty = false;

    showToast(
      "DOWNLOADED",
      [
        "Your browser saved a new ",
        { code: name },
        ". Move it into your website folder, replacing the old file."
      ],
      "To skip this step, double-click \"Edit Website.bat\" and edit from there instead."
    );
  }

  function exitEditor() {
    if (dirty && !window.confirm("You have unsaved edits. Leave editing mode without saving?")) {
      return;
    }
    dirty = false;
    window.location.href = window.location.href.split("#")[0].split("?")[0];
  }

  document.addEventListener("input", function () { dirty = true; });
  window.addEventListener("beforeunload", function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  /* Is the local editing server running behind this page? */
  function detectServer(done) {
    var isHttp = /^https?:$/.test(window.location.protocol);
    if (!isHttp || typeof window.fetch !== "function") { done(); return; }

    var settled = false;
    var finish = function (ok) {
      if (settled) return;
      settled = true;
      canSaveDirect = !!ok;
      done();
    };

    window.setTimeout(function () { finish(false); }, 2000);
    window
      .fetch("/__ping", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.text() : ""; })
      .then(function (text) { finish(text.trim() === "mts-editor"); })
      .catch(function () { finish(false); });
  }

  markEditable();
  neutralizePage();
  detectServer(buildBar);
})();

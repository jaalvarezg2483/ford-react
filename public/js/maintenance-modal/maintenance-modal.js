/**
 * Reusable maintenance modal — persistent until user follows primary action.
 */
(function (global) {
  "use strict";

  var STYLE_ID = "maintenance-modal-styles";
  var ROOT_CLASS = "mm-root";
  var mounted = null;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function mergeDefaults(config) {
    config = config || {};
    return {
      homeUrl: config.homeUrl != null ? String(config.homeUrl) : "/",
      title: config.title != null ? String(config.title) : "",
      bodyHtml:
        config.bodyHtml != null
          ? String(config.bodyHtml)
          : config.bodyText != null
            ? escapeHtml(String(config.bodyText))
            : "",
      buttonLabel:
        config.buttonLabel != null ? String(config.buttonLabel) : "Continuar",
      accentColor: config.accentColor != null ? String(config.accentColor) : null,
      showCloseButton: config.showCloseButton === true,
    };
  }

  function ensureStylesheet(href) {
    if (!href || document.getElementById(STYLE_ID)) return;
    var link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function buildDOM(cfg) {
    var overlay = document.createElement("div");
    overlay.className = "mm-overlay " + ROOT_CLASS;
    overlay.setAttribute("data-maintenance-modal", "true");
    overlay.addEventListener(
      "click",
      function (e) {
        if (e.target === overlay) e.preventDefault();
      },
      true
    );

    if (cfg.accentColor) {
      overlay.style.setProperty("--mm-accent", cfg.accentColor);
    }

    var dialog = document.createElement("div");
    dialog.className = "mm-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "mm-dialog-title");

    if (cfg.showCloseButton) {
      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "mm-close";
      closeBtn.setAttribute("aria-label", "Cerrar");
      closeBtn.setAttribute("aria-disabled", "true");
      closeBtn.setAttribute("tabindex", "-1");
      closeBtn.disabled = true;
      closeBtn.innerHTML = "&times;";
      dialog.appendChild(closeBtn);
    }

    var iconWrap = document.createElement("div");
    iconWrap.className = "mm-icon-wrap";
    var icon = document.createElement("div");
    icon.className = "mm-icon";
    icon.setAttribute("aria-hidden", "true");
    var iconInner = document.createElement("span");
    iconInner.className = "mm-icon-inner";
    iconInner.textContent = "!";
    icon.appendChild(iconInner);
    iconWrap.appendChild(icon);
    dialog.appendChild(iconWrap);

    var title = document.createElement("h2");
    title.id = "mm-dialog-title";
    title.className = "mm-title";
    title.textContent = cfg.title;
    dialog.appendChild(title);

    var body = document.createElement("div");
    body.className = "mm-body";
    body.innerHTML = cfg.bodyHtml;
    dialog.appendChild(body);

    var actions = document.createElement("div");
    actions.className = "mm-actions";
    var link = document.createElement("a");
    link.className = "mm-btn";
    link.href = cfg.homeUrl;
    link.textContent = cfg.buttonLabel;
    actions.appendChild(link);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);
    return { overlay: overlay, primaryLink: link };
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function open(config) {
    close();
    var cfg = mergeDefaults(config);
    if (config && config.cssHref) {
      ensureStylesheet(config.cssHref);
    }

    var built = buildDOM(cfg);
    document.body.appendChild(built.overlay);
    var previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown, true);
    mounted = { overlay: built.overlay, previousOverflow: previousOverflow };

    if (global.requestAnimationFrame) {
      global.requestAnimationFrame(function () {
        built.primaryLink.focus();
      });
    } else {
      built.primaryLink.focus();
    }
  }

  function close() {
    if (!mounted) return;
    document.removeEventListener("keydown", onKeydown, true);
    if (mounted.overlay && mounted.overlay.parentNode) {
      mounted.overlay.parentNode.removeChild(mounted.overlay);
    }
    document.body.style.overflow = mounted.previousOverflow || "";
    mounted = null;
  }

  global.MaintenanceModal = {
    open: open,
    close: close,
  };
})(typeof window !== "undefined" ? window : this);

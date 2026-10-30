(function () {
  const storageKey = "my-wiki-primary-navigation-collapsed";
  const desktop = window.matchMedia("(min-width: 76.25em)");

  let collapsed = false;
  try {
    collapsed = window.localStorage.getItem(storageKey) === "true";
  } catch (_) {
    // The toggle still works when storage is unavailable.
  }

  function update(button) {
    document.documentElement.classList.toggle(
      "wiki-nav-collapsed",
      collapsed && desktop.matches
    );
    button.textContent = collapsed ? "显示导航" : "收起导航";
    button.setAttribute("aria-expanded", String(!collapsed));
  }

  function initialize() {
    const header = document.querySelector(".md-header__inner");
    const sidebar = document.querySelector(".md-sidebar--primary");
    if (!header || !sidebar) return;

    sidebar.id = "wiki-primary-navigation";
    let button = document.getElementById("wiki-nav-toggle");
    if (!button) {
      button = document.createElement("button");
      button.id = "wiki-nav-toggle";
      button.type = "button";
      button.className = "wiki-nav-toggle";
      button.setAttribute("aria-controls", sidebar.id);
      button.addEventListener("click", function () {
        collapsed = !collapsed;
        try {
          window.localStorage.setItem(storageKey, String(collapsed));
        } catch (_) {
          // Keep the current page's state without persistence.
        }
        update(button);
      });
      header.insertBefore(button, header.querySelector(".md-header__title"));
    }
    update(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  desktop.addEventListener("change", function () {
    const button = document.getElementById("wiki-nav-toggle");
    if (button) update(button);
  });

  if (typeof document$ !== "undefined") {
    document$.subscribe(initialize);
  }
})();

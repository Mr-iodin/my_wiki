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
    const label = collapsed ? "展开左侧导航" : "收起左侧导航";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.setAttribute("aria-expanded", String(!collapsed));
    button
      .querySelector(".wiki-nav-toggle__arrow")
      .setAttribute("d", collapsed ? "m13 9 3 3-3 3" : "m16 9-3 3 3 3");
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
      button.innerHTML =
        '<svg class="wiki-nav-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="3" y="4" width="18" height="16" rx="2"></rect>' +
        '<path d="M9 4v16"></path>' +
        '<path class="wiki-nav-toggle__arrow" d="m16 9-3 3 3 3"></path>' +
        "</svg>";
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

(function () {
  function setupTabs(tabs) {
    const buttons = Array.from(tabs.querySelectorAll('.tab-button'));
    const panels = Array.from(tabs.querySelectorAll('.tab-panel'));

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.tabTarget;
        buttons.forEach((btn) => {
          const active = btn === button;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === targetId));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tabs]').forEach(setupTabs);
  });
})();

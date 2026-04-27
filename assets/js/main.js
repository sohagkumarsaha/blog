(function () {
  const HISTORY_KEY = 'academicBlogHistory.v1';
  const posts = Array.isArray(window.__POSTS__) ? window.__POSTS__ : [];
  const currentUrl = document.body.dataset.currentUrl;
  const siteRoot = document.body.dataset.siteRoot || '/';

  function toSiteUrl(url) {
    if (!url || /^https?:\/\//i.test(url)) return url;
    const root = siteRoot.endsWith('/') ? siteRoot.slice(0, -1) : siteRoot;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${root}${path}` || '/';
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function setHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function recordCurrentPostView() {
    if (!currentUrl || !currentUrl.includes('/posts/')) return;
    const matchingPost = posts.find((post) => post.url === currentUrl);
    if (!matchingPost) return;

    const history = getHistory();
    const entry = history[matchingPost.url] || {
      count: 0,
      title: matchingPost.title,
      tags: matchingPost.tags || [],
      category: matchingPost.category,
      lastViewed: ''
    };

    entry.count += 1;
    entry.title = matchingPost.title;
    entry.tags = matchingPost.tags || [];
    entry.category = matchingPost.category;
    entry.lastViewed = new Date().toISOString();
    history[matchingPost.url] = entry;
    setHistory(history);
  }

  function renderList(targetId, items, emptyText) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = '';

    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = emptyText;
      target.appendChild(li);
      return;
    }

    items.forEach((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = toSiteUrl(item.url);
      link.textContent = item.title;
      li.appendChild(link);
      target.appendChild(li);
    });
  }

  function updatePersonalSidebar() {
    const history = getHistory();
    const historyEntries = Object.entries(history);

    const popular = posts
      .map((post) => ({ ...post, count: history[post.url]?.count || 0 }))
      .filter((post) => post.count > 0)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
      .slice(0, 5);

    renderList('popular-posts', popular, 'Read a few posts to build your personal list.');

    const readUrls = new Set(historyEntries.map(([url]) => url));
    const weights = new Map();

    historyEntries.forEach(([, entry]) => {
      const count = entry.count || 1;
      (entry.tags || []).forEach((tag) => weights.set(tag, (weights.get(tag) || 0) + count));
      if (entry.category) weights.set(`category:${entry.category}`, (weights.get(`category:${entry.category}`) || 0) + count);
    });

    const recommendations = posts
      .filter((post) => !readUrls.has(post.url))
      .map((post) => {
        const tagScore = (post.tags || []).reduce((score, tag) => score + (weights.get(tag) || 0), 0);
        const categoryScore = weights.get(`category:${post.category}`) || 0;
        return { ...post, score: tagScore + categoryScore };
      })
      .filter((post) => post.score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    renderList('recommended-posts', recommendations, 'Recommendations appear after you read posts.');
  }

  function addCopyButtons() {
    document.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-code-button')) return;
      const button = document.createElement('button');
      button.className = 'copy-code-button';
      button.type = 'button';
      button.textContent = 'Copy';
      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied';
          setTimeout(() => { button.textContent = 'Copy'; }, 1600);
        } catch (error) {
          button.textContent = 'Press Ctrl+C';
          setTimeout(() => { button.textContent = 'Copy'; }, 1800);
        }
      });
      pre.appendChild(button);
    });
  }

  function setupCategoryTabs() {
    const tabs = document.querySelectorAll('[data-category-filter]');
    const cards = document.querySelectorAll('.post-card[data-category]');
    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.categoryFilter;
        tabs.forEach((button) => button.classList.remove('is-active'));
        tab.classList.add('is-active');

        cards.forEach((card) => {
          const shouldShow = category === 'all' || card.dataset.category === category;
          card.hidden = !shouldShow;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    recordCurrentPostView();
    updatePersonalSidebar();
    addCopyButtons();
    setupCategoryTabs();
    if (window.Prism) window.Prism.highlightAll();
  });
})();

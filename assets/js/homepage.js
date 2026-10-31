/* 首页与项目页面：主题、搜索、文章筛选。 */
(function () {
  'use strict';
  var root = document.documentElement;
  var themeButton = document.getElementById('chThemeBtn');
  if (themeButton) themeButton.addEventListener('click', function () {
    var theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('blog-theme', theme); } catch (e) {}
  });

  var searchButton = document.getElementById('chSearchBtn');
  var popup = document.getElementById('chSearchPop');
  var input = document.getElementById('chSearchInput');
  var results = document.getElementById('chSearchResults');
  var data = document.getElementById('chSearchData');
  var posts = data ? JSON.parse(data.textContent) : [];
  function closeSearch(restoreFocus) {
    popup.classList.remove('open');
    searchButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) searchButton.focus();
  }
  function search() {
    results.replaceChildren();
    var query = input.value.trim().toLowerCase();
    var matches = query ? posts.filter(function (post) { return post.t.toLowerCase().includes(query); }).slice(0, 8) : [];
    if (!matches.length) {
      var empty = document.createElement('div');
      empty.className = 'ch-search-empty';
      empty.textContent = query ? '未找到相关文章' : '输入关键词开始搜索';
      results.appendChild(empty);
    }
    matches.forEach(function (post) {
      var link = document.createElement('a');
      link.href = post.u;
      link.textContent = post.t;
      results.appendChild(link);
    });
  }
  if (searchButton && popup) {
    searchButton.addEventListener('click', function () {
      if (popup.classList.contains('open')) return closeSearch(false);
      popup.classList.add('open');
      searchButton.setAttribute('aria-expanded', 'true');
      search();
      input.focus();
    });
    input.addEventListener('input', search);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var first = results.querySelector('a');
        if (first) window.location.href = first.href;
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && popup.classList.contains('open')) closeSearch(true);
    });
    document.addEventListener('click', function (event) {
      if (!popup.contains(event.target) && !searchButton.contains(event.target)) closeSearch(false);
    });
  }

  document.querySelectorAll('[data-article-section]').forEach(function (section) {
    var articles = Array.from(section.querySelectorAll('[data-article]'));
    var buttons = section.querySelectorAll('[data-filter]');
    var more = section.querySelector('.ch-load-more');
    var status = section.querySelector('.ch-filter-status');
    var pageSize = Number(section.dataset.pageSize) || articles.length;
    var limit = pageSize;
    var filter = 'all';
    function render() {
      var shown = 0;
      var matches = 0;
      articles.forEach(function (article) {
        var match = filter === 'all' || filter.split(',').some(function (keyword) { return article.dataset.keywords.includes(keyword); });
        if (match) matches++;
        article.hidden = !match || shown >= limit;
        if (!article.hidden) shown++;
      });
      more.hidden = matches <= limit;
      status.textContent = matches ? '显示 ' + shown + ' / ' + matches + ' 篇文章' : '这个方向的文章正在整理中。';
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        filter = button.dataset.filter;
        limit = pageSize;
        buttons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
        render();
      });
    });
    more.addEventListener('click', function () { limit += pageSize; render(); });
    render();
  });
})();

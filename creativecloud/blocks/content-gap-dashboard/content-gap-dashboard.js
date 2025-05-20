
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchScreen = document.getElementById('searchScreen');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const searchInputTop = document.getElementById('searchInputTop');
const searchBtnTop = document.getElementById('searchBtnTop');

const sections = {
  contentSuggestions: document.getElementById('contentSuggestions'),
  visualSuggestions: document.getElementById('visualSuggestions'),
  compareUrls: document.getElementById('compareUrls')
};

async function fetchData(query) {
  const res = await fetch('mock-data.json');
  if (!res.ok) throw new Error('Failed to fetch');
  return await res.json();
}

function bindSearch(input, button) {
  button.addEventListener('click', async () => {
    const query = input.value.trim();
    if (!query) return;
    try {
      const data = await fetchData(query);
      showDashboard(query, data);
    } catch (err) {
      alert('Failed to fetch data');
    }
  });
}

function showDashboard(query, data) {
  searchInputTop.value = query;
  searchScreen.classList.add('hidden');
  sidebar.classList.remove('hidden');
  mainContent.classList.remove('hidden');
  renderDashboard(data);
  showSection('contentSuggestions');
}

function renderDashboard(data) {
  renderMeta(data);
  renderCompareUrls(data["Other Documents"]);
  loadContentSuggestions(data.suggestions);
  loadVisualSuggestions(data.visual_suggestions);
}

function renderMeta(data) {
  const meta = document.getElementById('pageMeta');
  meta.innerHTML = `
    <h2><span class="icon">📰</span> Article: <a href="${data.articleURL}" target="_blank">${data.articleTitle}</a></h2>
  `;
}

function loadContentSuggestions(suggestions) {
  const el = sections.contentSuggestions;
  const filtered = suggestions.filter(s => s.type !== 'visual adjustment');
  el.innerHTML += filtered.length
    ? filtered.map(createCard).join('')
    : '<p class="empty-message">No content suggestions available.</p>';
}

function loadVisualSuggestions(suggestions) {
  const el = sections.visualSuggestions;
  el.innerHTML += suggestions.length
    ? suggestions.map(createCard).join('')
    : '<p class="empty-message">No visual suggestions available.</p>';
}

function renderCompareUrls(urls) {
  const el = sections.compareUrls;
  el.innerHTML += urls.length
    ? '<ul class="compare-list">' + urls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('') + '</ul>'
    : '<p class="empty-message">No competitor URLs found.</p>';
}

function createCard(item) {
    const icons = {
      'content addition': '➕',
      'content clarification': '📝',
      'content deletion': '❌',
      'content reorganization': '🔀',
      'visual adjustment': '🎨',
      'visual addition/removal': '🖼️'
    };
  
    const formattedSource = item.source_content
      ? item.source_content.replace(
          /\((https?:\/\/[^\s)]+)\)/g,
          '<a href="$1" target="_blank">$1</a>'
        )
      : '';
  
    return `
      <div class="suggestion-card">
        <div class="card-header">
          ${icons[item.type] || '📌'} ${item.title}
          <span class="tag">${item.type}</span>
        </div>
        <div class="card-body">
          <p>${item.description}</p>
          ${item.affected_area ? `<p><strong>📍 Affected Area:</strong> ${item.affected_area}</p>` : ''}
          ${
            formattedSource
              ? `<details>
                   <summary>🔎 View Source</summary>
                   <blockquote>${formattedSource}</blockquote>
                 </details>`
              : ''
          }
        </div>
      </div>
    `;
  }
    

function showSection(sectionId) {
  Object.keys(sections).forEach(id => {
    sections[id].style.display = id === sectionId ? 'block' : 'none';
  });
}

document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').substring(1);
    showSection(id);
  });
});

bindSearch(searchInput, searchBtn);
bindSearch(searchInputTop, searchBtnTop);
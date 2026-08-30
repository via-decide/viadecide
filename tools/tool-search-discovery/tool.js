const queryInput = document.getElementById('query');
const categoryInput = document.getElementById('category');
const output = document.getElementById('output');

function matchesQuery(tool, query) {
  if (!query) return true;
  const haystack = [
    tool.id,
    tool.name,
    tool.description,
    ...(tool.tags || []),
    ...(tool.relatedTools || [])
  ]
    .join(' ')
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

async function runSearch() {
  const all = await ToolRegistry.loadAll();
  const selectedCategory = categoryInput.value;
  const query = queryInput.value.trim();

  const filtered = all.filter((tool) => {
    const categoryMatch = selectedCategory === 'all' || tool.category === selectedCategory;
    return categoryMatch && matchesQuery(tool, query);
  });

  output.textContent = [
    '# Tool Discovery Results',
    '',
    `Query: ${query || '(none)'}`,
    `Category: ${selectedCategory}`,
    `Matches: ${filtered.length}`,
    '',
    ...filtered.map((tool) => [
      `## ${tool.name} (${tool.id})`,
      `- Category: ${tool.category}`,
      `- Description: ${tool.description || 'No description'}`,
      `- Entry: ${tool.entry}`,
      `- Related: ${(tool.relatedTools || []).join(', ') || '(none)'}`
    ].join('\n'))
  ].join('\n');

  ToolStorage.write('tool-search-discovery.draft', {
    query,
    category: selectedCategory,
    output: output.textContent
  });
}

document.getElementById('search').addEventListener('click', runSearch);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent));

const saved = ToolStorage.read('tool-search-discovery.draft', null);
if (saved) {
  queryInput.value = saved.query || '';
  categoryInput.value = saved.category || 'all';
  output.textContent = saved.output || output.textContent;
}

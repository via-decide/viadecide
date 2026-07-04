import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articles = [];
const articlesDir = path.join(__dirname, '../content/articles');

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.readdirSync(articlesDir).forEach(file => {
  if (!file.endsWith('.md')) return;
  
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  const { data } = matter(content);
  
  // Create object with en and hi structure as expected by the frontend
  const formattedData = {
    id: file.replace('.md', ''),
    title: { en: data.title || '', hi: data.title_hi || '' },
    excerpt: { en: data.excerpt || '', hi: data.excerpt_hi || '' },
    category: data.category || 'article',
    icon: data.icon || '📄',
    date: new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    rawDate: data.date,
    readTime: `${data.readTime || 5} min`,
    featured: data.featured || false,
    link: `/articles/${file.replace('.md', '')}`
  };
  
  articles.push(formattedData);
});

// Sort by date, featured first
articles.sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return new Date(b.rawDate) - new Date(a.rawDate);
});

fs.writeFileSync(
  path.join(__dirname, '../public/articles-index.json'),
  JSON.stringify(articles, null, 2)
);

console.log(`Built ${articles.length} articles successfully.`);

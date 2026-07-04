import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const indexPath = path.join(process.cwd(), 'public', 'articles-index.json');
    
    // Check if index exists (it should, generated at build time)
    if (!fs.existsSync(indexPath)) {
      return res.status(200).json({ articles: [], total: 0 });
    }
    
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    const { category = 'all', search = '', limit = 20, offset = 0 } = req.query;
    
    let filtered = index;
    
    if (category !== 'all') {
      filtered = filtered.filter(a => a.category === category);
    }
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a => 
        (a.title.en && a.title.en.toLowerCase().includes(s)) || 
        (a.excerpt.en && a.excerpt.en.toLowerCase().includes(s)) ||
        (a.title.hi && a.title.hi.toLowerCase().includes(s)) ||
        (a.excerpt.hi && a.excerpt.hi.toLowerCase().includes(s))
      );
    }
    
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json({
      articles: paginated,
      total: filtered.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

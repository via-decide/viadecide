import Database from 'better-sqlite3';
const db = new Database('./database/daxini.db');

const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();

if (reviews.length === 0) {
  console.log("No reviews yet.");
} else {
  console.log(`Found ${reviews.length} review(s):\n`);
  reviews.forEach(r => {
    console.log(`[${r.created_at}] ⭐ ${r.rating}/5 | ${r.name} (${r.context})`);
    if (r.email) console.log(`Email: ${r.email}`);
    console.log(`Review: ${r.review_text}`);
    console.log('-'.repeat(40));
  });
}

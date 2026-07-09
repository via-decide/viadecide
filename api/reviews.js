import fs from 'fs';
import path from 'path';
import os from 'os';

// Simple file-based store for the prototype to survive Vercel serverless cold starts.
// For persistent production storage, we'd connect to Vercel KV, Postgres, or Firebase here.

const tmpFile = path.join(os.tmpdir(), 'viadecide_reviews_prototype.json');

function getStore() {
  try {
    if (fs.existsSync(tmpFile)) {
      return JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading store', e);
  }
  return {};
}

function saveStore(store) {
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(store));
  } catch (e) {
    console.error('Error writing store', e);
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const { documentId, paragraphId } = req.query;

  if (!documentId) {
    return res.status(400).json({ error: 'Missing documentId' });
  }

  const reviewsStore = getStore();

  // Initialize document store if not exists
  if (!reviewsStore[documentId]) {
    reviewsStore[documentId] = {
      threads: {} // Keyed by paragraphId
    };
  }

  const docStore = reviewsStore[documentId];

  switch (method) {
    case 'GET':
      if (paragraphId) {
        // Get specific thread
        const thread = docStore.threads[paragraphId];
        if (thread) {
          res.status(200).json(thread);
        } else {
          res.status(404).json({ error: 'Thread not found' });
        }
      } else {
        // Get all threads for document
        res.status(200).json(docStore.threads);
      }
      break;

    case 'POST':
      // Create or add comment to a thread
      if (!paragraphId) {
        return res.status(400).json({ error: 'Missing paragraphId' });
      }

      const body = req.body;
      if (!docStore.threads[paragraphId]) {
        // Create new thread
        docStore.threads[paragraphId] = {
          paragraph_id: paragraphId,
          status: 'Open',
          severity: 'Information',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          comments: []
        };
      }

      const thread = docStore.threads[paragraphId];
      
      const newComment = {
        id: 'cmt_' + Math.random().toString(36).substr(2, 9),
        author: body.author || 'User',
        content: body.content,
        timestamp: new Date().toISOString(),
        ai_metadata: body.ai_metadata || null
      };

      thread.comments.push(newComment);
      thread.updated_at = new Date().toISOString();

      saveStore(reviewsStore);
      res.status(200).json(thread);
      break;

    case 'PUT':
      // Update thread status (e.g. Resolve)
      if (!paragraphId) {
        return res.status(400).json({ error: 'Missing paragraphId' });
      }

      const updateBody = req.body;
      const targetThread = docStore.threads[paragraphId];
      
      if (!targetThread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      if (updateBody.status) {
        targetThread.status = updateBody.status;
      }

      targetThread.updated_at = new Date().toISOString();
      saveStore(reviewsStore);
      res.status(200).json(targetThread);
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// Event Publisher Service
// In the ViaDecide Event-Driven Architecture, all domains emit events through this service.
// This service is responsible for validating the event schema and persisting it to the Event Store.
// From there, database triggers or pub/sub mechanisms fan out to Feed, Search, and Notifications.

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (Environment variables would be set in Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1. Authenticate Request
  // In production, we'd verify the JWT from Aporaksha Auth via req.headers.authorization
  const authHeader = req.headers.authorization;
  if (!authHeader && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized: Missing Aporaksha Token' });
  }

  // 2. Extract Event Payload
  const { workspace_id, project_id, actor_id, event_type, payload } = req.body;

  // Validation
  if (!project_id || !event_type || !payload) {
    return res.status(400).json({ error: 'Missing required fields (project_id, event_type, payload)' });
  }

  try {
    // 3. Persist Event to Store
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          workspace_id,
          project_id,
          actor_id,
          event_type,
          payload
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting event:', error);
      // For local prototype without actual DB connection, we just simulate success.
      if (supabaseUrl === 'https://mock.supabase.co') {
        return res.status(200).json({
          success: true,
          mocked: true,
          event: {
            id: 'evt_' + Math.random().toString(36).substr(2, 9),
            workspace_id,
            project_id,
            actor_id,
            event_type,
            payload,
            created_at: new Date().toISOString()
          }
        });
      }
      return res.status(500).json({ error: 'Failed to persist event' });
    }

    // 4. Return Success
    // (Feed builders, Search indexers, and Notification engines will listen to the DB triggers)
    res.status(200).json({ success: true, event: data });

  } catch (err) {
    console.error('Event publish error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

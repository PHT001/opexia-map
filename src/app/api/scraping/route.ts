import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hpunlrlvtkjifskigkca.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdW5scmx2dGtqaWZza2lna2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ1MDUyNSwiZXhwIjoyMDg3MDI2NTI1fQ.UynQWotxzA9aQfsl6dwwbz-fbXO1qInwb3BfBuw8tyE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, city, data, notes, status } = body;
    const task = body.task || `${type} scraping - ${city}`;
    const date = body.date || new Date().toISOString().split('T')[0];

    const { data: session, error } = await supabase.from('scraping_sessions').insert([{
      date,
      task,
      type,
      city,
      total_found: Array.isArray(data) ? data.length : 0,
      status: status || 'completed',
      data: data || [],
      notes: notes || '',
    }]).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

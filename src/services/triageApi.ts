import { ComplaintRecord, TriageResult } from '../types';

export async function triageSingleComplaint(
  rawText: string,
  metadata?: {
    channel?: string;
    department?: string;
    date?: string;
    location?: string;
  }
): Promise<{ triage: TriageResult; source: string; warning?: string }> {
  const res = await fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, metadata }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

export async function triageBatchComplaints(
  items: {
    id: string;
    rawText: string;
    channel?: string;
    departmentReported?: string;
    location?: string;
  }[]
): Promise<{ results: { id: string; triage?: TriageResult; error?: string; source?: string }[] }> {
  const res = await fetch('/api/triage-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'offline', hasApiKey: false, model: 'unknown' };
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false, model: 'unknown' };
  }
}

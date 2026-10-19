import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ComplaintRecord } from '../types';

export interface ParsedFileData {
  headers: string[];
  rows: Record<string, string>[];
  detectedMapping: {
    rawText: string;
    date?: string;
    patientId?: string;
    channel?: string;
    departmentReported?: string;
    location?: string;
  };
}

// Auto-detect columns based on common healthcare / CRM complaint fields
export function detectColumns(headers: string[]): ParsedFileData['detectedMapping'] {
  const norm = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  let rawText = '';
  let date: string | undefined;
  let patientId: string | undefined;
  let channel: string | undefined;
  let departmentReported: string | undefined;
  let location: string | undefined;

  for (const h of headers) {
    const n = norm(h);
    // Complaint text
    if (!rawText && (n.includes('complaint') || n.includes('feedback') || n.includes('comment') || n.includes('description') || n.includes('message') || n.includes('narrative') || n.includes('details') || n.includes('issue') || n.includes('text'))) {
      rawText = h;
    }
    // Date
    if (!date && (n.includes('date') || n.includes('time') || n.includes('created') || n.includes('received') || n.includes('timestamp'))) {
      date = h;
    }
    // Patient ID / MRN
    if (!patientId && (n.includes('patient') || n.includes('mrn') || n.includes('id') || n.includes('record') || n.includes('case'))) {
      patientId = h;
    }
    // Channel / Source
    if (!channel && (n.includes('channel') || n.includes('source') || n.includes('type') || n.includes('origin') || n.includes('intake') || n.includes('method'))) {
      channel = h;
    }
    // Department / Unit
    if (!departmentReported && (n.includes('department') || n.includes('dept') || n.includes('unit') || n.includes('service') || n.includes('specialty') || n.includes('clinic'))) {
      departmentReported = h;
    }
    // Location / Facility
    if (!location && (n.includes('location') || n.includes('facility') || n.includes('campus') || n.includes('site') || n.includes('hospital'))) {
      location = h;
    }
  }

  // Fallback if rawText not detected: pick the longest string column or first column
  if (!rawText && headers.length > 0) {
    rawText = headers[0];
  }

  return {
    rawText,
    date,
    patientId,
    channel,
    departmentReported,
    location,
  };
}

export async function parseFile(file: File): Promise<ParsedFileData> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  if (isExcel) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
      raw: false,
    });

    if (!jsonData || jsonData.length === 0) {
      throw new Error('The uploaded Excel file contains no records.');
    }

    const headers = Object.keys(jsonData[0]);
    const rows = jsonData.map((r) => {
      const rowClean: Record<string, string> = {};
      for (const k of headers) {
        rowClean[k] = String(r[k] || '').trim();
      }
      return rowClean;
    });

    return {
      headers,
      rows,
      detectedMapping: detectColumns(headers),
    };
  } else {
    // CSV parsing
    const text = await file.text();
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            reject(new Error('The uploaded CSV file is empty.'));
            return;
          }
          const headers = results.meta.fields || Object.keys(results.data[0]);
          resolve({
            headers,
            rows: results.data,
            detectedMapping: detectColumns(headers),
          });
        },
        error: (err: any) => reject(new Error(err.message || 'CSV Parsing failed')),
      });
    });
  }
}

export function convertRowsToRecords(
  rows: Record<string, string>[],
  mapping: ParsedFileData['detectedMapping']
): ComplaintRecord[] {
  return rows
    .map((row, idx) => {
      const text = row[mapping.rawText] || '';
      if (!text.trim()) return null;

      return {
        id: (mapping.patientId && row[mapping.patientId]) || `REC-${String(idx + 1).padStart(4, '0')}`,
        date: (mapping.date && row[mapping.date]) || new Date().toISOString().split('T')[0],
        patientId: (mapping.patientId && row[mapping.patientId]) || undefined,
        channel: (mapping.channel && row[mapping.channel]) || 'Direct Submission',
        departmentReported: (mapping.departmentReported && row[mapping.departmentReported]) || 'General',
        location: (mapping.location && row[mapping.location]) || undefined,
        rawText: text,
        status: 'pending' as const,
      };
    })
    .filter(Boolean) as ComplaintRecord[];
}

export function generateTemplateCSV(): string {
  const sampleRows = [
    {
      Complaint_ID: 'CMP-2026-001',
      Date: '2026-10-18',
      Channel: 'Emergency Dept Survey',
      Department: 'Emergency Medicine',
      Location: 'Metro General Pavilion',
      Complaint_Text: 'Patient arrived with acute chest pain and shortness of breath. Waited 2.5 hours without triage nurse taking initial vitals. Patient collapsed in the waiting room before receiving treatment.',
    },
    {
      Complaint_ID: 'CMP-2026-002',
      Date: '2026-10-17',
      Channel: 'Patient Portal Message',
      Department: 'Outpatient Pharmacy',
      Location: 'North Clinic',
      Complaint_Text: 'Prescription for pediatric Amoxicillin was filled with 10x the prescribed concentration. The error was caught by the mother at home before administration.',
    },
    {
      Complaint_ID: 'CMP-2026-003',
      Date: '2026-10-16',
      Channel: 'Billing Help Desk',
      Department: 'Revenue Cycle',
      Location: 'Main Campus',
      Complaint_Text: 'Received a collection notice for an anesthesiology bill that was previously confirmed as in-network by insurance under the No Surprises Act.',
    },
  ];

  return Papa.unparse(sampleRows);
}

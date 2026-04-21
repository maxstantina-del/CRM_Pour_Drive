import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import * as XLSX from 'xlsx';
import { ImportWizard } from './ImportWizard';

function makeXlsxFile(rows: Array<Record<string, string | number>>): File {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([buf], 'leads.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('ImportWizard', () => {
  it('parses XLSX and forwards leads with progress callback', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      Nom: `Lead ${i}`,
      Email: `l${i}@x.fr`,
      'Code Postal': '75001',
      Stage: 'Nouveau',
    }));
    const file = makeXlsxFile(rows);

    const onImport = vi.fn().mockImplementation(async (leads: any[], onProgress: any) => {
      onProgress({ processed: leads.length, total: leads.length });
      return { inserted: leads.length, errors: [] };
    });

    render(
      <ImportWizard
        isOpen
        onClose={() => {}}
        onImport={onImport}
        currentPipelineId="pipe-1"
        pipelines={[{ id: 'pipe-1', name: 'Main' }]}
      />
    );

    const input = document.getElementById('file-upload') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText('leads.xlsx'));

    // Auto-detection is strong (name + email) → mapping phase is skipped.
    fireEvent.click(screen.getByText('Importer'));

    await waitFor(() => expect(onImport).toHaveBeenCalled());
    const [parsedLeads] = onImport.mock.calls[0];
    expect(parsedLeads).toHaveLength(5);
    expect(parsedLeads[0]).toMatchObject({
      name: 'Lead 0',
      email: 'l0@x.fr',
      zipCode: '75001',
      stage: 'new',
      pipelineId: 'pipe-1',
    });

    await waitFor(() => screen.getByText('5 leads importés'));
  });
});

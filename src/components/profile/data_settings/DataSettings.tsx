import React, { useRef, useState } from 'react';
import './DataSettings.css';
import {
  ApiError,
  exportMyData,
  importMyData,
  getErrorMessage,
  type ImportSummary,
  type VisionBucketExport,
} from '../../../functions/firebase_backend';

// Self-contained data portability panel (Feature #10). The integrator drops this
// onto the profile page. Export downloads the signed-in user's data as JSON;
// import reads a .json file back and shows the imported/skipped summary.
const EXPORT_FILENAME = 'vision-bucket-export.json';

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'exported' }
  | { kind: 'imported'; summary: ImportSummary };

// Trigger a browser download of a JSON document via a temporary object URL.
const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const isExportDoc = (value: unknown): value is VisionBucketExport =>
  !!value && typeof value === 'object' && typeof (value as { version?: unknown }).version === 'number';

const countTotal = (counts: ImportSummary['imported']) =>
  counts.watchEntries + counts.diary + counts.reviews + counts.lists;

function DataSettings() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    setStatus({ kind: 'idle' });
    try {
      const data = await exportMyData();
      downloadJson(data, EXPORT_FILENAME);
      setStatus({ kind: 'exported' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setStatus({ kind: 'error', message: 'Please sign in to export your data.' });
      } else {
        setStatus({ kind: 'error', message: getErrorMessage(error, 'Unable to export your data.') });
      }
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so picking the same file again still fires onChange.
    event.target.value = '';
    if (!file) return;

    setImporting(true);
    setStatus({ kind: 'idle' });
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new ApiError('That file is not valid JSON.', 400, { code: 'invalid_file' });
      }
      if (!isExportDoc(parsed)) {
        throw new ApiError('That file is not a Vision Bucket export.', 400, { code: 'invalid_file' });
      }
      const summary = await importMyData(parsed);
      setStatus({ kind: 'imported', summary });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setStatus({ kind: 'error', message: 'Please sign in to import your data.' });
      } else {
        setStatus({ kind: 'error', message: getErrorMessage(error, 'Unable to import that file.') });
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="data-settings-card" aria-label="Import and export your data">
      <h3 className="data-settings-title">Your data</h3>
      <p className="data-settings-subtitle">
        Download everything you have logged, or restore it from a previous export.
      </p>

      <div className="data-settings-actions">
        <button
          type="button"
          className="data-settings-button"
          onClick={handleExport}
          disabled={exporting || importing}
        >
          {exporting ? 'Preparing…' : 'Export my data'}
        </button>

        <button
          type="button"
          className="data-settings-button data-settings-button-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={exporting || importing}
        >
          {importing ? 'Importing…' : 'Import from file'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="data-settings-file-input"
          onChange={handleFileChange}
          hidden
        />
      </div>

      {status.kind === 'error' && (
        <p className="data-settings-message data-settings-message-error" role="alert">
          {status.message}
        </p>
      )}
      {status.kind === 'exported' && (
        <p className="data-settings-message data-settings-message-success" role="status">
          Your data is downloading as {EXPORT_FILENAME}.
        </p>
      )}
      {status.kind === 'imported' && (
        <div className="data-settings-message data-settings-message-success" role="status">
          <p>
            Imported {countTotal(status.summary.imported)} item
            {countTotal(status.summary.imported) === 1 ? '' : 's'}
            {countTotal(status.summary.skipped) > 0
              ? `, skipped ${countTotal(status.summary.skipped)} duplicate${countTotal(status.summary.skipped) === 1 ? '' : 's'}.`
              : '.'}
          </p>
          <ul className="data-settings-breakdown">
            <li>Watch entries: {status.summary.imported.watchEntries} added, {status.summary.skipped.watchEntries} skipped</li>
            <li>Diary: {status.summary.imported.diary} added, {status.summary.skipped.diary} skipped</li>
            <li>Reviews: {status.summary.imported.reviews} added, {status.summary.skipped.reviews} skipped</li>
            <li>Lists: {status.summary.imported.lists} added, {status.summary.skipped.lists} skipped</li>
          </ul>
        </div>
      )}
    </section>
  );
}

export default DataSettings;

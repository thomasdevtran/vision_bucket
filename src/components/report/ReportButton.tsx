import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  reportContent,
  getErrorMessage,
  ApiError,
  ReportTargetType,
} from '../../functions/firebase_backend';
import '../../styles/report.css';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  // Optional label so the button reads naturally next to different content.
  label?: string;
  className?: string;
}

type Status = 'idle' | 'submitting' | 'done' | 'error';

const TARGET_LABEL: Record<ReportTargetType, string> = {
  review: 'review',
  thread: 'thread',
  comment: 'comment',
};

// A self-contained report control: a button that opens a reason dialog and
// posts the report. It handles sign-in (401) and duplicate (409) responses
// without leaking raw errors. The integrator drops it onto any content card.
const ReportButton: React.FC<ReportButtonProps> = ({ targetType, targetId, label, className }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const close = () => {
    setOpen(false);
    setReason('');
    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason.trim() || status === 'submitting') return;
    setStatus('submitting');
    setMessage('');
    try {
      await reportContent(targetType, targetId, reason.trim());
      setStatus('done');
      setMessage('Thanks — our moderators will take a look.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setStatus('error');
        setMessage('Please sign in to report content.');
        return;
      }
      if (error instanceof ApiError && error.status === 409) {
        setStatus('done');
        setMessage('You have already reported this. Thanks for flagging it.');
        return;
      }
      if (error instanceof ApiError && error.status === 404) {
        setStatus('error');
        setMessage('This content is no longer available.');
        return;
      }
      setStatus('error');
      setMessage(getErrorMessage(error, 'Could not submit your report. Please try again.'));
    }
  };

  return (
    <>
      <button
        type="button"
        className={`report-button ${className || ''}`.trim()}
        onClick={() => setOpen(true)}
      >
        {label || `Report ${TARGET_LABEL[targetType]}`}
      </button>

      {open && (
        <div className="report-dialog-overlay" role="dialog" aria-modal="true" aria-label="Report content">
          <div className="report-dialog">
            <h3 className="report-dialog-title">Report this {TARGET_LABEL[targetType]}</h3>

            {status === 'done' ? (
              <>
                <p className="report-dialog-note report-dialog-success">{message}</p>
                <div className="report-dialog-actions">
                  <button type="button" className="report-secondary" onClick={close}>Close</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="report-dialog-note">
                  Tell our moderators why this content should be reviewed.
                </p>
                <textarea
                  className="report-dialog-input"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reason (e.g. spam, harassment, spoilers)"
                  maxLength={1000}
                  rows={4}
                  autoFocus
                />
                {message && (
                  <p className={`report-dialog-note ${status === 'error' ? 'report-dialog-error' : ''}`}>
                    {message}
                    {status === 'error' && message.startsWith('Please sign in') && (
                      <>
                        {' '}
                        <button type="button" className="report-inline-link" onClick={() => navigate('/auth')}>
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                )}
                <div className="report-dialog-actions">
                  <button type="button" className="report-secondary" onClick={close}>Cancel</button>
                  <button
                    type="submit"
                    className="report-primary"
                    disabled={!reason.trim() || status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;

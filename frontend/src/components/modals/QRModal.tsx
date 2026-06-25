import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  sessionUrl: string;
}

declare const QRCode: any;

function QRModal({ open, onClose, sessionUrl }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);

  useEffect(() => {
    if (open && qrRef.current && !qrInstance.current) {
      qrRef.current.innerHTML = '';
      qrInstance.current = new QRCode(qrRef.current, {
        text: sessionUrl,
        width: 200,
        height: 200,
        colorDark: '#1e293b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
    if (!open) {
      qrInstance.current = null;
    }
  }, [open, sessionUrl]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <i className="fas fa-qrcode"></i>
          <h2>Escanea para unirte</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="qr-code-wrap">
            <div ref={qrRef}></div>
          </div>
          <div className="qr-link">
            <a href={sessionUrl} target="_blank" rel="noopener">{sessionUrl}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRModal;

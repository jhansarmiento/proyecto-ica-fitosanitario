type ToastMessageProps = {
  type?: 'success' | 'error' | 'info';
  message: string;
};

const typeStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

function ToastMessage({ type = 'info', message }: ToastMessageProps) {
  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${typeStyles[type]}`}>{message}</div>;
}

export default ToastMessage;

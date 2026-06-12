interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "加载失败", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-2xl px-lg text-center">
      <span className="text-4xl mb-md">⚠️</span>
      <h3 className="text-heading text-text-primary mb-xs">{message}</h3>
      <p className="text-body text-text-secondary mb-lg">网络连接异常，请检查网络后重试</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          重试
        </button>
      )}
    </div>
  );
}

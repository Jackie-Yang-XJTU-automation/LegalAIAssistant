interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon = "📋", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-2xl px-lg text-center">
      <span className="text-4xl mb-md">{icon}</span>
      <h3 className="text-heading text-text-primary mb-xs">{title}</h3>
      <p className="text-body text-text-secondary mb-lg max-w-text">{description}</p>
      {action && (
        action.href ? (
          <a href={action.href} className="btn-primary inline-block">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="btn-primary">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

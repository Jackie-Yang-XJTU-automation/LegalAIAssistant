export function PageSkeleton() {
  return (
    <div className="p-lg space-y-lg">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card space-y-sm">
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-sm">
      <div className="skeleton h-6 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-1/3" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="p-lg space-y-lg">
      <div className="skeleton h-8 w-64" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="flex gap-sm">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-8 w-20" />
        ))}
      </div>
      <div className="space-y-md">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card space-y-sm">
            <div className="skeleton h-5 w-1/3" />
            <div className="skeleton h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-md">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card flex items-center gap-md">
          <div className="skeleton h-3 w-3 rounded-full" />
          <div className="flex-1 space-y-sm">
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

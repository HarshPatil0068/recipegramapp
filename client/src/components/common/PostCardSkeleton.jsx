const PostCardSkeleton = () => {
  return (
    <div className="ig-card overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full bg-[rgb(var(--color-surface-muted))]" />
        <div className="flex-1">
          <div className="h-3 w-28 rounded-full bg-[rgb(var(--color-surface-muted))]" />
          <div className="mt-2 h-3 w-20 rounded-full bg-[rgb(var(--color-app))]" />
        </div>
      </div>
      <div className="aspect-square w-full bg-[rgb(var(--color-surface-muted))]" />
      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-[rgb(var(--color-surface-muted))]" />
          <div className="h-8 w-8 rounded-full bg-[rgb(var(--color-surface-muted))]" />
          <div className="h-8 w-8 rounded-full bg-[rgb(var(--color-surface-muted))]" />
        </div>
        <div className="h-3 w-24 rounded-full bg-[rgb(var(--color-surface-muted))]" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-[rgb(var(--color-surface-muted))]" />
          <div className="h-3 w-2/3 rounded-full bg-[rgb(var(--color-app))]" />
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;

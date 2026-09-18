export default function SuspendedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Account suspended</h1>
        <p className="text-sm text-muted-foreground">
          This account is suspended. If you think that&rsquo;s a mistake, contact support.
        </p>
      </div>
    </div>
  );
}

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-bold">Account suspended</h1>
        <p className="text-muted-foreground text-sm">
          Your account has been suspended. If you believe this is a mistake,
          please contact support.
        </p>
      </div>
    </div>
  );
}

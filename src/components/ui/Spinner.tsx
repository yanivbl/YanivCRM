export function Spinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div
      className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      role="status"
      aria-label="טוען"
    />
  );

  if (!fullScreen) return spinner;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {spinner}
    </div>
  );
}

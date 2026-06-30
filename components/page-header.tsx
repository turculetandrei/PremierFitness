export function PageHeader({
  titlu,
  subtitlu,
  children,
}: {
  titlu: string;
  subtitlu?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
          {titlu}
        </h1>
        {subtitlu && <p className="mt-1 text-sm text-muted">{subtitlu}</p>}
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}

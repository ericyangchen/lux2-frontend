export function ApplicationHeader({ title }: { title: string }) {
  return (
    <div className="md:flex md:items-center md:justify-between pb-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}

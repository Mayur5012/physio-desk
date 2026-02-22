interface Column<T> {
  key:       string;
  label:     string;
  render?:   (row: T, idx: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  keyField:   string;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
}

export default function Table<T extends Record<string, any>>({
  columns, data, keyField,
  emptyText = "No data found",
  emptyIcon,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-5 py-3 text-xs font-semibold 
                            text-gray-500 uppercase tracking-wide
                            ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center 
                                py-16 gap-2">
                  {emptyIcon && (
                    <div className="text-gray-200">{emptyIcon}</div>
                  )}
                  <p className="text-sm text-gray-400">{emptyText}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row[keyField]}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-3.5 text-sm text-gray-700
                                ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

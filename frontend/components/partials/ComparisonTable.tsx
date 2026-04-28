import { cn } from "@/lib/utils";

type LegacyComparisonRow = {
  label: string;
  before: string;
  after: string;
};

type MatrixComparisonRow = {
  cells?: ReadonlyArray<string>;
};

function isMatrixRow(row: LegacyComparisonRow | MatrixComparisonRow): row is MatrixComparisonRow {
  return "cells" in row;
}

/**
 * Editorial comparison table used in insight content. Supports the legacy
 * before/after shape and the richer header/cell matrix coming from Sanity.
 */
export function ComparisonTable({
  headers,
  beforeLabel = "Before",
  afterLabel = "After",
  rows,
  className,
  highlightColumnIndex,
}: {
  headers?: ReadonlyArray<string>;
  beforeLabel?: string;
  afterLabel?: string;
  rows: ReadonlyArray<LegacyComparisonRow | MatrixComparisonRow>;
  className?: string;
  highlightColumnIndex?: number;
}) {
  const fallbackHeaders = ["Metric", beforeLabel, afterLabel];
  const normalizedRows = rows.map((row) =>
    isMatrixRow(row) ? [...(row.cells ?? [])] : [row.label, row.before, row.after],
  );

  const inferredColumnCount = normalizedRows.reduce(
    (largest, row) => Math.max(largest, row.length),
    fallbackHeaders.length,
  );
  const columnCount = Math.max(headers?.length ?? 0, inferredColumnCount);

  const normalizedHeaders = Array.from({ length: columnCount }, (_, index) => {
    return headers?.[index] ?? fallbackHeaders[index] ?? `Column ${index + 1}`;
  });

  const detectedCostColumn = normalizedHeaders.findIndex((header) =>
    /cost|price|budget|investment|fee/i.test(header),
  );
  const resolvedHighlightColumn =
    highlightColumnIndex ??
    (detectedCostColumn >= 0 ? detectedCostColumn : normalizedHeaders.length >= 5 ? 2 : -1);

  const getCellClasses = (columnIndex: number, isHeader: boolean) =>
    cn(
      "border-b border-r border-black/8 px-4 py-3 text-left align-middle dark:border-white/10",
      columnIndex === 0
        ? "min-w-45 font-medium text-black dark:text-white"
        : "min-w-30 text-black/78 dark:text-white/76",
      isHeader
        ? "bg-[#f4efe9] font-mono text-[11px] uppercase tracking-[0.18em] text-black/55 dark:bg-white/[0.07] dark:text-white/55"
        : "bg-white text-[14px] leading-[1.4] md:text-64 dark:bg-[#111111]",
      columnIndex === resolvedHighlightColumn &&
        (isHeader
          ? "bg-brand text-white dark:bg-brand dark:text-white"
          : "bg-[#ffe3d8] font-medium text-brand dark:bg-brand/20 dark:text-white"),
      columnIndex === normalizedHeaders.length - 1 && "border-r-0",
    );

  return (
    <div
      className={cn(
        "w-full overflow-x-auto border border-black/8 bg-[#fbf8f4] shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[#0d0d0d]",
        className,
      )}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {normalizedHeaders.map((header, index) => (
              <th key={`${header}-${index}`} scope="col" className={getCellClasses(index, true)}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {normalizedRows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`}>
              {Array.from({ length: normalizedHeaders.length }, (_, columnIndex) => {
                const cell = row[columnIndex] ?? "";
                const cellClasses = getCellClasses(columnIndex, false);

                if (columnIndex === 0) {
                  return (
                    <th key={`${cell}-${columnIndex}`} scope="row" className={cellClasses}>
                      {cell}
                    </th>
                  );
                }

                return (
                  <td key={`${cell}-${columnIndex}`} className={cellClasses}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

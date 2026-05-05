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
      "px-4 py-3.5 text-center align-middle font-funnel text-black dark:text-white",
      isHeader
        ? "font-funnel text-[18px] font-normal uppercase text-black"
        : "text-[14px] leading-[1.5] border-t border-dark-light dark:border-decoration-light",
      columnIndex === resolvedHighlightColumn &&
        (isHeader
          ? "bg-brand text-black"
          : "font-funnel text-brand"),
    );

  return (
    <div
      className={cn(
        "w-full overflow-x-auto dark:bg-dark",
        className,
      )}
    >
      <table className="min-w-full text-center">
        <thead className="bg-white-dark dark:bg-dark-light">
          <tr>
            {normalizedHeaders.map((header, index) => (
              <th key={`${header}-${index}`} scope="col" className={getCellClasses(index, true)}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="dark:bg-black bg-white">
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

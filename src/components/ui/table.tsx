import React from 'react';
import { cn } from '../../lib/utils';

export function TableContainer({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border bg-surface shadow-subtle', className)} {...props}>
      {children}
    </div>
  );
}

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cn('w-full caption-bottom text-sm border-collapse', className)} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-surface-subtle border-b border-border text-foreground-secondary text-xs uppercase tracking-wider font-semibold', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-border/60 bg-surface', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('table-row-hover transition-colors duration-150', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('h-10 px-4 text-left align-middle font-medium text-foreground-secondary [&:has([role=checkbox])]:pr-0', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0 text-foreground', className)} {...props}>
      {children}
    </td>
  );
}

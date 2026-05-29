import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import Pagination from '@/components/ui/pagination'
import { Loader } from '@/components/ui/loader'

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange = () => {},
  onLimitChange = () => {},
  showSearch = false,
  onSearch = () => {},
}) {
  return (
    <div className="bg-white border border-slate-250/70 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-auto datatable-scroll max-h-[520px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key || col.accessor} className="py-4 px-6">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <TableRow key={row.id || row._id || idx}>
                  {columns.map((col) => (
                    <TableCell key={(col.key || col.accessor) + (row.id || row._id || idx)} className="py-4 px-6">
                      {col.render ? col.render(row) : (col.accessor ? row[col.accessor] : '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-slate-400 font-medium">
                  {loading ? (
                    <div className="flex justify-center">
                      <Loader size="lg" spinnerOnly = {true} />
                    </div>
                  ) : (
                    'No records found.'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        displayData={data}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  )
}

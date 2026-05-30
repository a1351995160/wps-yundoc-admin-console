type PaginationControlsProps = Readonly<{
  page: number
  hasMore: boolean
  loading?: boolean
  onPageChange: (page: number) => void
}>

export function PaginationControls({
  page,
  hasMore,
  loading = false,
  onPageChange
}: PaginationControlsProps) {
  return (
    <div className="pagination-controls" aria-label="分页">
      <button
        type="button"
        disabled={loading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </button>
      <span>第 {page} 页</span>
      <button
        type="button"
        disabled={loading || !hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </button>
    </div>
  )
}

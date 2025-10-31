'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PaginationMeta } from '@/app/(protected)/products/_types' // Generic enough to be reused
import { useCallback } from 'react'

interface PaginationControlsProps {
  pagination: PaginationMeta
  isLoading: boolean
}

export default function PaginationControls({ pagination, isLoading }: PaginationControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      router.push(`${pathname}?${createQueryString({ page: newPage })}`, { scroll: false })
    }
  }

  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => handlePageChange(pagination.page - 1)} 
          disabled={pagination.page <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handlePageChange(pagination.page + 1)} 
          disabled={pagination.page >= pagination.totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

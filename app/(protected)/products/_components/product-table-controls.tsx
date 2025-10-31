
'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface ProductTableControlsProps {
  distinctCategories: string[]
  distinctStatuses: string[]
  search: string
  category: string
  status: string
  setSearch: (value: string) => void
  setCategory: (value: string) => void
  setStatus: (value: string) => void
}

export default function ProductTableControls({
  distinctCategories,
  distinctStatuses,
  search,
  category,
  status,
  setSearch,
  setCategory,
  setStatus,
}: ProductTableControlsProps) {
  const handleReset = () => {
    setSearch('')
    setCategory('')
    setStatus('')
  }

  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
        <Select onValueChange={setCategory} value={category}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {distinctCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {distinctStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleReset} variant="outline">
        Reset
      </Button>
    </div>
  )
}

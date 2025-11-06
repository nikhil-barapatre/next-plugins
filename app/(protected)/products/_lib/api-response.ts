import { NextResponse } from 'next/server'
import { ZodIssue } from 'zod'
import type { ApiResponse } from '../_types'

export function successResponse<T>(
  data: T,
  options?: { status?: number; meta?: ApiResponse<T>['meta'] },
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: options?.meta,
    },
    { status: options?.status || 200 },
  )
}

export const ErrorResponses = {
  unauthorized: () =>
    NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
  validationError: (errors: ZodIssue[]) =>
    NextResponse.json({ success: false, errors }, { status: 400 }),
  internalError: (message?: string) =>
    NextResponse.json(
      { success: false, error: message || 'Internal Server Error' },
      { status: 500 },
    ),
  notFound: (message?: string) =>
    NextResponse.json(
      { success: false, error: message || 'Not Found' },
      { status: 404 },
    ),
}

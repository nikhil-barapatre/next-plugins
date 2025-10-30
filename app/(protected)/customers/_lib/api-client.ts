import type { ApiResponse, GetCustomersParams, PaginationMeta, Customer } from '../_types/index'
import type { CustomerFormData } from '../_validations/customer'

// Client-side API functions for components
export async function getCustomers(params: GetCustomersParams = {}): Promise<{
  customers: Customer[]
  pagination: PaginationMeta
}> {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','))
      } else {
        queryParams.set(key, String(value))
      }
    }
  })

  const response = await fetch(`/api/customers?${queryParams}`)
  const result: ApiResponse<{ customers: Customer[]; pagination: PaginationMeta }> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch customers')
  }

  return result.data
}

export async function getCustomerById(customerId: string): Promise<Customer> {
  const response = await fetch(`/api/customers?id=${customerId}`)
  const result: ApiResponse<Customer> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch customer')
  }

  return result.data as Customer
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Customer> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to create customer')
  }

  return result.data
}

export async function updateCustomer(customerId: string, data: CustomerFormData): Promise<Customer> {
  const response = await fetch(`/api/customers?id=${customerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Customer> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to update customer')
  }

  return result.data
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const response = await fetch(`/api/customers?id=${customerId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    let errorMessage = 'Failed to delete customer';
    try {
      const errorResult = await response.json();
      if (errorResult.error) {
        errorMessage = errorResult.error;
      }
    } catch (e) {
      // If parsing JSON fails (e.g., no body or invalid JSON), use generic message
    }
    throw new Error(errorMessage);
  }

  return;
}

export type { Customer };

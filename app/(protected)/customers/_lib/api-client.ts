import { CustomerApiData, CustomerFormData } from '../_validations/customer';
import type { Customer, PaginationMeta } from '../_types';

export class ValidationError extends Error {
  constructor(public issues: { path: (string | number)[]; message: string }[]) {
    super("Validation failed");
    this.name = 'ValidationError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    if (data.errors) {
      throw new ValidationError(data.errors);
    }
    throw new Error(data.error || "An unexpected error occurred.");
  }
  return data.data;
}

export async function createCustomer(data: CustomerApiData): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Customer>(response);
}

export async function updateCustomer(id: string, data: CustomerApiData): Promise<Customer> {
  const response = await fetch(`/api/customers?id=${id}` , {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Customer>(response);
}

// You might also need a function to get a single customer
export async function getCustomer(id: string): Promise<Customer> {
  const response = await fetch(`/api/customers?id=${id}`);
  return handleResponse<Customer>(response);
}

// And a function to list customers, which you might already have
export async function getCustomers(params: { page?: number; pageSize?: number; search?: string, status?: string } = {}): Promise<{ customers: Customer[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
  
    const response = await fetch(`/api/customers?${queryParams.toString()}`);
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch customers");
    }
  
    return { customers: data.data, pagination: data.meta };
  }
  

export async function deleteCustomer(id: string): Promise<void> {
    const response = await fetch(`/api/customers?id=${id}`, {
      method: 'DELETE',
    });
  
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete customer");
    }
    // No data to return on successful deletion
  }

  export async function getCustomerStats() {
    const response = await fetch('/api/customers/stats');
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch customer stats');
    }
    return result.data;
  }
  

export type { Customer, CustomerFormData };







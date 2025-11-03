import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { customerApiSchema } from "../../(protected)/customers/_validations/customer";
import { getCustomers } from "../../(protected)/customers/_lib/server-api";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const { customers, pagination } = await getCustomers({
      page,
      pageSize,
      search,
      status,
    });

    return NextResponse.json({ 
      success: true, 
      data: customers, 
      meta: pagination 
    });
  } catch (error) {
    console.error("[CUSTOMERS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = customerApiSchema.parse(body);

    const customer = await prisma.customer.create({
      data,
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    console.error("[CUSTOMERS_POST]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const data = customerApiSchema.parse(body);

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    console.error("[CUSTOMERS_PUT]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CUSTOMERS_DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

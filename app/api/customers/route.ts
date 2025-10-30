import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { customerSchema } from "../../(protected)/customers/_validations/customer";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error("[CUSTOMERS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = customerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
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
    const { name, email, phone, address } = customerSchema.parse(body);

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
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

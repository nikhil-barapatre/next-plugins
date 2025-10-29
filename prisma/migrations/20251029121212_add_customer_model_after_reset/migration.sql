-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(255) NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "sku" VARCHAR(100),
    "barcode" VARCHAR(100),
    "price" DECIMAL(10,2) NOT NULL,
    "discounted_price" DECIMAL(10,2),
    "stock" INTEGER DEFAULT 0,
    "category" VARCHAR(100),
    "sub_category" VARCHAR(100),
    "status" VARCHAR(20) DEFAULT 'DRAFT',
    "in_stock" BOOLEAN DEFAULT true,
    "charge_tax" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" VARCHAR(255) NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" VARCHAR(255),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

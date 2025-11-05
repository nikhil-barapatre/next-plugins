# CRUD Generator - Quick Start Guide

## 🚀 3-Step Process

### Step 1: Run Generator (1 minute)
```bash
npm run generate:crud
```

**What you'll see:**
```
📋 Available tables:
   1. users
   2. products
   3. orders

📋 Selection: 1

✅ Generate CRUD files? (Y/n): y
```

**Result:** Generates 9 files + 1 implementation guide

---

### Step 2: Copy Code Snippets (3 minutes)

Open the generated file:
```
app/(protected)/users/IMPLEMENTATION.txt
```

Copy and paste **5 code snippets** to these files:

| Step | File to Create/Update | Lines | Action |
|------|----------------------|-------|---------|
| 1️⃣ | `lib/server/users.ts` | 30 | Create new file |
| 2️⃣ | `app/api/users/route.ts` | 150 | Create new file |
| 3️⃣ | `app/(protected)/users/page.tsx` | 25 | Replace content |
| 4️⃣ | `app/(protected)/layout.tsx` | 10 | Add link |
| 5️⃣ | `prisma/schema.prisma` | 20 | Add model (optional) |

**All code is ready to copy-paste!** No modifications needed.

---

### Step 3: Run & Test (30 seconds)
```bash
npm run dev
```

Visit: `http://localhost:3000/users`

**You should see:**
- ✅ List of users
- ✅ Create button
- ✅ Search bar
- ✅ Filter by status
- ✅ Edit/Delete actions
- ✅ Pagination

---

## 📖 Selection Options

### Select by Numbers
```bash
📋 Selection: 1,3,5
```
Generates tables #1, #3, and #5

### Select by Names
```bash
📋 Selection: users,orders
```
Generates `users` and `orders` modules

### Select All
```bash
📋 Selection: 1,2,3,4,5
```
Generates all available tables

---

## 🎯 What Gets Generated

For table **"users"**, you get:

```
app/(protected)/users/
├── _components/
│   ├── user-client-page.tsx     [180 lines] ✅
│   ├── user-list.tsx             [90 lines]  ✅
│   ├── user-form.tsx             [120 lines] ✅
│   └── user-form-dialog.tsx      [60 lines]  ✅
├── _lib/
│   └── api-client.ts             [130 lines] ✅
├── _types/
│   └── index.ts                  [30 lines]  ✅
├── _validations/
│   └── user.ts                   [40 lines]  ✅
├── page.tsx                      [30 lines]  ⚠️ Needs update
├── tsconfig.json                 [10 lines]  ✅
└── IMPLEMENTATION.txt            [300 lines] 📖 Your guide!
```

**Total:** ~690 lines of production-ready code!

---

## 💡 Pro Tips

### Tip 1: Use Dry Run First
```bash
npm run generate:crud -- --dry-run
```
Preview files without creating them

### Tip 2: Generate Multiple at Once
```bash
📋 Selection: 1,2,3
```
Saves time when building multiple modules

### Tip 3: Keep Implementation Guide
Don't delete `IMPLEMENTATION.txt` - it's your reference for:
- API route logic
- Search functionality
- Filter implementation
- Pagination setup

### Tip 4: Customize After Generation
All generated files are yours to modify:
- Add more filters
- Change table columns
- Enhance validation
- Add custom actions

---

## 🐛 Common Issues

### Issue 1: "Table not found"
**Fix:** Check your `EXTERNAL_DB_URL` in `.env`
```bash
EXTERNAL_DB_URL="postgresql://user:pass@host:5432/db"
```

### Issue 2: TypeScript Errors
**Fix:** Install missing UI components
```bash
npx shadcn@latest add select switch dialog
```

### Issue 3: Import Errors
**Fix:** Run Prisma generate
```bash
npx prisma generate
```

### Issue 4: Wrong Directory Name
**Fix:** Delete and regenerate (pluralization is now fixed!)
```bash
rm -rf app/(protected)/userses
npm run generate:crud  # Select: users
```

---

## 📝 Example: Full Workflow

```bash
# 1. Set up external DB
echo 'EXTERNAL_DB_URL="postgresql://..."' >> .env

# 2. Run generator
npm run generate:crud

# Interactive prompts:
✅ Connected to database
📋 Available tables:
   1. users
   2. orders
   3. products

📋 Selection: 1

✅ Generate CRUD files? (Y/n): y

# 3. Open implementation guide
code app/(protected)/users/IMPLEMENTATION.txt

# 4. Copy snippets
# → Create lib/server/users.ts
# → Create app/api/users/route.ts
# → Update page.tsx
# → Add navigation link

# 5. Generate Prisma client
npx prisma generate

# 6. Run dev server
npm run dev

# 7. Test
# Visit: http://localhost:3000/users
# ✅ Working CRUD interface!
```

---

## 🎓 Next Steps

After your first module works:

1. **Customize UI**
   - Edit form layouts
   - Add more table columns
   - Enhance filters

2. **Add Features**
   - Bulk actions
   - Export to CSV
   - Advanced search

3. **Optimize**
   - Add caching
   - Optimize queries
   - Add indexes

4. **Generate More**
   - Repeat for other tables
   - Build your full admin panel

---

## ⚡ Speed Run (for experienced users)

```bash
# Generate
npm run generate:crud
# Select: users

# Copy 5 snippets from IMPLEMENTATION.txt
# 1. lib/server/users.ts
# 2. app/api/users/route.ts
# 3. Update page.tsx
# 4. Add nav link
# 5. Add Prisma model (optional)

# Generate & run
npx prisma generate && npm run dev

# Done! 🎉
```

**Total time:** ~5 minutes per module

---

## 📚 Documentation

- **Full Guide**: `lib/generators/README.md`
- **Updates**: `GENERATOR_UPDATES.md`
- **Architecture**: `CLAUDE.md`

---

## 🆘 Need Help?

1. Check `IMPLEMENTATION.txt` in your module directory
2. Read `lib/generators/README.md`
3. Review existing modules: `customers` or `products`
4. Run with `--dry-run` to preview

---

**Ready to build?** Run `npm run generate:crud` now! 🚀

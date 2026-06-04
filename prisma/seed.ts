import 'dotenv/config'
import { PrismaClient, DiscountType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// Seed runs as a CLI script — use the direct (non-pooled) URL to avoid pooler DDL restrictions
const connectionString = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding UniFlex Store…')

  // ─── Cleanup (sequential — $transaction batch not supported with pg adapter) ──
  await db.couponUsage.deleteMany()
  await db.reviewImage.deleteMany()
  await db.review.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.wishlistItem.deleteMany()
  await db.productTag.deleteMany()
  await db.productCategory.deleteMany()
  await db.productImage.deleteMany()
  await db.productVariant.deleteMany()
  await db.product.deleteMany()
  await db.tag.deleteMany()
  await db.category.deleteMany()
  await db.coupon.deleteMany()
  await db.banner.deleteMany()
  await db.address.deleteMany()
  await db.account.deleteMany()
  await db.session.deleteMany()
  await db.user.deleteMany()

  // ─── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  const custHash = await bcrypt.hash('Test@1234', 12)

  const [admin, alice, bob, carol] = await Promise.all([
    db.user.create({
      data: {
        name: 'Store Admin',
        email: 'admin@uniflexstore.com',
        passwordHash: adminHash,
        emailVerified: new Date(),
        role: 'ADMIN',
      },
    }),
    db.user.create({
      data: {
        name: 'Alice Chen',
        email: 'alice@example.com',
        passwordHash: custHash,
        emailVerified: new Date(),
      },
    }),
    db.user.create({
      data: {
        name: 'Bob Martinez',
        email: 'bob@example.com',
        passwordHash: custHash,
        emailVerified: new Date(),
      },
    }),
    db.user.create({
      data: {
        name: 'Carol Williams',
        email: 'carol@example.com',
        passwordHash: custHash,
        emailVerified: new Date(),
      },
    }),
  ])

  console.log('✅ Users created')

  // ─── Addresses ─────────────────────────────────────────────────────────────
  await db.address.createMany({
    data: [
      { userId: alice.id, label: 'Home', line1: '142 Oak Ave', city: 'Austin', state: 'TX', postalCode: '73301', isDefault: true },
      { userId: bob.id, label: 'Home', line1: '88 Maple St', city: 'Portland', state: 'OR', postalCode: '97201', isDefault: true },
      { userId: carol.id, label: 'Home', line1: '55 Pine Rd', city: 'Brooklyn', state: 'NY', postalCode: '11201', isDefault: true },
    ],
  })

  // ─── Categories ────────────────────────────────────────────────────────────
  const electronics = await db.category.create({
    data: { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, audio, cameras and smart home devices', sortOrder: 1 },
  })
  const fashion = await db.category.create({
    data: { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, bags and accessories for every occasion', sortOrder: 2 },
  })
  const beauty = await db.category.create({
    data: { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup, haircare and wellness products', sortOrder: 3 },
  })
  const toys = await db.category.create({
    data: { name: 'Toys', slug: 'toys', description: 'Games, learning kits and outdoor play for all ages', sortOrder: 4 },
  })

  // Sub-categories
  const subCats = await db.category.createMany({
    data: [
      // Electronics
      { name: 'Phones & Tablets', slug: 'phones-tablets', parentId: electronics.id, sortOrder: 1 },
      { name: 'Laptops & Computers', slug: 'laptops-computers', parentId: electronics.id, sortOrder: 2 },
      { name: 'Audio & Headphones', slug: 'audio-headphones', parentId: electronics.id, sortOrder: 3 },
      { name: 'Cameras & Photography', slug: 'cameras-photography', parentId: electronics.id, sortOrder: 4 },
      { name: 'Smart Home', slug: 'smart-home', parentId: electronics.id, sortOrder: 5 },
      { name: 'Wearables', slug: 'wearables', parentId: electronics.id, sortOrder: 6 },
      // Fashion
      { name: "Women's Clothing", slug: 'womens-clothing', parentId: fashion.id, sortOrder: 1 },
      { name: "Men's Clothing", slug: 'mens-clothing', parentId: fashion.id, sortOrder: 2 },
      { name: 'Shoes & Boots', slug: 'shoes-boots', parentId: fashion.id, sortOrder: 3 },
      { name: 'Bags & Accessories', slug: 'bags-accessories', parentId: fashion.id, sortOrder: 4 },
      { name: 'Jewelry & Watches', slug: 'jewelry-watches', parentId: fashion.id, sortOrder: 5 },
      { name: 'Activewear', slug: 'activewear', parentId: fashion.id, sortOrder: 6 },
      // Beauty
      { name: 'Skincare', slug: 'skincare', parentId: beauty.id, sortOrder: 1 },
      { name: 'Makeup', slug: 'makeup', parentId: beauty.id, sortOrder: 2 },
      { name: 'Haircare', slug: 'haircare', parentId: beauty.id, sortOrder: 3 },
      { name: 'Fragrance', slug: 'fragrance', parentId: beauty.id, sortOrder: 4 },
      { name: 'Bath & Body', slug: 'bath-body', parentId: beauty.id, sortOrder: 5 },
      { name: 'Tools & Brushes', slug: 'tools-brushes', parentId: beauty.id, sortOrder: 6 },
      // Toys
      { name: 'Action & Adventure', slug: 'action-adventure', parentId: toys.id, sortOrder: 1 },
      { name: 'Arts & Crafts', slug: 'arts-crafts', parentId: toys.id, sortOrder: 2 },
      { name: 'Board Games', slug: 'board-games', parentId: toys.id, sortOrder: 3 },
      { name: 'Educational', slug: 'educational', parentId: toys.id, sortOrder: 4 },
      { name: 'Outdoor Play', slug: 'outdoor-play', parentId: toys.id, sortOrder: 5 },
      { name: 'Baby & Toddler', slug: 'baby-toddler', parentId: toys.id, sortOrder: 6 },
    ],
  })

  console.log('✅ Categories created')

  // ─── Tags ──────────────────────────────────────────────────────────────────
  const [tagNew, tagHot, tagSale, tagFeatured, tagLimited] = await Promise.all([
    db.tag.create({ data: { name: 'New', slug: 'new' } }),
    db.tag.create({ data: { name: 'Hot', slug: 'hot' } }),
    db.tag.create({ data: { name: 'Sale', slug: 'sale' } }),
    db.tag.create({ data: { name: 'Featured', slug: 'featured' } }),
    db.tag.create({ data: { name: 'Limited', slug: 'limited' } }),
  ])

  // ─── Products — Electronics ────────────────────────────────────────────────
  const macBook = await db.product.create({
    data: {
      name: 'ProBook Air 15',
      slug: 'probook-air-15',
      description: 'Ultra-thin 15" laptop with 18-hour battery, fanless design, and pro-grade display. Ships with 1-year warranty.',
      price: 1299.00,
      compareAt: 1499.00,
      sku: 'ELEC-LT-001',
      stock: 48,
      isFeatured: true,
      attributes: { cpu: 'A3 Chip 12-core', ram: '16GB', storage: '512GB SSD', display: '15.3" Liquid Retina', weight: '2.9 lbs' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'ProBook Air 15 front', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800', alt: 'ProBook Air 15 side', sortOrder: 1 },
      ]},
      variants: { create: [
        { name: 'Storage', value: '256GB', price: 1099.00, stock: 20, sku: 'ELEC-LT-001-256' },
        { name: 'Storage', value: '512GB', price: 1299.00, stock: 18, sku: 'ELEC-LT-001-512' },
        { name: 'Storage', value: '1TB', price: 1499.00, stock: 10, sku: 'ELEC-LT-001-1TB' },
      ]},
      categories: { create: { categoryId: electronics.id } },
      tags: { create: [{ tagId: tagFeatured.id }, { tagId: tagNew.id }] },
    },
  })

  const xPhone = await db.product.create({
    data: {
      name: 'XPhone 17 Pro',
      slug: 'xphone-17-pro',
      description: 'Flagship smartphone with 200MP camera system, 5G, and titanium build. Free express shipping.',
      price: 999.00,
      sku: 'ELEC-PH-001',
      stock: 120,
      isFeatured: true,
      attributes: { display: '6.3" OLED ProMotion', camera: '200MP + 48MP + 12MP', battery: '4800mAh', storage: '256GB', color: 'Titanium Black' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', alt: 'XPhone 17 Pro', sortOrder: 0 },
      ]},
      variants: { create: [
        { name: 'Color', value: 'Titanium Black', stock: 40, sku: 'ELEC-PH-001-BLK' },
        { name: 'Color', value: 'Desert Gold', stock: 40, sku: 'ELEC-PH-001-GLD' },
        { name: 'Color', value: 'Glacier White', stock: 40, sku: 'ELEC-PH-001-WHT' },
      ]},
      categories: { create: { categoryId: electronics.id } },
      tags: { create: [{ tagId: tagHot.id }, { tagId: tagNew.id }] },
    },
  })

  const buds = await db.product.create({
    data: {
      name: 'SoundPods Pro 3',
      slug: 'soundpods-pro-3',
      description: 'Active noise-cancelling earbuds with 36h total battery, spatial audio, and IPX5 water resistance.',
      price: 249.00,
      compareAt: 299.00,
      sku: 'ELEC-AU-001',
      stock: 200,
      attributes: { anc: 'Adaptive ANC', battery: '9h + 27h case', codec: 'LDAC / AAC', waterproof: 'IPX5' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', alt: 'SoundPods Pro 3', sortOrder: 0 },
      ]},
      variants: { create: [
        { name: 'Color', value: 'Midnight Black', stock: 80, sku: 'ELEC-AU-001-BLK' },
        { name: 'Color', value: 'Pearl White', stock: 80, sku: 'ELEC-AU-001-WHT' },
        { name: 'Color', value: 'Navy Blue', stock: 40, sku: 'ELEC-AU-001-NVY' },
      ]},
      categories: { create: { categoryId: electronics.id } },
      tags: { create: [{ tagId: tagSale.id }] },
    },
  })

  // ─── Products — Fashion ────────────────────────────────────────────────────
  const jacket = await db.product.create({
    data: {
      name: 'Heritage Field Jacket',
      slug: 'heritage-field-jacket',
      description: 'Water-resistant waxed cotton jacket with corduroy collar and four utility pockets. Made in USA.',
      price: 285.00,
      sku: 'FASH-JK-001',
      stock: 60,
      isFeatured: true,
      attributes: { material: 'Waxed cotton', fit: 'Regular', care: 'Spot clean only', origin: 'USA' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', alt: 'Heritage Field Jacket front', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800', alt: 'Heritage Field Jacket back', sortOrder: 1 },
      ]},
      variants: { create: [
        { name: 'Size', value: 'S', stock: 10, sku: 'FASH-JK-001-S' },
        { name: 'Size', value: 'M', stock: 20, sku: 'FASH-JK-001-M' },
        { name: 'Size', value: 'L', stock: 20, sku: 'FASH-JK-001-L' },
        { name: 'Size', value: 'XL', stock: 10, sku: 'FASH-JK-001-XL' },
      ]},
      categories: { create: { categoryId: fashion.id } },
      tags: { create: [{ tagId: tagFeatured.id }, { tagId: tagLimited.id }] },
    },
  })

  const sneakers = await db.product.create({
    data: {
      name: 'Velocity Runner V2',
      slug: 'velocity-runner-v2',
      description: 'Responsive foam midsole, breathable knit upper. Ideal for daily runs and casual wear.',
      price: 129.00,
      compareAt: 159.00,
      sku: 'FASH-SH-001',
      stock: 90,
      attributes: { material: 'Knit upper / foam sole', drop: '8mm', closure: 'Lace-up', category: 'Running' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Velocity Runner V2', sortOrder: 0 },
      ]},
      variants: { create: [
        { name: 'Size', value: '7', stock: 15, sku: 'FASH-SH-001-7' },
        { name: 'Size', value: '8', stock: 20, sku: 'FASH-SH-001-8' },
        { name: 'Size', value: '9', stock: 25, sku: 'FASH-SH-001-9' },
        { name: 'Size', value: '10', stock: 20, sku: 'FASH-SH-001-10' },
        { name: 'Size', value: '11', stock: 10, sku: 'FASH-SH-001-11' },
      ]},
      categories: { create: { categoryId: fashion.id } },
      tags: { create: [{ tagId: tagSale.id }, { tagId: tagHot.id }] },
    },
  })

  // ─── Products — Beauty ─────────────────────────────────────────────────────
  const serum = await db.product.create({
    data: {
      name: 'Luminous Vitamin C Serum',
      slug: 'luminous-vitamin-c-serum',
      description: '15% L-Ascorbic Acid + Hyaluronic Acid serum. Brightens, firms, and fades dark spots in 4 weeks. Dermatologist tested.',
      price: 64.00,
      sku: 'BEAU-SK-001',
      stock: 300,
      isFeatured: true,
      attributes: { skinType: 'All skin types', concerns: 'Brightening, Anti-aging, Dark spots', size: '1 fl oz', spf: 'None' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', alt: 'Luminous Vitamin C Serum', sortOrder: 0 },
      ]},
      variants: { create: [
        { name: 'Size', value: '0.5 fl oz (trial)', price: 34.00, stock: 100, sku: 'BEAU-SK-001-SM' },
        { name: 'Size', value: '1 fl oz', price: 64.00, stock: 150, sku: 'BEAU-SK-001-REG' },
        { name: 'Size', value: '2 fl oz (value)', price: 112.00, stock: 50, sku: 'BEAU-SK-001-LG' },
      ]},
      categories: { create: { categoryId: beauty.id } },
      tags: { create: [{ tagId: tagHot.id }, { tagId: tagFeatured.id }] },
    },
  })

  const lipstick = await db.product.create({
    data: {
      name: 'Velvet Matte Lipstick',
      slug: 'velvet-matte-lipstick',
      description: 'Long-wearing 12-hour formula. Enriched with vitamin E and shea butter for comfortable matte wear.',
      price: 28.00,
      sku: 'BEAU-MK-001',
      stock: 400,
      attributes: { finish: 'Matte', wear: '12 hours', skinType: 'All', vegan: 'Yes', crueltyfree: 'Yes' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2928?w=800', alt: 'Velvet Matte Lipstick', sortOrder: 0 },
      ]},
      variants: { create: [
        { name: 'Shade', value: 'Ruby Crush', stock: 80, sku: 'BEAU-MK-001-RUB' },
        { name: 'Shade', value: 'Mauve Dusk', stock: 80, sku: 'BEAU-MK-001-MAU' },
        { name: 'Shade', value: 'Nude Beige', stock: 80, sku: 'BEAU-MK-001-NUD' },
        { name: 'Shade', value: 'Berry Wine', stock: 80, sku: 'BEAU-MK-001-BER' },
        { name: 'Shade', value: 'Coral Bliss', stock: 80, sku: 'BEAU-MK-001-COR' },
      ]},
      categories: { create: { categoryId: beauty.id } },
      tags: { create: [{ tagId: tagNew.id }] },
    },
  })

  // ─── Products — Toys ───────────────────────────────────────────────────────
  const lego = await db.product.create({
    data: {
      name: 'ArchiBricks City Square 1200',
      slug: 'archibricks-city-square-1200',
      description: '1,200-piece modular city building set. Compatible with all major brick brands. Ages 8+.',
      price: 79.00,
      sku: 'TOYS-BG-001',
      stock: 150,
      isFeatured: true,
      attributes: { pieces: '1200', ageRange: '8+', theme: 'City', compatible: 'Major brick brands', difficulty: 'Medium' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', alt: 'ArchiBricks City Square', sortOrder: 0 },
      ]},
      categories: { create: { categoryId: toys.id } },
      tags: { create: [{ tagId: tagHot.id }, { tagId: tagFeatured.id }] },
    },
  })

  const artKit = await db.product.create({
    data: {
      name: 'Young Artist Pro Kit',
      slug: 'young-artist-pro-kit',
      description: '72-piece art set including watercolors, acrylics, colored pencils, and brushes. Non-toxic. Ages 6+.',
      price: 39.00,
      compareAt: 52.00,
      sku: 'TOYS-ART-001',
      stock: 200,
      attributes: { pieces: '72', ageRange: '6+', includes: 'Watercolors, Acrylics, Pencils, Brushes', nontoxic: 'Yes' },
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', alt: 'Young Artist Pro Kit', sortOrder: 0 },
      ]},
      categories: { create: { categoryId: toys.id } },
      tags: { create: [{ tagId: tagSale.id }, { tagId: tagNew.id }] },
    },
  })

  console.log('✅ Products created')

  // ─── Reviews ───────────────────────────────────────────────────────────────
  await db.review.createMany({
    data: [
      { productId: macBook.id, userId: alice.id, rating: 5, title: 'Best laptop I have owned', body: 'Fast, silent, and the battery actually lasts all day. Worth every cent.', verified: true },
      { productId: macBook.id, userId: bob.id, rating: 4, title: 'Great but expensive', body: 'Build quality is excellent. Would love a cheaper storage option.', verified: true },
      { productId: xPhone.id, userId: carol.id, rating: 5, title: 'Camera is insane', body: 'Night mode photos look like professional shots. Highly recommend.', verified: true },
      { productId: serum.id, userId: alice.id, rating: 5, title: 'Visible results in 3 weeks', body: 'My skin is noticeably brighter and dark spots have faded. Love it.', verified: true },
      { productId: jacket.id, userId: bob.id, rating: 5, title: 'Heirloom quality', body: 'This will last decades. The wax repels light rain perfectly.', verified: true },
      { productId: lego.id, userId: carol.id, rating: 5, title: 'Kids love it', body: 'My 9-year-old built it in a weekend. Great instructions, zero missing pieces.', verified: true },
    ],
  })

  console.log('✅ Reviews created')

  // ─── Coupons ───────────────────────────────────────────────────────────────
  await db.coupon.createMany({
    data: [
      { code: 'WELCOME15', discountType: DiscountType.PERCENTAGE, value: 15, minOrderAmt: 50, maxUses: 1000, expiresAt: new Date('2027-01-01') },
      { code: 'SUMMER25', discountType: DiscountType.PERCENTAGE, value: 25, minOrderAmt: 100, maxUses: 500, expiresAt: new Date('2026-09-01') },
      { code: 'FREESHIP', discountType: DiscountType.FIXED_AMOUNT, value: 9.99, minOrderAmt: 40 },
      { code: 'VIP50', discountType: DiscountType.FIXED_AMOUNT, value: 50, minOrderAmt: 200, maxUses: 100 },
    ],
  })

  // ─── Banners ───────────────────────────────────────────────────────────────
  await db.banner.createMany({
    data: [
      { title: 'Summer Sale — Up to 30% off', subtitle: 'Limited time · Free shipping on orders $49+', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600', linkUrl: '/deals', linkLabel: 'Shop deals', isActive: true, sortOrder: 1 },
      { title: 'New Electronics Drop', subtitle: 'ProBook Air · XPhone 17 · SoundPods Pro', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600', linkUrl: '/categories/electronics', linkLabel: 'Explore', isActive: true, sortOrder: 2 },
    ],
  })

  console.log('✅ Coupons & banners created')
  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Test accounts:')
  console.log('  Admin  → admin@uniflexstore.com  / Admin@1234')
  console.log('  Alice  → alice@example.com       / Test@1234')
  console.log('  Bob    → bob@example.com         / Test@1234')
  console.log('  Carol  → carol@example.com       / Test@1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())

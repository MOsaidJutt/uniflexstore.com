export const siteConfig = {
  name: 'UniFlex Store',
  description:
    'Premium multi-category US e-commerce — Electronics, Fashion, Beauty, Toys and more.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://uniflexstore.com',
  ogImage: '/opengraph-image',
  links: {
    twitter: 'https://twitter.com/uniflexstore',
    instagram: 'https://instagram.com/uniflexstore',
  },
}

export const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, audio, cameras and smart home devices',
    subcategories: [
      { name: 'Phones & Tablets', slug: 'phones-tablets' },
      { name: 'Laptops & Computers', slug: 'laptops-computers' },
      { name: 'Audio & Headphones', slug: 'audio-headphones' },
      { name: 'Cameras & Photography', slug: 'cameras-photography' },
      { name: 'Smart Home', slug: 'smart-home' },
      { name: 'Wearables', slug: 'wearables' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, bags and accessories for every occasion',
    subcategories: [
      { name: "Women's Clothing", slug: 'womens-clothing' },
      { name: "Men's Clothing", slug: 'mens-clothing' },
      { name: 'Shoes & Boots', slug: 'shoes-boots' },
      { name: 'Bags & Accessories', slug: 'bags-accessories' },
      { name: 'Jewelry & Watches', slug: 'jewelry-watches' },
      { name: 'Activewear', slug: 'activewear' },
    ],
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, makeup, haircare and wellness products',
    subcategories: [
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Makeup', slug: 'makeup' },
      { name: 'Haircare', slug: 'haircare' },
      { name: 'Fragrance', slug: 'fragrance' },
      { name: 'Bath & Body', slug: 'bath-body' },
      { name: 'Tools & Brushes', slug: 'tools-brushes' },
    ],
  },
  {
    name: 'Toys',
    slug: 'toys',
    description: 'Games, learning kits and outdoor play for all ages',
    subcategories: [
      { name: 'Action & Adventure', slug: 'action-adventure' },
      { name: 'Arts & Crafts', slug: 'arts-crafts' },
      { name: 'Board Games', slug: 'board-games' },
      { name: 'Educational', slug: 'educational' },
      { name: 'Outdoor Play', slug: 'outdoor-play' },
      { name: 'Baby & Toddler', slug: 'baby-toddler' },
    ],
  },
]

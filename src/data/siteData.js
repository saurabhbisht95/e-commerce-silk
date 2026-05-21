/**
 * siteData.js — Centralized content/data for Doon Silk
 * All text, links, and product data lives here for easy updates.
 */

/* ---- Navigation ---- */
export const NAV_LINKS = [
  { label: 'Fabric',      href: '/fabric' },
  { label: 'Kurta',       href: '/kurta' },
  { label: 'Saree',       href: '/saree' },
  { label: 'Muffler',     href: '/muffler' },
  { label: 'Collections', href: '/collections' },
]

/* ---- Top Strip Messages ---- */
export const TOP_STRIP_MESSAGES = [
  'Handwoven in Doon Valley',
  'Free Shipping on Orders Above ₹1999',
  'Worldwide Delivery',
]

/* ---- Categories ---- */
export const CATEGORIES = [
  {
    id: 'fabric',
    label: 'Fabric',
    href: '/fabric',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    alt: 'Doon Silk Fabric — Colorful woven silk',
  },
  {
    id: 'kurta',
    label: 'Kurta',
    href: '/kurta',
    image: 'https://images.unsplash.com/photo-1612436148248-e8f8e55b3a35?w=400&q=80',
    alt: 'Classic Kurta — Indian man in traditional kurta',
  },
  {
    id: 'saree',
    label: 'Saree',
    href: '/saree',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
    alt: 'Silk Saree — Indian woman in elegant saree',
  },
  {
    id: 'muffler',
    label: 'Muffler',
    href: '/muffler',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80',
    alt: 'Silk Muffler — Handwoven muffler scarf',
  },
]

import slider1Main from '../assets/slider1main.webp'
import slider1Side from '../assets/slider1side.webp'
import slider2Main from '../assets/slider2main.webp'
import slider2Side from '../assets/slider2side.webp'
import slider3Main from '../assets/slider3main.webp'
import slider3Side from '../assets/slider3side.webp'

/* ---- Hero Slides ---- */
export const HERO_SLIDES = [
  {
    id: 1,
    headline: ['Woven in Doon.', 'Rooted in Tradition.'],
    subtext: 'Pure silks. Timeless weaves.\nThoughtful creations.',
    cta: 'Explore Collection',
    ctaHref: '/collections',
    modelImage: slider1Main,
    sideImage: slider1Side,
  },
  {
    id: 2,
    headline: ['Crafted by Hand.', 'Worn with Pride.'],
    subtext: 'Each thread tells a story\nof Uttarakhand heritage.',
    cta: 'Shop Sarees',
    ctaHref: '/saree',
    modelImage: slider2Main,
    sideImage: slider2Side,
  },
  {
    id: 3,
    headline: ['The Soul of Doon,', 'Woven in Silk.'],
    subtext: 'Born in the serene valleys\nof Uttarakhand.',
    cta: 'Our Story',
    ctaHref: '/about',
    modelImage: slider3Main,
    sideImage: slider3Side,
  },
]

/* ---- Collections ---- */
export const COLLECTIONS = [
  {
    id: 'ivory',
    name: 'Ivory',
    label: 'Collection',
    tagline: 'Timeless. Pure.\nAlways Classic.',
    cta: 'Shop Now',
    href: '/collections/ivory',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
    theme: { bg: '#C8B89A', text: '#2C2C2C' },
  },
  {
    id: 'royal-red',
    name: 'Royal Red',
    label: 'Collection',
    tagline: 'Bold. Regal.\nUnforgettable.',
    cta: 'Shop Now',
    href: '/collections/royal-red',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    theme: { bg: '#6E1E1E', text: '#F5E9DC' },
    featured: true,
  },
  {
    id: 'himalayan-blue',
    name: 'Himalayan Blue',
    label: 'Collection',
    tagline: 'Calm. Elegant.\nNaturally You.',
    cta: 'Shop Now',
    href: '/collections/himalayan-blue',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80',
    theme: { bg: '#2C4A6E', text: '#F5E9DC' },
  },
]

/* ---- Featured Products ---- */
export const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Doon Silk Fabric',
    variant: 'Mehndi Green',
    price: '₹1,299 / Meter',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 2,
    name: 'Classic Silk Kurta',
    variant: 'Ivory',
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1612436148248-e8f8e55b3a35?w=400&q=80',
  },
  {
    id: 3,
    name: 'Zari Woven Silk Saree',
    variant: 'Champagne Gold',
    price: '₹8,499',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
  },
  {
    id: 4,
    name: 'Silk Muffler',
    variant: 'Indigo Weave',
    price: '₹1,299',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80',
  },
  {
    id: 5,
    name: 'Doon Silk Fabric',
    variant: 'Lilac Blush',
    price: '₹1,299 / Meter',
    image: 'https://images.unsplash.com/photo-1558618047-f4e80c849f82?w=400&q=80',
  },
  {
    id: 6,
    name: 'Doon Silk Saree',
    variant: 'Deep Maroon',
    price: '₹6,499',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80',
  },
]

/* ---- Trust / Value Strip ---- */
export const TRUST_ITEMS = [
  { id: 'silk',     icon: '✦', title: 'Pure Silk',         desc: '100% Natural\nAnd Premium' },
  { id: 'craft',    icon: '✿', title: 'Handcrafted',       desc: 'By Skilled Artisans\nOf Uttarakhand' },
  { id: 'dyes',     icon: '❋', title: 'Natural Dyes',      desc: 'Eco-Friendly &\nSkin Safe' },
  { id: 'delivery', icon: '◈', title: 'Worldwide Delivery', desc: 'Bringing Doon\nTo Your Doorstep' },
  { id: 'payment',  icon: '◉', title: 'Secure Payment',    desc: 'Safe, Fast &\nReliable' },
]

/* ---- Footer Links ---- */
export const FOOTER_SHOP = ['Fabric', 'Kurta', 'Saree', 'Muffler', 'Collections', 'Gift Cards']
export const FOOTER_CARE = ['About Us', 'Our Journey', 'Shipping & Delivery', 'Returns & Exchanges', 'FAQ', 'Contact Us']
export const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com' },
  { name: 'Facebook',  href: 'https://facebook.com' },
  { name: 'Pinterest', href: 'https://pinterest.com' },
  { name: 'YouTube',   href: 'https://youtube.com' },
]
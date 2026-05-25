import { useCallback, useEffect, useMemo, useState } from 'react'
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products'
import { cartApi } from '../api/cart'
import { getBackendProductId, normalizeProduct, normalizeProducts, productApi } from '../api/products'
import { wishlistApi } from '../api/wishlist'
import { CommerceContext } from './commerceContext'

const fallbackProducts = normalizeProducts(STATIC_PRODUCTS)

const cartItemToProduct = item => {
  const snapshot = item.productSnapshot || {}
  const product = item.product || {}

  return normalizeProduct({
    ...product,
    id: product.legacyId || product.id || product._id || item.product,
    mongoId: product.mongoId || product._id || item.product,
    name: snapshot.name || product.name,
    category: product.category?.name || product.category,
    price: product.displayPrice || `₹${Number(item.priceSnapshot || 0).toLocaleString('en-IN')}`,
    image: snapshot.image || product.images?.[0]?.url,
    imageLarge: snapshot.image || product.images?.[1]?.url || product.images?.[0]?.url,
    quantity: item.quantity,
  })
}

export function CommerceProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts.slice(0, 10))
  const [cart, setCart] = useState(null)
  const [wishlist, setWishlist] = useState(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [apiError, setApiError] = useState(null)

  const refreshCart = useCallback(async () => {
    try {
      const nextCart = await cartApi.get()
      setCart(nextCart)
      return nextCart
    } catch (error) {
      setApiError(error.message)
      return null
    }
  }, [])

  const refreshWishlist = useCallback(async () => {
    try {
      const nextWishlist = await wishlistApi.get()
      setWishlist(nextWishlist)
      return nextWishlist
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [catalogResult, featuredResult, nextCart, nextWishlist] = await Promise.all([
          productApi.list({ limit: 100, sort: 'newest' }),
          productApi.featured(10),
          cartApi.get().catch(() => null),
          wishlistApi.get().catch(() => null),
        ])

        if (!isMounted) return
        setProducts(catalogResult.products.length ? catalogResult.products : fallbackProducts)
        setFeaturedProducts(featuredResult.length ? featuredResult : catalogResult.products.slice(0, 10))
        setCart(nextCart)
        setWishlist(nextWishlist)
        setApiError(null)
      } catch (error) {
        if (!isMounted) return
        setProducts(fallbackProducts)
        setFeaturedProducts(fallbackProducts.slice(0, 10))
        setApiError(error.message)
      } finally {
        if (isMounted) setIsCatalogLoading(false)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const addToCart = useCallback(async product => {
    const productId = getBackendProductId(product)
    if (!productId) return null

    const nextCart = await cartApi.addItem({ productId, quantity: 1 })
    setCart(nextCart)
    return nextCart
  }, [])

  const updateCartItem = useCallback(async ({ productId, variantSku, quantity }) => {
    const nextCart = await cartApi.updateItem({ productId, variantSku, quantity })
    setCart(nextCart)
    return nextCart
  }, [])

  const removeCartItem = useCallback(async ({ productId, variantSku }) => {
    const nextCart = await cartApi.removeItem({ productId, variantSku })
    setCart(nextCart)
    return nextCart
  }, [])

  const addToWishlist = useCallback(async product => {
    const productId = getBackendProductId(product)
    if (!productId) return null

    try {
      const nextWishlist = await wishlistApi.add(productId)
      setWishlist(nextWishlist)
      return nextWishlist
    } catch (error) {
      setApiError(error.message)
      return null
    }
  }, [])

  const removeFromWishlist = useCallback(async product => {
    const productId = getBackendProductId(product)
    if (!productId) return null

    try {
      const nextWishlist = await wishlistApi.remove(productId)
      setWishlist(nextWishlist)
      return nextWishlist
    } catch (error) {
      setApiError(error.message)
      return null
    }
  }, [])

  const cartProducts = useMemo(() => (cart?.items || []).map(cartItemToProduct), [cart])
  const wishlistProducts = useMemo(() => normalizeProducts(wishlist?.products || []), [wishlist])
  const cartCount = useMemo(
    () => (cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cart]
  )

  const value = useMemo(
    () => ({
      products,
      featuredProducts,
      cart,
      cartProducts,
      cartCount,
      wishlist,
      wishlistProducts,
      isCatalogLoading,
      apiError,
      addToCart,
      updateCartItem,
      removeCartItem,
      addToWishlist,
      removeFromWishlist,
      refreshCart,
      refreshWishlist,
    }),
    [
      products,
      featuredProducts,
      cart,
      cartProducts,
      cartCount,
      wishlist,
      wishlistProducts,
      isCatalogLoading,
      apiError,
      addToCart,
      updateCartItem,
      removeCartItem,
      addToWishlist,
      removeFromWishlist,
      refreshCart,
      refreshWishlist,
    ]
  )

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
}

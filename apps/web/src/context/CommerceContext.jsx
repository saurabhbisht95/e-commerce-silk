import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products'
import { cartApi } from '../api/cart'
import { getBackendProductId, normalizeProduct, normalizeProducts, productApi } from '../api/products'
import { wishlistApi } from '../api/wishlist'
import { CommerceContext } from './commerceContext'
import { useAuth } from './authContext'
import { useToast } from './toastContext'
import { toUserMessage } from '../utils/apiMessages'

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
  const toast = useToast()
  const { user } = useAuth()
  const hasShownCatalogError = useRef(false)
  const [products, setProducts] = useState(fallbackProducts)
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts.slice(0, 10))
  const [cart, setCart] = useState(null)
  const [wishlist, setWishlist] = useState(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [isCartUpdating, setIsCartUpdating] = useState(false)
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false)
  const [apiError, setApiError] = useState(null)

  const refreshCart = useCallback(async () => {
    try {
      const nextCart = await cartApi.get()
      setCart(nextCart)
      return nextCart
    } catch (error) {
      setApiError(error.message)
      toast.error(toUserMessage(error, 'Unable to load cart.'))
      return null
    }
  }, [toast])

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(null)
      return null
    }

    try {
      const nextWishlist = await wishlistApi.get()
      setWishlist(nextWishlist)
      return nextWishlist
    } catch {
      return null
    }
  }, [user])

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
        if (!hasShownCatalogError.current) {
          toast.warning('Backend is not reachable right now. Showing the saved catalog until the API reconnects.')
          hasShownCatalogError.current = true
        }
      } finally {
        if (isMounted) setIsCatalogLoading(false)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [toast])

  useEffect(() => {
    let isMounted = true

    Promise.all([
      cartApi.get().catch(() => null),
      user ? wishlistApi.get().catch(() => null) : Promise.resolve(null),
    ])
      .then(([nextCart, nextWishlist]) => {
        if (!isMounted) return
        if (!user || nextCart) setCart(nextCart)
        setWishlist(nextWishlist)
      })
      .catch(() => null)

    return () => {
      isMounted = false
    }
  }, [user])

  const addToCart = useCallback(async product => {
    const productId = getBackendProductId(product)
    if (!productId) {
      toast.error('This product is not available for checkout yet.')
      return null
    }

    setIsCartUpdating(true)
    try {
      const nextCart = await cartApi.addItem({ productId, quantity: 1 })
      setCart(nextCart)
      toast.success(`${product.name || 'Product'} added to cart.`)
      return nextCart
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not add this product to cart.'))
      return null
    } finally {
      setIsCartUpdating(false)
    }
  }, [toast])

  const updateCartItem = useCallback(async ({ productId, variantSku, quantity }) => {
    if (!productId || Number(quantity) < 1) {
      toast.error('Quantity must be at least 1.')
      return null
    }

    setIsCartUpdating(true)
    try {
      const nextCart = await cartApi.updateItem({ productId, variantSku, quantity })
      setCart(nextCart)
      toast.success('Cart updated.')
      return nextCart
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not update the cart.'))
      return null
    } finally {
      setIsCartUpdating(false)
    }
  }, [toast])

  const removeCartItem = useCallback(async ({ productId, variantSku }) => {
    if (!productId) {
      toast.error('This cart item is missing a valid product id.')
      return null
    }

    setIsCartUpdating(true)
    try {
      const nextCart = await cartApi.removeItem({ productId, variantSku })
      setCart(nextCart)
      toast.success('Item removed from cart.')
      return nextCart
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not remove this item from cart.'))
      return null
    } finally {
      setIsCartUpdating(false)
    }
  }, [toast])

  const applyCoupon = useCallback(async code => {
    const normalizedCode = String(code || '').trim().toUpperCase()
    if (!normalizedCode) {
      toast.warning('Enter a coupon code.')
      return null
    }

    setIsCartUpdating(true)
    try {
      const nextCart = await cartApi.applyCoupon(normalizedCode)
      setCart(nextCart)
      toast.success(`Coupon ${normalizedCode} applied.`)
      return nextCart
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not apply this coupon.'))
      return null
    } finally {
      setIsCartUpdating(false)
    }
  }, [toast])

  const removeCoupon = useCallback(async () => {
    setIsCartUpdating(true)
    try {
      const nextCart = await cartApi.removeCoupon()
      setCart(nextCart)
      toast.success('Coupon removed.')
      return nextCart
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not remove this coupon.'))
      return null
    } finally {
      setIsCartUpdating(false)
    }
  }, [toast])

  const addToWishlist = useCallback(async product => {
    if (!user) {
      toast.warning('Please sign in to save products to your wishlist.')
      return null
    }

    const productId = getBackendProductId(product)
    if (!productId) {
      toast.error('This product cannot be saved yet.')
      return null
    }

    setIsWishlistUpdating(true)
    try {
      const nextWishlist = await wishlistApi.add(productId)
      setWishlist(nextWishlist)
      toast.success(`${product.name || 'Product'} saved to wishlist.`)
      return nextWishlist
    } catch (error) {
      setApiError(error.message)
      toast.error(toUserMessage(error, 'Could not save this product to wishlist.'))
      return null
    } finally {
      setIsWishlistUpdating(false)
    }
  }, [toast, user])

  const removeFromWishlist = useCallback(async product => {
    const productId = getBackendProductId(product)
    if (!productId) {
      toast.error('This wishlist item is missing a valid product id.')
      return null
    }

    setIsWishlistUpdating(true)
    try {
      const nextWishlist = await wishlistApi.remove(productId)
      setWishlist(nextWishlist)
      toast.success('Removed from wishlist.')
      return nextWishlist
    } catch (error) {
      setApiError(error.message)
      toast.error(toUserMessage(error, 'Could not update your wishlist.'))
      return null
    } finally {
      setIsWishlistUpdating(false)
    }
  }, [toast])

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
      isCartUpdating,
      isWishlistUpdating,
      apiError,
      addToCart,
      updateCartItem,
      removeCartItem,
      applyCoupon,
      removeCoupon,
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
      isCartUpdating,
      isWishlistUpdating,
      apiError,
      addToCart,
      updateCartItem,
      removeCartItem,
      applyCoupon,
      removeCoupon,
      addToWishlist,
      removeFromWishlist,
      refreshCart,
      refreshWishlist,
    ]
  )

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
}

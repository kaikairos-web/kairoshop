-- KairoShop Row Level Security Policies
-- Run after schema.sql

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_blocked = false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is not blocked
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_blocked = false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id AND is_blocked = false)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- PRODUCTS (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- WISHLIST
CREATE POLICY "Users manage own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id AND public.is_active_user())
  WITH CHECK (auth.uid() = user_id AND public.is_active_user());

-- CART
CREATE POLICY "Users manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id AND public.is_active_user())
  WITH CHECK (auth.uid() = user_id AND public.is_active_user());

-- ORDERS
CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_active_user());

CREATE POLICY "Admins update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users insert order items for own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- Storage bucket for product images (run in dashboard or via API)
-- INSERT policy: admins only upload to product-images bucket

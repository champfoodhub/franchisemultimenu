-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.branch_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  branch_id uuid,
  product_id uuid,
  stock integer,
  discount integer CHECK (discount <= 30),
  is_available boolean DEFAULT true,
  CONSTRAINT branch_products_pkey PRIMARY KEY (id),
  CONSTRAINT branch_products_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT branch_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.branches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hq_id uuid,
  location text,
  is_active boolean DEFAULT true,
  CONSTRAINT branches_pkey PRIMARY KEY (id),
  CONSTRAINT branches_hq_id_fkey FOREIGN KEY (hq_id) REFERENCES public.headquarters(id)
);
CREATE TABLE public.headquarters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT headquarters_pkey PRIMARY KEY (id)
);
CREATE TABLE public.menu (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT menu_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hq_id uuid,
  name text,
  base_price numeric,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_hq_id_fkey FOREIGN KEY (hq_id) REFERENCES public.headquarters(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text,
  role text CHECK (role = ANY (ARRAY['HQ_ADMIN'::text, 'BRANCH_MANAGER'::text])),
  hq_id uuid,
  branch_id uuid,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
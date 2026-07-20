-- Course store: courses + orders
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'course', -- 'course' | 'method'
  level TEXT NOT NULL DEFAULT 'Beginner',
  price_cents INTEGER NOT NULL,
  cover_image TEXT,
  lessons INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  what_you_get JSONB NOT NULL DEFAULT '[]'::jsonb,
  download_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  email TEXT NOT NULL,
  buyer_name TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | delivered
  delivery_status TEXT NOT NULL DEFAULT 'not_sent', -- not_sent | sent | failed
  delivery_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Migration to create nail designer booking schema

CREATE TABLE
  users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('designer', 'client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
  );

CREATE TABLE
  services (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
  );

CREATE TABLE
  working_hours (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME,
    end_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (day_of_week)
  );

CREATE TABLE
  blocked_dates (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
  );

CREATE TABLE
  bookings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services (id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
  );

CREATE INDEX idx_bookings_client_id ON bookings (client_id);

CREATE INDEX idx_bookings_service_id ON bookings (service_id);

CREATE INDEX idx_bookings_date ON bookings (booking_date);

INSERT INTO
  working_hours (day_of_week, start_time, end_time, is_closed)
VALUES
  (0, NULL, NULL, TRUE),
  (1, '09:00', '18:00', FALSE),
  (2, '09:00', '18:00', FALSE),
  (3, '09:00', '18:00', FALSE),
  (4, '09:00', '18:00', FALSE),
  (5, '09:00', '18:00', FALSE),
  (6, '09:00', '14:00', FALSE);

INSERT INTO
  services (name, description, duration_minutes, price, is_active)
VALUES
  ('Manicure Simples', 'Cuidado completo das unhas das mãos', 45, 45.00, TRUE),
  ('Pedicure Simples', 'Cuidado completo das unhas dos pés', 50, 50.00, TRUE),
  ('Unha em Gel', 'Aplicação de esmaltação em gel', 90, 90.00, TRUE),
  (
    'Alongamento de Unhas',
    'Alongamento com fibra ou acrigel',
    120,
    150.00,
    TRUE
  );

INSERT INTO
  users (name, email, password_hash, role)
VALUES
  (
    'Designer',
    'designer@nail.app',
    '8c8a3ba4994ba51e52c3a5117321ec64a0da9c4ae96efc254f697777c693aeec',
    'designer'
  );

-- Track admin confirmation and customer confirmation email delivery on appointments.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS confirmed_by_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_recipient text;

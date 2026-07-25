-- Contacts and FAQs tables for functional pages

-- Contacts table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- FAQs table for storing frequently asked questions
CREATE TABLE IF NOT EXISTS faqs (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_faqs_order ON faqs(order_index ASC);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, order_index) VALUES
  ('How do I enroll in a course?', 'You can enroll in any course directly from the course page. Simply click the "Enroll Now" button and complete the payment process. You will have instant access to all course materials.', 'Courses', 1),
  ('What is your refund policy?', 'We offer a 7-day money-back guarantee. If you are not satisfied with your course within 7 days of purchase, we will issue a full refund.', 'Billing', 2),
  ('Can I download course materials?', 'Yes, all course materials including videos, PDFs, and resources can be downloaded for offline access through your dashboard.', 'Courses', 3),
  ('How do I get a certificate?', 'Upon completing 100% of a course, you will automatically receive a completion certificate that you can download and share.', 'Certificates', 4),
  ('Is there a lifetime access?', 'Yes, once enrolled, you have lifetime access to all course materials and future updates at no additional cost.', 'Courses', 5),
  ('How can I contact support?', 'You can reach our support team through the contact form on our website or email us at support@weathpath.com. We typically respond within 24 hours.', 'Support', 6),
  ('Do you offer team licenses?', 'Yes, we offer special pricing for team licenses. Please contact our sales team for enterprise solutions and bulk pricing.', 'Billing', 7),
  ('What payment methods do you accept?', 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal for course payments.', 'Billing', 8)
ON CONFLICT DO NOTHING;

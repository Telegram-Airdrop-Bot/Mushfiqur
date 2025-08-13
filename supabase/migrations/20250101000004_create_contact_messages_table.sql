-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_messages table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
CREATE POLICY "Admins can manage all contact messages" ON public.contact_messages
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can create contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);

-- Add comments for documentation
COMMENT ON TABLE public.contact_messages IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN public.contact_messages.status IS 'Message status: unread, read, replied, archived';
COMMENT ON COLUMN public.contact_messages.admin_notes IS 'Admin notes and internal comments about the message'; 
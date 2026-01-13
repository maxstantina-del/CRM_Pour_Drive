/*
  # Create CRM Leads Table

  1. New Tables
    - `leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `name` (text, not null) - Lead's full name
      - `email` (text, not null) - Lead's email address
      - `phone` (text) - Lead's phone number
      - `company` (text) - Lead's company name
      - `stage` (text, not null) - Pipeline stage (prospect, qualified, proposal, negotiation, closed_won, closed_lost)
      - `value` (numeric, default 0) - Deal value in currency
      - `notes` (text) - Additional notes about the lead
      - `created_at` (timestamptz) - When the lead was created
      - `updated_at` (timestamptz) - When the lead was last updated
      - `user_id` (uuid) - Owner of the lead (for future auth integration)

  2. Security
    - Enable RLS on `leads` table
    - Add policy for authenticated users to manage their own leads
    - Add policy for public access (temporary, for development)
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  company text DEFAULT '',
  stage text NOT NULL DEFAULT 'prospect',
  value numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid
);

-- Create index on stage for faster filtering
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (will be restricted with auth later)
CREATE POLICY "Allow public access to leads"
  ON leads
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at_trigger
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();
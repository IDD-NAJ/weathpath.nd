-- Add rejection_reason column to content_drafts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='content_drafts' 
        AND column_name='rejection_reason'
    ) THEN
        ALTER TABLE content_drafts 
        ADD COLUMN rejection_reason TEXT;
        
        RAISE NOTICE 'Added rejection_reason column to content_drafts table';
    ELSE
        RAISE NOTICE 'rejection_reason column already exists in content_drafts table';
    END IF;
END $$;

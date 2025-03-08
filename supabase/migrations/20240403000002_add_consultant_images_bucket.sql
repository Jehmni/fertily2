
-- Create a storage bucket for consultant profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('consultant-images', 'consultant-images', true);

-- Allow authenticated users to upload to the consultant-images bucket
CREATE POLICY "Authenticated users can upload consultant images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'consultant-images');

-- Allow public access to view consultant images
CREATE POLICY "Public can view consultant images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'consultant-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own consultant images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'consultant-images');


-- Create storage bucket for embryo images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('embryo-images', 'embryo-images', true);

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload embryo images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'embryo-images');

-- Allow public access to view embryo images
CREATE POLICY "Public can view embryo images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'embryo-images');

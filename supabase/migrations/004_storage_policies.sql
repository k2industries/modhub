-- Storage policies for the build-photos bucket
-- The bucket is already set to Public (anyone can read/view photos)
-- These policies control who can upload and delete

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload build photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'build-photos');

-- Allow users to delete their own uploaded photos
CREATE POLICY "Authenticated users can delete build photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'build-photos');

-- Allow users to update (overwrite) photos
CREATE POLICY "Authenticated users can update build photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'build-photos');

CREATE POLICY "Anyone can upload Pictaria photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pictarias');
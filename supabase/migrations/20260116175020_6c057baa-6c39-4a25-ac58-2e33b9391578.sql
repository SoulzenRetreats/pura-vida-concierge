-- Clean up vendor service_types to use valid service_category enum values
UPDATE vendors SET service_types = ARRAY['chef']::text[] 
WHERE id = '10000000-0000-0000-0000-000000000001';

UPDATE vendors SET service_types = ARRAY['transportation']::text[] 
WHERE id = '10000000-0000-0000-0000-000000000002';

UPDATE vendors SET service_types = ARRAY['adventure', 'tours']::text[] 
WHERE id = '10000000-0000-0000-0000-000000000003';

UPDATE vendors SET service_types = ARRAY['spa', 'celebrations']::text[] 
WHERE id = '10000000-0000-0000-0000-000000000004';

UPDATE vendors SET service_types = ARRAY['adventure', 'tours']::text[] 
WHERE id = '10000000-0000-0000-0000-000000000005';
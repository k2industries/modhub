-- Seed: First test build — BMW M3 G80
-- User UUID: bc0566cd-7462-4f79-9759-1049ba89c350
-- Run this in the Supabase SQL Editor

DO $$
DECLARE
  user_uuid UUID := 'bc0566cd-7462-4f79-9759-1049ba89c350';
  build_uuid UUID := gen_random_uuid();
BEGIN

  -- Update profile (trigger already created it, now fill in details)
  UPDATE public.profiles SET
    username     = 'max',
    display_name = 'Max K',
    bio          = 'Car enthusiast. BMW M3 G80 owner. Building it tastefully.',
    instagram    = 'maxkarpanty'
  WHERE id = user_uuid;

  -- Insert the build
  INSERT INTO public.builds (
    id, user_id, title, slug,
    year, make, model, chassis_code,
    description, status, specs, mod_count
  ) VALUES (
    build_uuid,
    user_uuid,
    '2023 BMW M3 Competition',
    '2023-bmw-m3-g80-max',
    2023, 'BMW', 'M3', 'G80',
    'Daily driven M3 Competition. Building it tastefully — keeping it street-friendly while extracting more from the S58.',
    'published',
    '{
      "engine": "S58 3.0L Twin-Turbo",
      "horsepower": "503 hp",
      "torque": "479 lb-ft",
      "transmission": "8-Speed M Steptronic",
      "drivetrain": "xDrive AWD",
      "color": "Isle of Man Green"
    }',
    8
  );

  -- Build photos (Unsplash placeholder car images)
  INSERT INTO public.build_photos (build_id, url, position, is_primary) VALUES
    (build_uuid, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80', 0, true),
    (build_uuid, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', 1, false),
    (build_uuid, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80', 2, false);

  -- Mods
  INSERT INTO public.mods (build_id, name, brand, category, install_status, would_install_again, install_notes, position) VALUES
    -- Engine & Performance
    (build_uuid, 'Eventuri Carbon Fiber Intake System', 'Eventuri', 'Engine & Performance', 'installed', true,
     'Massive improvement in throttle response and intake sound. Pops and crackles are next level.', 0),
    (build_uuid, 'CSF High-Performance Intercooler', 'CSF', 'Engine & Performance', 'installed', true,
     'Noticeable power consistency on track days. Temps stay controlled even after multiple hard pulls.', 1),
    -- Exterior / Aero
    (build_uuid, 'M Performance Carbon Fiber Trunk Spoiler', 'BMW M Performance', 'Exterior / Aero', 'installed', true,
     'OEM fitment, looks factory. Just the right amount of aggression without being over the top.', 0),
    -- Wheels & Tires
    (build_uuid, 'BBS CH-R 19x9.5 / 19x10.5 Wheels', 'BBS', 'Wheels & Tires', 'installed', true,
     'Best looking wheel for the G80. Fitment is perfect. Rim protector is a nice touch for daily driving.', 0),
    -- Suspension
    (build_uuid, 'KW Clubsport 3-Way Coilovers', 'KW Suspension', 'Suspension', 'installed', true,
     'Game changer on track. Completely transformed the handling. Street setting is still livable for daily use.', 0),
    -- Brakes
    (build_uuid, 'StopTech Sport Brake Pads (Front)', 'StopTech', 'Brakes', 'installed', true,
     'Great upgrade over stock. Much better bite and fade resistance on track. Surprisingly low dust.', 0),
    -- Interior
    (build_uuid, 'Alcantara Steering Wheel Retrim', 'Wheelskins', 'Interior', 'installed', false,
     'Good grip but started peeling at 6 months. Would do a proper retrim instead next time.', 0),
    -- Other
    (build_uuid, 'CTEK MXS 5.0 Battery Charger', 'CTEK', 'Other', 'installed', true,
     'Essential for any M car. Keeps the battery healthy through cold months and track days.', 0);

END $$;

-- Sample products for KairoShop (run after schema)
INSERT INTO public.products (name, description, category, price, stock, image_url, rating) VALUES
('Carbon Pro Frame X1', 'Ultra-light carbon road frame with aerodynamic tubing.', 'Bike Frames', 1299.99, 15, 'https://images.unsplash.com/photo-1485965120181-e220f721d03f?w=600', 4.8),
('TrailMaster MTB Frame', 'Durable aluminum mountain bike frame for all terrains.', 'Bike Frames', 599.99, 22, 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600', 4.5),
('SpeedGrip Pro Tires', 'High-performance road tires with superior grip.', 'Tires', 89.99, 50, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 4.6),
('AllTerrain MTB Tires', 'Knobby tires built for mud, rocks, and trails.', 'Tires', 74.99, 40, 'https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=600', 4.4),
('Titanium X-Chain 11s', 'Premium 11-speed chain with anti-rust coating.', 'Chains', 49.99, 80, 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=600', 4.7),
('AeroShield Pro Helmet', 'Ventilated aero helmet with MIPS protection.', 'Helmets', 159.99, 30, 'https://images.unsplash.com/photo-1541625602330-1a2d0a3b0c0e?w=600', 4.9),
('NightRide LED Helmet', 'Integrated LED helmet for night visibility.', 'Helmets', 89.99, 25, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600', 4.3),
('HydraStop Disc Brakes', 'Hydraulic disc brake set with heat dissipation.', 'Brakes', 199.99, 35, 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600', 4.8),
('QuickStop Rim Brakes', 'Lightweight rim brakes for road cyclists.', 'Brakes', 59.99, 60, 'https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=600', 4.2),
('ProGrip Handlebar Tape', 'Cushioned grip tape with sweat resistance.', 'Accessories', 24.99, 100, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 4.5),
('Hydration Pack 2L', 'Lightweight hydration backpack for long rides.', 'Accessories', 69.99, 45, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600', 4.6),
('LED Bike Light Set', 'Front and rear USB-rechargeable light kit.', 'Accessories', 39.99, 70, 'https://images.unsplash.com/photo-1485965120181-e220f721d03f?w=600', 4.7)
ON CONFLICT DO NOTHING;

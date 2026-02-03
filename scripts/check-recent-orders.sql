-- Script de diagnostic pour vérifier les commandes récentes
-- Usage: psql $DATABASE_URL -f scripts/check-recent-orders.sql

-- 1. Vérifier les commandes créées dans les dernières 24 heures
SELECT 
    o.id,
    o."orderNumber",
    o.status,
    o.total,
    o."deliveryType",
    o."createdAt",
    o."restaurantId",
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    c.name as customer_name,
    c.phone as customer_phone,
    o.source
FROM "Order" o
LEFT JOIN "Restaurant" r ON o."restaurantId" = r.id
LEFT JOIN "Customer" c ON o."customerId" = c.id
WHERE o."createdAt" >= NOW() - INTERVAL '24 hours'
ORDER BY o."createdAt" DESC
LIMIT 20;

-- 2. Compter les commandes par restaurant
SELECT 
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN o."createdAt" >= NOW() - INTERVAL '24 hours' THEN 1 END) as orders_last_24h
FROM "Restaurant" r
LEFT JOIN "Order" o ON r.id = o."restaurantId"
GROUP BY r.id, r.name, r.slug
ORDER BY orders_last_24h DESC;

-- 3. Vérifier les dernières commandes avec leurs items
SELECT 
    o."orderNumber",
    o.status,
    o.total,
    o."createdAt",
    r.name as restaurant_name,
    c.name as customer_name,
    c.phone as customer_phone,
    COUNT(oi.id) as items_count,
    STRING_AGG(oi.name || ' (x' || oi.quantity || ')', ', ') as items
FROM "Order" o
LEFT JOIN "Restaurant" r ON o."restaurantId" = r.id
LEFT JOIN "Customer" c ON o."customerId" = c.id
LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
WHERE o."createdAt" >= NOW() - INTERVAL '24 hours'
GROUP BY o.id, o."orderNumber", o.status, o.total, o."createdAt", r.name, c.name, c.phone
ORDER BY o."createdAt" DESC
LIMIT 10;

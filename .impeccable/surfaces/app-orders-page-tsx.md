# Order desk

Mode: Operate. Counter staff pack and dispatch grocery orders on a single desktop screen.

Inherit the established Askari white/teal world and self-hosted Poppins. Keep owner financial aggregates and inventory administration behind separate owner access. Queue, product identification and delivery context remain together in one viewport; panes scroll independently. On phones, selecting an order opens its detail with a back-to-orders control.

Each item uses the immutable order photo, full name, pack size and quantity. Never substitute a generic product image when the snapshot photo fails. Tick the entire ordered quantity before dispatch; confirm cash received before delivery completion. Sample mode contains clearly marked fictional customers and prices, never calls mutation APIs and cannot alter live orders.

Printed packing slips use a compact 480px receipt column (128mm maximum in print), small product photos, size and quantity × unit price directly beneath each name, and right-aligned line totals. Keep delivery charges and cash to collect together in a narrow totals block. Avoid full-page flex expansion that separates prices from their products. Sample slips are clearly marked practice only; all customer content is assigned as text, never HTML.

Polling every 10 seconds refreshes all loaded pages. Active orders are queried separately from delivered history so older unfinished orders are not buried. Keep selected order and checks during polling. Display stale-connection errors with retry and retain last loaded data. Empty queues explain where incoming orders appear.

Phone alerts opens a compact staff setup dialog with Android/iPhone Home Screen instructions, explicit enable/disable controls and a test alert. Do not request notification permission automatically. iPhone setup requires opening the installed Home Screen app. New order notifications contain generic copy; the exact receipt opens behind staff access through its saved order ID. No order data is cached in the service worker. Keep this small feature inside the established desk layout and typography.

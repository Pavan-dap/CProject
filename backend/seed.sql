-- Users
INSERT INTO projects_user
(id, password, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined, role, phone, status, join_date, confirm_password)
VALUES
(1, 'pbkdf2_sha256$600000$v6RkHdTHzNHAyx8myAqHwO$bZnXF40jFRv9Y1kU+inNI9TIjXjXOmF9IGZyDFOVLJU=', 1, 'admin', 'Admin', 'User', 'admin@construct.com', 1, 1, NOW(), 'admin', '', 'active', NOW(), 'admin123'),
(2, 'pbkdf2_sha256$600000$8vB3z1r6XpK2$O1lG3mQ9dUtT0F1rLd5B2x6s6dWyRpgH3klbGME0U1Q=', 0, 'manager', 'Nagarjuna', 'Nitta', 'manager@construct.com', 0, 1, NOW(), 'manager', '', 'active', NOW(), 'manager123'),
(3, 'pbkdf2_sha256$600000$4rD2u9h8LmV5$S3hZ5lW8tPyH9z3gQ0a2nF3e6bWqUoO7G4cP3pF3sM8=', 0, 'incharge', 'Sarada', 'Reddy', 'incharge@construct.com', 0, 1, NOW(), 'incharge', '', 'active', NOW(), 'incharge123'),
(4, 'pbkdf2_sha256$600000$9yK5u8j1QwP6$Q4jH2rM9pDsB0c2gT7x5nR8v4yZpKoN8rL1sT9fJ6bM=', 0, 'executive', 'Sai', 'Kumar', 'executive@construct.com', 0, 1, NOW(), 'executive', '', 'active', NOW(), 'executive123');


-- Projects
INSERT INTO projects_project
(id, name, location, client, start_date, end_date, buildings, floors, units, manager_id, progress, status, description)
VALUES
(1, 'ABC Township Phase-2', 'Mumbai, Maharashtra', 'ABC Developers Ltd.', '2025-03-01', '2025-09-30', 25, 4, 1000, 2, 45, 'in-progress', 'Supply and installation of UPVC windows and doors for 1000 residential units'),
(2, 'Green Valley Complex', 'Pune, Maharashtra', 'Green Valley Housing', '2025-04-01', '2025-09-15', 15, 6, 540, 2, 25, 'in-progress', 'Complete door and window installation project')
ON DUPLICATE KEY UPDATE client=VALUES(client);

-- Tasks
INSERT INTO projects_task
(id, title, description, project_id, assigned_to_id, assigned_by_id, status, progress, priority, due_date, created_date, building, floor, unit, unit_type)
VALUES
(1, 'Foundation Work - Block A', 'Complete foundation work for Block A', 1, 4, 3, 'completed', 100, 'high', '2025-03-30', '2025-03-15', 'Block A', 'Foundation', NULL, NULL),
(2, 'Structural Work - Block A, Floor 1-5', 'Complete structural work for floors 1-5 in Block A', 1, 4, 3, 'in-progress', 75, 'high', '2025-05-15', '2025-03-20', 'Block A', 'Floor 1-5', NULL, NULL),
(3, 'Plumbing Rough-in - Block A, Floor 1', 'Install plumbing rough-in for all units on Floor 1', 1, 4, 3, 'not-started', 10, 'medium', '2025-04-20', '2025-03-25', 'Block A', 'Floor 1', 'All Units', NULL)
ON DUPLICATE KEY UPDATE title=VALUES(title);

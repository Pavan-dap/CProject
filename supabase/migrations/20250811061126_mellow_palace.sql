-- Construction Project Management System Sample Data
-- MySQL Database Schema and Sample Data

-- Sample Users Data (passwords are hashed with Django's default hasher)
INSERT INTO accounts_user (username, email, first_name, last_name, role, phone, is_active, is_staff, is_superuser, date_joined, password) VALUES
('admin', 'admin@construct.com', 'John', 'Smith', 'admin', '+1234567890', 1, 1, 1, NOW(), 'pbkdf2_sha256$600000$randomsalt$hashedpassword'),
('manager1', 'manager@construct.com', 'Sarah', 'Johnson', 'manager', '+1234567891', 1, 0, 0, NOW(), 'pbkdf2_sha256$600000$randomsalt$hashedpassword'),
('incharge1', 'incharge@construct.com', 'Mike', 'Wilson', 'incharge', '+1234567892', 1, 0, 0, NOW(), 'pbkdf2_sha256$600000$randomsalt$hashedpassword'),
('executive1', 'executive@construct.com', 'Lisa', 'Davis', 'executive', '+1234567893', 1, 0, 0, NOW(), 'pbkdf2_sha256$600000$randomsalt$hashedpassword'),
('executive2', 'executive2@construct.com', 'David', 'Brown', 'executive', '+1234567894', 1, 0, 0, NOW(), 'pbkdf2_sha256$600000$randomsalt$hashedpassword');

-- Sample Projects Data
INSERT INTO projects_project (name, description, client, location, start_date, end_date, buildings, floors, units, status, progress, manager_id, created_by_id, created_at, updated_at) VALUES
('ABC Township Phase-2', 'Supply and installation of UPVC windows and doors for residential complex', 'ABC Developers Ltd.', 'Mumbai, Maharashtra', '2024-01-15', '2024-12-31', 4, 40, 1600, 'in-progress', 45.50, 2, 1, NOW(), NOW()),
('Green Valley Complex', 'Complete door and window installation project', 'Green Valley Housing', 'Pune, Maharashtra', '2024-03-01', '2025-02-28', 3, 35, 1050, 'in-progress', 25.75, 2, 1, NOW(), NOW()),
('Sunrise Apartments', 'Premium residential complex with modern fittings', 'Sunrise Builders', 'Bangalore, Karnataka', '2024-02-01', '2024-11-30', 2, 25, 500, 'planning', 10.00, 2, 1, NOW(), NOW());

-- Sample Project Hierarchy Data (Block-Floor-Unit structure)
INSERT INTO projects_projecthierarchy (project_id, block_name, floor_number, unit_number, unit_type, completion_percentage) VALUES
-- ABC Township Phase-2 - Block A
(1, 'Block A', 1, '101', '3BHK', 85.00),
(1, 'Block A', 1, '102', '3BHK', 90.00),
(1, 'Block A', 1, '103', '2BHK', 75.00),
(1, 'Block A', 1, '104', '2BHK', 80.00),
(1, 'Block A', 1, '105', '1BHK', 95.00),
(1, 'Block A', 2, '201', '3BHK', 60.00),
(1, 'Block A', 2, '202', '3BHK', 65.00),
(1, 'Block A', 2, '203', '2BHK', 45.00),
(1, 'Block A', 2, '204', '2BHK', 50.00),
(1, 'Block A', 2, '205', '1BHK', 70.00),
-- ABC Township Phase-2 - Block B
(1, 'Block B', 1, '101', '4BHK', 40.00),
(1, 'Block B', 1, '102', '4BHK', 35.00),
(1, 'Block B', 1, '103', '3BHK', 55.00),
(1, 'Block B', 1, '104', '3BHK', 60.00),
(1, 'Block B', 1, '105', '2BHK', 45.00),
-- Green Valley Complex - Block A
(2, 'Block A', 1, '101', '2BHK', 30.00),
(2, 'Block A', 1, '102', '2BHK', 25.00),
(2, 'Block A', 1, '103', '3BHK', 35.00),
(2, 'Block A', 1, '104', '3BHK', 40.00),
(2, 'Block A', 2, '201', '2BHK', 15.00),
(2, 'Block A', 2, '202', '2BHK', 20.00),
(2, 'Block A', 2, '203', '3BHK', 10.00),
(2, 'Block A', 2, '204', '3BHK', 25.00);

-- Sample Tasks Data with Dependencies
INSERT INTO tasks_task (title, description, project_id, hierarchy_id, assigned_to_id, assigned_by_id, status, priority, progress, estimated_hours, actual_hours, start_date, due_date, completed_date, can_start_without_dependency, created_at, updated_at) VALUES
-- Foundation and Structural Tasks (No dependencies)
('Foundation Work - Block A', 'Complete foundation work for Block A including excavation and concrete pouring', 1, 1, 4, 3, 'completed', 'high', 100.00, 240.00, 235.00, '2024-01-20', '2024-01-30', '2024-01-28', 1, NOW(), NOW()),
('Structural Framework - Block A Floor 1-5', 'Complete structural framework for floors 1-5 in Block A', 1, 2, 4, 3, 'in-progress', 'high', 75.00, 480.00, 360.00, '2024-01-25', '2024-03-15', NULL, 0, NOW(), NOW()),
('Foundation Work - Block B', 'Complete foundation work for Block B', 1, 11, 5, 3, 'in-progress', 'high', 60.00, 240.00, 144.00, '2024-02-01', '2024-02-15', NULL, 1, NOW(), NOW()),

-- Utility Installation Tasks (Depend on Structural)
('Plumbing Rough-in - Block A Floor 1', 'Install plumbing rough-in for all units on Floor 1', 1, 1, 4, 3, 'not-started', 'medium', 10.00, 120.00, 15.00, '2024-02-10', '2024-02-20', NULL, 1, NOW(), NOW()),
('Electrical Rough-in - Block A Floor 1', 'Complete electrical rough-in installation for Floor 1', 1, 1, 4, 3, 'not-started', 'high', 0.00, 100.00, 0.00, '2024-02-15', '2024-03-10', NULL, 1, NOW(), NOW()),

-- Window and Door Installation Tasks (Depend on Utilities)
('UPVC Window Installation - Block A Floor 1 3BHK Units', 'Install UPVC windows in 3BHK units (101, 102)', 1, 1, 4, 3, 'in-progress', 'high', 40.00, 80.00, 32.00, '2024-02-01', '2024-02-25', NULL, 0, NOW(), NOW()),
('Door Installation - Block A Floor 1 2BHK Units', 'Install doors in 2BHK units (103, 104)', 1, 3, 4, 3, 'not-started', 'medium', 0.00, 60.00, 0.00, '2024-02-20', '2024-03-05', NULL, 0, NOW(), NOW()),
('Window Installation - Block A Floor 1 1BHK Units', 'Install windows in 1BHK unit (105)', 1, 5, 4, 3, 'completed', 'medium', 100.00, 40.00, 38.00, '2024-02-05', '2024-02-15', '2024-02-14', 0, NOW(), NOW()),

-- Finishing Tasks (Depend on Windows/Doors)
('Interior Finishing - Block A Floor 1', 'Complete interior finishing work for all Floor 1 units', 1, 1, 4, 3, 'not-started', 'medium', 0.00, 200.00, 0.00, '2024-03-01', '2024-03-20', NULL, 0, NOW(), NOW()),
('Quality Inspection - Block A Floor 1', 'Final quality inspection for all completed units', 1, 1, 4, 3, 'not-started', 'high', 0.00, 40.00, 0.00, '2024-03-15', '2024-03-25', NULL, 0, NOW(), NOW()),

-- Green Valley Complex Tasks
('Site Preparation - Green Valley Block A', 'Prepare construction site for Green Valley Block A', 2, 16, 5, 3, 'completed', 'high', 100.00, 80.00, 75.00, '2024-03-01', '2024-03-10', '2024-03-08', 1, NOW(), NOW()),
('Foundation - Green Valley Block A', 'Foundation work for Green Valley Block A', 2, 16, 5, 3, 'in-progress', 'high', 60.00, 200.00, 120.00, '2024-03-05', '2024-03-25', NULL, 0, NOW(), NOW());

-- Task Dependencies
INSERT INTO tasks_taskdependency (task_id, depends_on_id, created_at) VALUES
-- Structural depends on Foundation
(2, 1, NOW()),
-- Utilities depend on Structural
(4, 2, NOW()),
(5, 2, NOW()),
-- Windows/Doors depend on Utilities
(6, 4, NOW()),
(6, 5, NOW()),
(7, 4, NOW()),
(7, 5, NOW()),
(8, 4, NOW()),
-- Finishing depends on Windows/Doors
(9, 6, NOW()),
(9, 7, NOW()),
(9, 8, NOW()),
-- Quality Inspection depends on Finishing
(10, 9, NOW()),
-- Green Valley dependencies
(12, 11, NOW());

-- Sample Task Comments
INSERT INTO tasks_taskcomment (task_id, user_id, text, comment_type, created_at) VALUES
(4, 4, 'Started rough-in work for 3BHK units first as they are priority', 'status_update', NOW()),
(6, 4, 'Completed units 101 and 102. Moving to 103 tomorrow.', 'status_update', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 4, 'Need coordination with electrical team for unit 104', 'comment', NOW()),
(2, 3, 'Good progress on structural work. Keep up the pace.', 'comment', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(12, 5, 'Foundation work progressing well despite weather delays', 'status_update', NOW());

-- Sample Task Status History
INSERT INTO tasks_taskstatushistory (task_id, old_status, new_status, old_progress, new_progress, changed_by_id, changed_at, notes) VALUES
(1, 'in-progress', 'completed', 90.00, 100.00, 4, '2024-01-28 14:30:00', 'Foundation work completed successfully'),
(2, 'not-started', 'in-progress', 0.00, 25.00, 4, '2024-01-25 09:00:00', 'Started structural framework'),
(2, 'in-progress', 'in-progress', 25.00, 75.00, 4, '2024-02-15 16:45:00', 'Significant progress on floors 1-3'),
(6, 'not-started', 'in-progress', 0.00, 20.00, 4, '2024-02-01 10:15:00', 'Started window installation'),
(6, 'in-progress', 'in-progress', 20.00, 40.00, 4, '2024-02-10 15:30:00', 'Completed 2 out of 5 units'),
(8, 'not-started', 'completed', 0.00, 100.00, 4, '2024-02-14 17:00:00', 'Window installation completed for 1BHK unit');

-- Project Assignments
INSERT INTO projects_projectassignment (project_id, user_id, assigned_by_id, assigned_at, is_active) VALUES
(1, 2, 1, NOW(), 1), -- Manager assigned to ABC Township
(1, 3, 2, NOW(), 1), -- Incharge assigned to ABC Township
(1, 4, 3, NOW(), 1), -- Executive 1 assigned to ABC Township
(2, 2, 1, NOW(), 1), -- Manager assigned to Green Valley
(2, 3, 2, NOW(), 1), -- Incharge assigned to Green Valley
(2, 5, 3, NOW(), 1), -- Executive 2 assigned to Green Valley
(3, 2, 1, NOW(), 1); -- Manager assigned to Sunrise Apartments
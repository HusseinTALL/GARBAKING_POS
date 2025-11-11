-- Sample Data for GARBAKING POS - Phase 4: Performance & Payroll
-- This script populates training programs, certification types, and sample data
-- Execute after the database schema is created

-- =====================================================
-- TRAINING PROGRAMS
-- =====================================================

INSERT INTO training_programs (title, description, duration_hours, is_mandatory, is_active, objectives, created_at, updated_at)
VALUES
    ('Food Safety & Hygiene',
     'Comprehensive training on food handling, storage, and sanitation practices to ensure customer safety and comply with health regulations.',
     8, true, true,
     '- Understand proper food handling techniques\n- Learn safe food storage methods\n- Master sanitation and hygiene practices\n- Comply with health department regulations',
     NOW(), NOW()),

    ('Customer Service Excellence',
     'Training focused on delivering exceptional customer experiences, handling complaints, and building customer loyalty.',
     4, true, true,
     '- Develop active listening skills\n- Learn complaint resolution techniques\n- Master positive communication\n- Build customer relationships',
     NOW(), NOW()),

    ('Point of Sale (POS) System Training',
     'Hands-on training for the GARBAKING POS system covering order entry, payment processing, and basic troubleshooting.',
     3, true, true,
     '- Navigate POS interface efficiently\n- Process various payment methods\n- Handle order modifications\n- Perform basic troubleshooting',
     NOW(), NOW()),

    ('Cash Handling & Register Operations',
     'Training on proper cash handling procedures, drawer reconciliation, and preventing cash discrepancies.',
     2, true, true,
     '- Count and verify cash accurately\n- Perform drawer opening/closing procedures\n- Identify counterfeit currency\n- Handle cash discrepancies professionally',
     NOW(), NOW()),

    ('Kitchen Safety & Equipment',
     'Essential training for kitchen staff on safe equipment operation, knife handling, and preventing workplace injuries.',
     6, true, true,
     '- Operate kitchen equipment safely\n- Practice proper knife techniques\n- Prevent burns and cuts\n- Respond to kitchen emergencies',
     NOW(), NOW()),

    ('Allergen Awareness',
     'Critical training on identifying common food allergens, preventing cross-contamination, and handling allergen-related customer requests.',
     2, true, true,
     '- Identify the 8 major allergens\n- Prevent cross-contamination\n- Communicate allergen information to customers\n- Respond to allergen emergencies',
     NOW(), NOW()),

    ('Alcohol Service & Responsibility',
     'Training on responsible alcohol service, identifying intoxication, and legal compliance for serving alcohol.',
     4, true, true,
     '- Check IDs properly\n- Recognize signs of intoxication\n- Refuse service appropriately\n- Comply with alcohol service laws',
     NOW(), NOW()),

    ('Team Leadership & Management',
     'Advanced training for supervisors and managers on leadership skills, team motivation, and conflict resolution.',
     12, false, true,
     '- Develop leadership capabilities\n- Motivate and inspire team members\n- Resolve workplace conflicts\n- Conduct effective performance reviews',
     NOW(), NOW()),

    ('Inventory Management Basics',
     'Training on inventory tracking, stock rotation (FIFO), and minimizing waste in food service operations.',
     3, false, true,
     '- Track inventory accurately\n- Implement FIFO rotation\n- Minimize food waste\n- Identify ordering needs',
     NOW(), NOW()),

    ('Fire Safety & Emergency Procedures',
     'Essential training on fire prevention, evacuation procedures, and emergency response protocols.',
     2, true, true,
     '- Operate fire extinguishers\n- Follow evacuation procedures\n- Identify fire hazards\n- Respond to emergencies calmly',
     NOW(), NOW());

-- =====================================================
-- CERTIFICATION TYPES
-- =====================================================

INSERT INTO certification_types (name, description, issuing_organization, validity_months, is_mandatory, is_active, renewal_required, created_at, updated_at)
VALUES
    ('Food Handler Certificate',
     'Basic food safety certification required for all food service employees. Covers safe food handling, storage, and sanitation.',
     'State Health Department', 24, true, true, true, NOW(), NOW()),

    ('Certified Food Protection Manager',
     'Advanced certification for managers overseeing food preparation. Required in most jurisdictions for at least one manager on duty.',
     'ServSafe / National Registry', 60, true, true, true, NOW(), NOW()),

    ('Responsible Beverage Service (RBS)',
     'Certification for employees serving alcoholic beverages. Covers legal requirements, ID checking, and responsible service.',
     'State Alcohol Control Board', 36, true, true, true, NOW(), NOW()),

    ('First Aid / CPR Certification',
     'Emergency response certification covering basic first aid, CPR, and AED usage.',
     'American Red Cross', 24, false, true, true, NOW(), NOW()),

    ('Allergen Awareness Certification',
     'Specialized certification on managing food allergies, cross-contamination prevention, and allergen communication.',
     'Food Allergy Research & Education (FARE)', 12, true, true, true, NOW(), NOW()),

    ('Heimlich Maneuver / Choking Response',
     'Certification focused on responding to choking emergencies in food service environments.',
     'American Red Cross', 24, false, true, true, NOW(), NOW()),

    ('Sexual Harassment Prevention Training',
     'Mandatory training on preventing workplace harassment and maintaining a respectful work environment.',
     'State Labor Department', 24, true, true, true, NOW(), NOW()),

    ('Fire Safety & Extinguisher Training',
     'Certification on fire prevention, extinguisher operation, and emergency evacuation procedures.',
     'Local Fire Department', 12, true, true, true, NOW(), NOW());

-- =====================================================
-- NOTES ON SAMPLE DATA
-- =====================================================
--
-- To fully populate the system with sample data, you'll need to:
--
-- 1. Ensure employees exist in the database (from Employee Management Phase)
-- 2. Use the API endpoints to create:
--    - Performance Reviews (POST /api/employees/performance-reviews)
--    - Training Assignments (POST /api/employees/training/assign)
--    - Employee Certifications (POST /api/employees/training/certifications)
--
-- Example API calls can be made through the frontend or using tools like Postman/curl
--
-- The training programs and certification types above provide a realistic
-- foundation for a restaurant/bakery operation and cover common compliance requirements.
-- =====================================================

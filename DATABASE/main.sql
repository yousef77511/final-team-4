CREATE DATABASE IF NOT EXISTS medbridge;
USE medbridge;

CREATE TABLE IF NOT EXISTS Users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255),
    national_id_verified BOOLEAN DEFAULT FALSE,
    role ENUM('donor', 'reviewer', 'admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Organizations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('pharmacy', 'ngo', 'orphanage', 'elderly_home', 'hospital') NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT FALSE,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('medicine', 'equipment', 'ppe', 'consumables') NOT NULL
);

CREATE TABLE IF NOT EXISTS Advertisers (
    id CHAR(36) PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    type ENUM('pharma', 'medical_device', 'lab') NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Requests (
    id CHAR(36) PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    category_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity_needed INT NOT NULL CHECK (quantity_needed > 0),
    urgency ENUM('low', 'medium', 'high') NOT NULL,
    status ENUM('open', 'fulfilled', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES Organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Donations (
    id CHAR(36) PRIMARY KEY,
    donor_id CHAR(36) NOT NULL,
    category_id INT NOT NULL,
    type ENUM('medicine', 'equipment', 'ppe', 'consumables') NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    photo VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('pending_review', 'approved', 'rejected', 'matched', 'delivered') DEFAULT 'pending_review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS AdCampaigns (
    id CHAR(36) PRIMARY KEY,
    advertiser_id CHAR(36) NOT NULL,
    ad_content TEXT NOT NULL,
    placement VARCHAR(50) NOT NULL, 
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (advertiser_id) REFERENCES Advertisers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MedicineDetails (
    donation_id CHAR(36) PRIMARY KEY,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100),
    manufacturer VARCHAR(150),
    dosage_form VARCHAR(100),
    FOREIGN KEY (donation_id) REFERENCES Donations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS EquipmentDetails (
    donation_id CHAR(36) PRIMARY KEY,
    `condition` ENUM('new', 'used_good', 'needs_repair') NOT NULL,
    needs_maintenance BOOLEAN DEFAULT FALSE,
    maintenance_notes TEXT,
    FOREIGN KEY (donation_id) REFERENCES Donations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Inspections (
    id CHAR(36) PRIMARY KEY,
    donation_id CHAR(36) NOT NULL,
    inspector_id CHAR(36) NOT NULL, 
    result ENUM('approved', 'rejected', 'needs_maintenance') NOT NULL,
    notes TEXT,
    inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES Donations(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES Users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Matches (
    id CHAR(36) PRIMARY KEY,
    donation_id CHAR(36) NOT NULL,
    request_id CHAR(36) NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (donation_id) REFERENCES Donations(id) ON DELETE RESTRICT,
    FOREIGN KEY (request_id) REFERENCES Requests(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Deliveries (
    id CHAR(36) PRIMARY KEY,
    match_id CHAR(36) NOT NULL UNIQUE,
    courier_name VARCHAR(100),
    pickup_date DATETIME,
    delivery_date DATETIME,
    status ENUM('assigned', 'in_transit', 'delivered', 'failed') DEFAULT 'assigned',
    FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
);

INSERT INTO Categories (id, name, type) VALUES
(1, 'PPE & Protection', 'ppe'),
(2, 'Medical Equipment', 'equipment'),
(3, 'Pharmaceuticals', 'medicine'),
(4, 'Consumable Supplies', 'consumables')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO Users (id, name, email, phone, password, role, national_id_verified) VALUES
('u001-user-donor-001', 'Yousef Protons', 'team4@protons.edu.com', '+201000000001', '123456789', 'donor', TRUE),
('u002-user-reviewer-01', 'Dr. Sarah Quality', 'sarah.reviewer@medbridge.org', '+201000000002', '123456789', 'reviewer', TRUE),
('u003-user-admin-01', 'Admin Supervisor', 'admin@medbridge.org', '+201000000003', '123456789', 'admin', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO Organizations (id, name, type, license_number, verified, address, phone) VALUES
('org-001-hope-health', 'Hope Health Center', 'hospital', 'LIC-EGY-2026-081', TRUE, '12 Al-Galaa St, Cairo', '+20223456780'),
('org-002-cairo-ngo', 'Care & Relief NGO', 'ngo', 'LIC-EGY-2026-092', TRUE, '45 Ramses Ave, Cairo', '+20223456781'),
('org-003-metro-clinic', 'Metro Community Clinic', 'hospital', 'LIC-EGY-2026-104', FALSE, '78 Heliopolis St, Cairo', '+20223456782')
ON DUPLICATE KEY UPDATE name=VALUES(name);

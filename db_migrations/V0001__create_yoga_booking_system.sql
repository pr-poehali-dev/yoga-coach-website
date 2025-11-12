
CREATE TABLE IF NOT EXISTS yoga_classes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_schedule (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES yoga_classes(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    available_spots INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES class_schedule(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO yoga_classes (title, description, duration, max_participants, price) VALUES
('Хатха-йога', 'Классическая практика для начинающих и продолжающих', 90, 12, 1200.00),
('Виньяса-флоу', 'Динамичная практика с плавными переходами', 75, 10, 1500.00),
('Инь-йога', 'Медитативная практика с длительными асанами', 90, 8, 1300.00),
('Йога для начинающих', 'Мягкое введение в мир йоги', 60, 15, 1000.00);

INSERT INTO class_schedule (class_id, start_time, end_time, available_spots) VALUES
(1, '2025-11-13 10:00:00', '2025-11-13 11:30:00', 12),
(2, '2025-11-13 18:00:00', '2025-11-13 19:15:00', 10),
(3, '2025-11-14 19:00:00', '2025-11-14 20:30:00', 8),
(4, '2025-11-15 17:00:00', '2025-11-15 18:00:00', 15),
(1, '2025-11-16 10:00:00', '2025-11-16 11:30:00', 12),
(2, '2025-11-16 18:00:00', '2025-11-16 19:15:00', 10);

import { ItemCategory, CampusLocation } from '../types';

export const CATEGORIES: { id: ItemCategory; label: string; icon: string; example: string }[] = [
  { id: 'electronics', label: 'Electronics & Laptops', icon: 'Laptop', example: 'Laptop, Charger, Tablet, Mouse' },
  { id: 'audio_wearables', label: 'Phones & Earphones', icon: 'Smartphone', example: 'Mobile Phone, AirPods, Smartwatch' },
  { id: 'id_cards', label: 'College ID & Cards', icon: 'CreditCard', example: 'Student ID, Bus Pass, Library Card, Debit Card' },
  { id: 'wallets_purses', label: 'Wallets & Purses', icon: 'Wallet', example: 'Leather Wallet, Coin Pouch, Cardholder' },
  { id: 'bags_backpacks', label: 'Bags & Backpacks', icon: 'Briefcase', example: 'Backpack, Tote Bag, Gym Bag, Laptop Sleeve' },
  { id: 'books_stationery', label: 'Books & Notebooks', icon: 'BookOpen', example: 'Textbook, Spiral Notebook, Pencil Case, Calculator' },
  { id: 'keys', label: 'Keys & Keychains', icon: 'Key', example: 'Bike Keys, Hostel Room Keys, Lanyards' },
  { id: 'bottles_containers', label: 'Water Bottles & Containers', icon: 'CupSoda', example: 'Stainless Steel Flask, Tupperware, Sipper' },
  { id: 'clothing_accessories', label: 'Clothing & Accessories', icon: 'Shirt', example: 'Hoodie, Jacket, Cap, Umbrella, Eyeglasses' },
  { id: 'other', label: 'Other Personal Belongings', icon: 'Package', example: 'Sports Gear, Musical Instrument, Personal Item' },
];

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { id: 'central_library', name: 'Central Library', zone: 'Academic', commonItems: ['Books', 'Laptops', 'ID Cards', 'Glasses'] },
  { id: 'college_library', name: 'College Library', zone: 'Academic', commonItems: ['Books', 'Wallets', 'Notes'] },
  { id: 'main_canteen', name: 'Main Canteen / Cafeteria', zone: 'Services', commonItems: ['Water Bottles', 'Phones', 'ID Cards', 'Keys'] },
  { id: 'classroom_204', name: 'Classroom 204 (Block A)', zone: 'Academic', commonItems: ['Bottles', 'Notebooks', 'Calculators'] },
  { id: 'classroom_block_a', name: 'Classroom Block A', zone: 'Academic', commonItems: ['Calculators', 'Bags', 'Stationery'] },
  { id: 'classroom_block_b', name: 'Classroom Block B', zone: 'Academic', commonItems: ['Bags', 'Notebooks', 'Chargers'] },
  { id: 'science_lab_3', name: 'Science & Computer Lab 3', zone: 'Academic', commonItems: ['Laptops', 'USBs', 'Mouse', 'Files'] },
  { id: 'sports_complex', name: 'Sports Complex / Gym', zone: 'Recreation', commonItems: ['Keys', 'Gym Bags', 'Water Bottles', 'Earphones'] },
  { id: 'auditorium', name: 'Main Auditorium', zone: 'Academic', commonItems: ['Jackets', 'Glasses', 'Programs'] },
  { id: 'student_activity_center', name: 'Student Activity Center (SAC)', zone: 'Services', commonItems: ['ID Cards', 'Badges', 'Backpacks'] },
  { id: 'parking_lot_b', name: 'Campus Parking Lot B', zone: 'Outdoor', commonItems: ['Vehicle Keys', 'Helmets', 'Cards'] },
  { id: 'admin_block', name: 'Administrative Block (Room 102)', zone: 'Services', commonItems: ['Official Records', 'Envelopes'] },
];

export const PRESET_COLORS = [
  { name: 'Black', hex: '#0F172A' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Silver / Grey', hex: '#94A3B8' },
  { name: 'White', hex: '#F8FAFC' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Yellow / Gold', hex: '#CA8A04' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Multi-color', hex: '#06B6D4' },
];

export const DROP_OFF_LOCATIONS = [
  'Central Security Desk (Main Gate)',
  'Library Circulation Counter (1st Floor)',
  'Student Affairs Office (Admin Block 102)',
  'Department Security Post (Science Block)',
  'Sports Complex Front Desk',
];

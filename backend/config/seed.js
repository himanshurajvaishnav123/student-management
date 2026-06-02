/**
 * DATABASE SEEDER
 * Run: node config/seed.js
 * Creates default admin and sample students for testing.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const Admin = require('../models/Admin');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Create admin
  await Admin.deleteMany({});
  const admin = await Admin.create({
    name: 'Himanshu raj vaishnav',
    email: 'himanshurajvaishnav@gmail.com',
    password: 'himanshu@123',
    department: 'Computer Science',
  });
  console.log('✅ Admin created: admin@sms.com / Admin@123');

  // Create sample students
  await Student.deleteMany({});
  const students = [
    { name: 'Priya Sharma', email: 'priya@student.com', password: 'Student@123', course: 'B.Tech CSE', semester: 3, gender: 'Female', phone: '9876543210', rollNumber: 'CSE-2022-1001', attendance: { records: [], percentage: 85 }, fees: { status: 'paid', amount: 75000 }, marks: new Map([['Mathematics', { obtained: 88, total: 100, grade: 'A' }], ['Science', { obtained: 76, total: 100, grade: 'B+' }], ['English', { obtained: 91, total: 100, grade: 'A+' }], ['History', { obtained: 65, total: 100, grade: 'B' }], ['Computer', { obtained: 94, total: 100, grade: 'A+' }]]) },
    { name: 'Arjun Mehta', email: 'arjun@student.com', password: 'Student@123', course: 'BCA', semester: 2, gender: 'Male', phone: '9876543211', rollNumber: 'BCA-2023-2001', attendance: { records: [], percentage: 62 }, fees: { status: 'unpaid', amount: 45000 }, marks: new Map([['Mathematics', { obtained: 55, total: 100, grade: 'C' }], ['Science', { obtained: 48, total: 100, grade: 'D' }], ['English', { obtained: 70, total: 100, grade: 'B+' }], ['History', { obtained: 60, total: 100, grade: 'B' }], ['Computer', { obtained: 78, total: 100, grade: 'B+' }]]) },
    { name: 'Kavya Reddy', email: 'kavya@student.com', password: 'Student@123', course: 'MBA', semester: 1, gender: 'Female', phone: '9876543212', rollNumber: 'MBA-2024-3001', attendance: { records: [], percentage: 92 }, fees: { status: 'paid', amount: 120000 }, marks: new Map([['Mathematics', { obtained: 78, total: 100, grade: 'B+' }], ['Science', { obtained: 82, total: 100, grade: 'A' }], ['English', { obtained: 88, total: 100, grade: 'A' }], ['History', { obtained: 75, total: 100, grade: 'B+' }], ['Computer', { obtained: 90, total: 100, grade: 'A+' }]]) },
  ];

  for (const s of students) await Student.create(s);
  console.log('✅ Sample students created');
  console.log('\nLogin credentials:\n  Admin: admin@sms.com / Admin@123\n  Student: priya@student.com / Student@123');

  await mongoose.disconnect();
  console.log('✅ Seeding complete!');
}

seed().catch(err => { console.error(err); process.exit(1); });

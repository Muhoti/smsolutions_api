/**
 * Seed script — run once to populate portfolio projects and create admin user.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User, Project } = require('../models/associations');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@smsolutions.co.ke';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = "Strong's Digital Labs Admin";

const portfolioProjects = [
  {
    title: 'Ambulex Emergency Response System',
    description: 'Real-time emergency response platform with GPS tracking and instant notifications for emergency services.',
    category: 'web',
    type: 'web',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Socket.io'],
    liveDemo: 'https://dashboard.ambulexsolutions.org/',
    github: 'https://github.com/strongmuhoti',
    featured: true,
    status: 'completed',
    clientName: 'Ambulex Solutions'
  },
  {
    title: 'Vihiga Farmer Mapping App',
    description: 'GPS-enabled mobile application for agricultural data collection and farmer mapping in Vihiga County.',
    category: 'mobile',
    type: 'cross-platform',
    techStack: ['React Native', 'Firebase', 'Maps API'],
    playStore: 'https://play.google.com/store/apps/details?id=com.vihiga.farmer',
    featured: true,
    status: 'completed',
    clientName: 'Vihiga County'
  },
  {
    title: 'Meru County Agricultural MIS',
    description: 'Comprehensive agricultural management information system for Meru County government operations.',
    category: 'web',
    type: 'web',
    techStack: ['React', 'Express', 'PostgreSQL'],
    liveDemo: 'https://meru.dat.co.ke/',
    featured: true,
    status: 'completed',
    clientName: 'Meru County'
  },
  {
    title: 'KiriAMIS Agricultural System',
    description: 'Agricultural information management system for Kirinyaga County with farmer registration and crop monitoring.',
    category: 'web',
    type: 'web',
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    liveDemo: 'https://admin-kirinyaga.dat.co.ke/',
    featured: false,
    status: 'completed',
    clientName: 'Kirinyaga County'
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`Admin user created: ${ADMIN_EMAIL}`);
    } else {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    }

    for (const project of portfolioProjects) {
      const exists = await Project.findOne({ where: { title: project.title } });
      if (!exists) {
        await Project.create(project);
        console.log(`Project seeded: ${project.title}`);
      } else {
        console.log(`Project already exists: ${project.title}`);
      }
    }

    console.log('\nSeed complete!');
    console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();

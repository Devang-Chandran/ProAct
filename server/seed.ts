import bcrypt from 'bcryptjs';
import { db } from './db.ts';

export async function seedDemoDataIfNeeded() {
  const existingDemo = db.findUserByEmail('demo@studyplanner.edu');
  if (existingDemo) {
    return existingDemo;
  }

  console.log('Seeding initial demo student account and coursework...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = db.createUser({
    name: 'Alex Rivera',
    email: 'demo@studyplanner.edu',
    password: passwordHash,
  });

  // Create Subjects
  const cs = db.createSubject({
    name: 'CS 201: Data Structures',
    color: '#3B82F6', // Sapphire Blue
    userId: demoUser.id,
  });

  const math = db.createSubject({
    name: 'MATH 240: Linear Algebra',
    color: '#10B981', // Emerald Green
    userId: demoUser.id,
  });

  const physics = db.createSubject({
    name: 'PHYS 150: Mechanics & Waves',
    color: '#8B5CF6', // Purple Amethyst
    userId: demoUser.id,
  });

  const lit = db.createSubject({
    name: 'ENG 110: Modern Literature',
    color: '#F59E0B', // Amber Gold
    userId: demoUser.id,
  });

  const now = new Date();

  // Helper for dates relative to now
  const addDays = (d: number, hours: number = 23, minutes: number = 59) => {
    const target = new Date(now);
    target.setDate(target.getDate() + d);
    target.setHours(hours, minutes, 0, 0);
    return target.toISOString();
  };

  // Seed tasks
  db.createTask({
    title: 'Implement Red-Black Tree Balancing & Unit Tests',
    description: 'Complete the rotateLeft, rotateRight and fixViolation methods. Ensure all 24 test cases pass.',
    dueDate: addDays(1, 18, 0), // Tomorrow 6pm
    priority: 'HIGH',
    completed: false,
    subjectId: cs.id,
  });

  db.createTask({
    title: 'Problem Set 4: Eigenvalues and Diagonalization',
    description: 'Exercises 4.1 to 4.18 in Chapter 4. Show step-by-step determinant calculation.',
    dueDate: addDays(2, 23, 59),
    priority: 'MEDIUM',
    completed: false,
    subjectId: math.id,
  });

  db.createTask({
    title: 'Lab Report 3: Harmonic Oscillators & Damping',
    description: 'Include uncertainty analysis graphs from LoggerPro and comparison with theoretical resonance.',
    dueDate: addDays(3, 17, 0),
    priority: 'HIGH',
    completed: false,
    subjectId: physics.id,
  });

  db.createTask({
    title: 'Comparative Essay Draft: Stream of Consciousness',
    description: 'Rough draft analyzing Woolf vs. Joyce narrative techniques (1,500 words).',
    dueDate: addDays(5, 23, 59),
    priority: 'MEDIUM',
    completed: false,
    subjectId: lit.id,
  });

  db.createTask({
    title: 'Review Midterm Solutions & Big-O Recurrences',
    description: 'Go through Master Theorem practice problems for next week quiz.',
    dueDate: addDays(6, 12, 0),
    priority: 'LOW',
    completed: false,
    subjectId: cs.id,
  });

  db.createTask({
    title: 'Matrix Vector Spaces Worksheet #3',
    description: 'Basic basis and dimension proofs.',
    dueDate: addDays(-2, 23, 59),
    priority: 'LOW',
    completed: true,
    subjectId: math.id,
  });

  db.createTask({
    title: 'Kinematics Pre-Lab Quiz',
    description: 'Review online canvas questions before laboratory session.',
    dueDate: addDays(-1, 10, 0),
    priority: 'MEDIUM',
    completed: true,
    subjectId: physics.id,
  });

  console.log('Demo seed completed successfully.');
  return demoUser;
}

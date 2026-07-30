import { AppDataSource } from '../connection';
import { seedClasses } from './seed-classes';
import { seedMaps } from './seed-maps';
import { seedItems } from './seed-items';
import { seedNPCs } from './seed-npcs';
import { seedQuests } from './seed-quests';

async function runAllSeeds(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Starting seed...\n');

    await seedClasses();
    console.log('');

    await seedMaps();
    console.log('');

    await seedItems();
    console.log('');

    await seedNPCs();
    console.log('');

    await seedQuests();
    console.log('');

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

runAllSeeds();

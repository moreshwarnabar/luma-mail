import { db } from '@/db';
import { NewLabel } from '../types/mail';
import { label } from '@/db/schema';

export async function saveLabels(labels: NewLabel[]) {
  try {
    await db.insert(label).values(labels);
  } catch (err) {
    console.error('Error while saving labels, ', err);
  }
}

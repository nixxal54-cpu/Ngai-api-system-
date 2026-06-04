import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load config dynamically so it's not hardcoded
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig, "backend");
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

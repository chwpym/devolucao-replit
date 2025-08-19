import express, { Request, Response } from 'express';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, or, and, gt } from 'drizzle-orm';

const app = express();
app.use(express.json());

// Main endpoint for data synchronization
app.post('/api/sync', async (req: Request, res: Response) => {
    const { people, devolutions } = req.body;
    const lastSyncTimestamp = req.query.lastSyncTimestamp as string;

    try {
        // --- Step 1: Client to Server Synchronization ---
        // The client sends its updated/created data to the server.

        // Sync People
        if (people && people.length > 0) {
            // In a real scenario, you'd perform an "upsert" (insert or update).
            // Drizzle has `onConflictDoUpdate` for this.
            await db.insert(schema.people).values(people).onConflictDoNothing(); // Simplified for now
        }

        // Sync Devolutions
        if (devolutions && devolutions.length > 0) {
            // Similar to people, upsert would be ideal.
            await db.insert(schema.devolutions).values(devolutions).onConflictDoNothing(); // Simplified for now
        }

        // --- Step 2: Server to Client Synchronization ---
        // The server sends back any data that has been updated since the client's last sync.
        let serverUpdates = {
            people: [],
            devolutions: []
        };

        if (lastSyncTimestamp) {
            const syncTime = new Date(lastSyncTimestamp);

            serverUpdates.people = await db.select().from(schema.people).where(
                gt(schema.people.updatedAt, syncTime)
            );

            serverUpdates.devolutions = await db.select().from(schema.devolutions).where(
                gt(schema.devolutions.updatedAt, syncTime)
            );
        } else {
            // If it's the first sync, send all data
            serverUpdates.people = await db.select().from(schema.people);
            serverUpdates.devolutions = await db.select().from(schema.devolutions);
        }

        res.status(200).json({
            message: 'Sync successful',
            serverUpdates,
            newSyncTimestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'An error occurred during synchronization.' });
    }
});

export default app;

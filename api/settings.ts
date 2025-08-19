import express, { Request, Response } from 'express';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

const app = express();
app.use(express.json());

app.post('/api/settings', async (req: Request, res: Response) => {
    const settingsData = req.body;

    try {
        // Upsert operation: insert or update the settings record with id=1
        await db.insert(schema.empresa)
            .values({
                id: 1,
                name: settingsData.name,
                doc: settingsData.doc,
                phone: settingsData.phone,
                email: settingsData.email,
                address: settingsData.address,
                logoUrl: settingsData.logoUrl,
                updatedAt: new Date()
            })
            .onConflictDoUpdate({
                target: schema.empresa.id,
                set: {
                    name: settingsData.name,
                    doc: settingsData.doc,
                    phone: settingsData.phone,
                    email: settingsData.email,
                    address: settingsData.address,
                    logoUrl: settingsData.logoUrl,
                    updatedAt: new Date(),
                }
            });

        res.status(200).json({ message: 'Settings saved successfully.' });
    } catch (error) {
        console.error('Failed to save settings:', error);
        res.status(500).json({ error: 'Failed to save settings.' });
    }
});

// GET endpoint to retrieve settings
app.get('/api/settings', async (req: Request, res: Response) => {
    try {
        const settings = await db.select().from(schema.empresa).where(eq(schema.empresa.id, 1));
        if (settings.length > 0) {
            res.status(200).json(settings[0]);
        } else {
            res.status(404).json({ message: 'Settings not found.' });
        }
    } catch (error) {
        console.error('Failed to get settings:', error);
        res.status(500).json({ error: 'Failed to get settings.' });
    }
});

export default app;

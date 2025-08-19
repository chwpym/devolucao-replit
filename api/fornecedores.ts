import express, { Request, Response } from 'express';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

const app = express();
app.use(express.json());

// GET all suppliers
app.get('/api/fornecedores', async (req: Request, res: Response) => {
    try {
        const suppliers = await db.select().from(schema.fornecedores);
        res.status(200).json(suppliers);
    } catch (error) {
        console.error('Failed to get suppliers:', error);
        res.status(500).json({ error: 'Failed to get suppliers.' });
    }
});

// POST a new supplier (or update existing)
app.post('/api/fornecedores', async (req: Request, res: Response) => {
    const supplierData = req.body;

    try {
        const result = await db.insert(schema.fornecedores)
            .values({ ...supplierData, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: schema.fornecedores.uuid,
                set: {
                    name: sql`excluded.name`,
                    contact: sql`excluded.contact`,
                    phone: sql`excluded.phone`,
                    email: sql`excluded.email`,
                    address: sql`excluded.address`,
                    doc: sql`excluded.doc`,
                    updatedAt: new Date(),
                }
            })
            .returning();

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Failed to save supplier:', error);
        res.status(500).json({ error: 'Failed to save supplier.' });
    }
});

export default app;

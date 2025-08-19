import express, { Request, Response } from 'express';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

const app = express();
app.use(express.json());

// GET all warranties
app.get('/api/garantias', async (req: Request, res: Response) => {
    try {
        const warranties = await db.select().from(schema.garantias);
        res.status(200).json(warranties);
    } catch (error) {
        console.error('Failed to get warranties:', error);
        res.status(500).json({ error: 'Failed to get warranties.' });
    }
});

// POST a new warranty (or update existing)
app.post('/api/garantias', async (req: Request, res: Response) => {
    const warrantyData = req.body;

    try {
        const result = await db.insert(schema.garantias)
            .values({ ...warrantyData, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: schema.garantias.uuid,
                set: {
                    productId: sql`excluded.productId`,
                    productDesc: sql`excluded.productDesc`,
                    quantity: sql`excluded.quantity`,
                    defect: sql`excluded.defect`,
                    purchaseInvoice: sql`excluded.purchaseInvoice`,
                    value: sql`excluded.value`,
                    returnInvoice: sql`excluded.returnInvoice`,
                    salesRequestId: sql`excluded.salesRequestId`,
                    warrantyRequestId: sql`excluded.warrantyRequestId`,
                    status: sql`excluded.status`,
                    notes: sql`excluded.notes`,
                    supplierId: sql`excluded.supplierId`,
                    clientId: sql`excluded.clientId`,
                    mechanicId: sql`excluded.mechanicId`,
                    purchaseDate: sql`excluded.purchaseDate`,
                    returnDate: sql`excluded.returnDate`,
                    warrantyDeadline: sql`excluded.warrantyDeadline`,
                    updatedAt: new Date(),
                }
            })
            .returning();

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Failed to save warranty:', error);
        res.status(500).json({ error: 'Failed to save warranty.' });
    }
});

export default app;

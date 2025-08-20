import express, { Request, Response } from 'express';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, or, and, gt, sql } from 'drizzle-orm';

const app = express();
app.use(express.json());

// Default API route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API is running.' });
});

// --- Devoluções Routes ---
app.get('/api/devolucoes', async (req: Request, res: Response) => {
    try {
        const devolucoes = await db.select().from(schema.devolutions);
        res.status(200).json(devolucoes);
    } catch (error) {
        console.error('Failed to get devolucoes:', error);
        res.status(500).json({ error: 'Failed to get devolucoes.' });
    }
});


// --- Fornecedores Routes ---
app.get('/api/fornecedores', async (req: Request, res: Response) => {
    try {
        const suppliers = await db.select().from(schema.fornecedores);
        res.status(200).json(suppliers);
    } catch (error) {
        console.error('Failed to get suppliers:', error);
        res.status(500).json({ error: 'Failed to get suppliers.' });
    }
});

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

// --- Garantias Routes ---
app.get('/api/garantias', async (req: Request, res: Response) => {
    try {
        const warranties = await db.select().from(schema.garantias);
        res.status(200).json(warranties);
    } catch (error) {
        console.error('Failed to get warranties:', error);
        res.status(500).json({ error: 'Failed to get warranties.' });
    }
});

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

// --- Settings Routes ---
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

app.post('/api/settings', async (req: Request, res: Response) => {
    const settingsData = req.body;
    try {
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

// --- Sync Route ---
app.post('/api/sync', async (req: Request, res: Response) => {
    const { people, devolutions } = req.body;
    const lastSyncTimestamp = req.query.lastSyncTimestamp as string;

    try {
        if (people && people.length > 0) {
            await db.insert(schema.people)
                .values(people)
                .onConflictDoUpdate({
                    target: schema.people.uuid,
                    set: {
                        nome: sql`excluded.nome`,
                        email: sql`excluded.email`,
                        telefone: sql`excluded.telefone`,
                        endereco: sql`excluded.endereco`,
                        tipo: sql`excluded.tipo`,
                        status: sql`excluded.status`,
                        observacoes: sql`excluded.observacoes`,
                        updatedAt: new Date(),
                    }
                });
        }

        if (devolutions && devolutions.length > 0) {
            await db.insert(schema.devolutions)
                .values(devolutions)
                .onConflictDoUpdate({
                    target: schema.devolutions.uuid,
                    set: {
                        cliente_id: sql`excluded.cliente_id`,
                        mecanico_id: sql`excluded.mecanico_id`,
                        numero_pedido: sql`excluded.numero_pedido`,
                        data_venda: sql`excluded.data_venda`,
                        data_devolucao: sql`excluded.data_devolucao`,
                        observacoes: sql`excluded.observacoes`,
                        updatedAt: new Date(),
                    }
                });
        }

        let serverUpdates = { people: [], devolutions: [] };
        if (lastSyncTimestamp) {
            const syncTime = new Date(lastSyncTimestamp);
            serverUpdates.people = await db.select().from(schema.people).where(gt(schema.people.updatedAt, syncTime));
            serverUpdates.devolutions = await db.select().from(schema.devolutions).where(gt(schema.devolutions.updatedAt, syncTime));
        } else {
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

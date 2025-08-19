import express, { Request, Response } from 'express';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, or, and, gt, sql } from 'drizzle-orm';

const app = express();
app.use(express.json());

// Main endpoint for data synchronization
app.post('/api/sync', async (req: Request, res: Response) => {
    const { people, devolutions } = req.body;
    const lastSyncTimestamp = req.query.lastSyncTimestamp as string;

    try {
        // --- Step 1: Client to Server Synchronization (Upsert) ---
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
            // This is more complex due to relations. For now, we'll handle the main table.
            // A full implementation would handle devolution_items as well.
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

        // --- Step 2: Server to Client Synchronization ---
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

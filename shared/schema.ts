import { pgTable, serial, varchar, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// People table
export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 20 }).notNull().unique(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefone: varchar('telefone', { length: 20 }),
  endereco: text('endereco'),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'Cliente', 'Mecânico', 'Ambos'
  status: varchar('status', { length: 20 }).default('Ativo').notNull(), // 'Ativo', 'Inativo'
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Devolutions table (header)
export const devolutions = pgTable('devolutions', {
  id: serial('id').primaryKey(),
  cliente_id: integer('cliente_id').references(() => people.id),
  mecanico_id: integer('mecanico_id').references(() => people.id),
  numero_pedido: varchar('numero_pedido', { length: 100 }),
  data_venda: timestamp('data_venda'),
  data_devolucao: timestamp('data_devolucao').notNull(),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Devolution items table (details)
export const devolutionItems = pgTable('devolution_items', {
  id: serial('id').primaryKey(),
  devolution_id: integer('devolution_id').references(() => devolutions.id).notNull(),
  codigo_peca: varchar('codigo_peca', { length: 100 }).notNull(),
  descricao_peca: text('descricao_peca').notNull(),
  quantidade_devolvida: integer('quantidade_devolvida').notNull(),
  tipo_acao: varchar('tipo_acao', { length: 50 }).notNull(),
  observacoes_item: text('observacoes_item'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const peopleRelations = relations(people, ({ many }) => ({
  devolutionsAsClient: many(devolutions, { relationName: 'client' }),
  devolutionsAsMechanic: many(devolutions, { relationName: 'mechanic' }),
}));

export const devolutionsRelations = relations(devolutions, ({ one, many }) => ({
  client: one(people, {
    fields: [devolutions.cliente_id],
    references: [people.id],
    relationName: 'client',
  }),
  mechanic: one(people, {
    fields: [devolutions.mecanico_id],
    references: [people.id],
    relationName: 'mechanic',
  }),
  items: many(devolutionItems),
}));

export const devolutionItemsRelations = relations(devolutionItems, ({ one }) => ({
  devolution: one(devolutions, {
    fields: [devolutionItems.devolution_id],
    references: [devolutions.id],
  }),
}));

// Type exports
export type Person = typeof people.$inferSelect;
export type InsertPerson = typeof people.$inferInsert;
export type Devolution = typeof devolutions.$inferSelect;
export type InsertDevolution = typeof devolutions.$inferInsert;
export type DevolutionItem = typeof devolutionItems.$inferSelect;
export type InsertDevolutionItem = typeof devolutionItems.$inferInsert;
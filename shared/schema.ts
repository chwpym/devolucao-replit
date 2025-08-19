import { pgTable, serial, varchar, text, integer, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// People table
export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
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
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
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
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
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

// Company settings table
export const empresa = pgTable('empresa', {
    id: serial('id').primaryKey(), // We'll only ever have one row with id=1
    name: varchar('name', { length: 255 }).notNull(),
    doc: varchar('doc', { length: 20 }), // for CNPJ
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    logoUrl: text('logo_url'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Empresa = typeof empresa.$inferSelect;
export type InsertEmpresa = typeof empresa.$inferInsert;

// Suppliers table
export const fornecedores = pgTable('fornecedores', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  contact: varchar('contact', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  doc: varchar('doc', { length: 20 }), // CNPJ
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Fornecedor = typeof fornecedores.$inferSelect;
export type InsertFornecedor = typeof fornecedores.$inferInsert;

// Warranties table
export const garantias = pgTable('garantias', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
  productId: varchar('product_id', { length: 50 }),
  productDesc: text('product_desc'),
  quantity: integer('quantity').notNull(),
  defect: text('defect'),
  purchaseInvoice: varchar('purchase_invoice', { length: 100 }),
  value: decimal('value', { precision: 10, scale: 2 }),
  returnInvoice: varchar('return_invoice', { length: 100 }),
  salesRequestId: varchar('sales_request_id', { length: 100 }),
  warrantyRequestId: varchar('warranty_request_id', { length: 100 }),
  status: varchar('status', { length: 50 }).default('Em análise'), // Em análise, Aprovada, Rejeitada, etc.
  notes: text('notes'),

  supplierId: integer('supplier_id').references(() => fornecedores.id),
  clientId: integer('client_id').references(() => people.id),
  mechanicId: integer('mechanic_id').references(() => people.id),

  purchaseDate: timestamp('purchase_date'),
  returnDate: timestamp('return_date').defaultNow().notNull(),
  warrantyDeadline: timestamp('warranty_deadline'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Garantia = typeof garantias.$inferSelect;
export type InsertGarantia = typeof garantias.$inferInsert;

// Warranty attachments table
export const garantiaAnexos = pgTable('garantia_anexos', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
  warrantyId: integer('warranty_id').references(() => garantias.id),
  fileUrl: text('file_url').notNull(),
  fileName: varchar('file_name', { length: 255 }),
  fileType: varchar('file_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type GarantiaAnexo = typeof garantiaAnexos.$inferSelect;
export type InsertGarantiaAnexo = typeof garantiaAnexos.$inferInsert;
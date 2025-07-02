import { people, devolutions, type Person, type InsertPerson, type Devolution, type InsertDevolution } from "../shared/schema";
import { db } from "./db";
import { eq, like, and, or, desc, asc } from "drizzle-orm";

// Storage interface for compatibility
export interface IStorage {
  // Person methods
  getPerson(id: number): Promise<Person | undefined>;
  getPersonByCode(codigo: string): Promise<Person | undefined>;
  createPerson(insertPerson: InsertPerson): Promise<Person>;
  updatePerson(id: number, personData: Partial<Person>): Promise<Person | undefined>;
  getAllPeople(): Promise<Person[]>;
  getPeopleByType(type: string): Promise<Person[]>;
  getActivePeople(type?: string): Promise<Person[]>;
  
  // Devolution methods
  getDevolution(id: number): Promise<Devolution | undefined>;
  createDevolution(insertDevolution: InsertDevolution): Promise<Devolution>;
  updateDevolution(id: number, devolutionData: Partial<Devolution>): Promise<Devolution | undefined>;
  getAllDevolutions(): Promise<Devolution[]>;
  searchDevolutions(criteria: any): Promise<Devolution[]>;
  
  // Utility methods
  generatePersonCode(): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // Person methods
  async getPerson(id: number): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(eq(people.id, id));
    return person || undefined;
  }

  async getPersonByCode(codigo: string): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(eq(people.codigo, codigo));
    return person || undefined;
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const [person] = await db
      .insert(people)
      .values(insertPerson)
      .returning();
    return person;
  }

  async updatePerson(id: number, personData: Partial<Person>): Promise<Person | undefined> {
    const [person] = await db
      .update(people)
      .set({ ...personData, updatedAt: new Date() })
      .where(eq(people.id, id))
      .returning();
    return person || undefined;
  }

  async getAllPeople(): Promise<Person[]> {
    return await db.select().from(people).orderBy(asc(people.nome));
  }

  async getPeopleByType(type: string): Promise<Person[]> {
    return await db
      .select()
      .from(people)
      .where(or(eq(people.tipo, type), eq(people.tipo, 'Ambos')))
      .orderBy(asc(people.nome));
  }

  async getActivePeople(type?: string): Promise<Person[]> {
    if (type) {
      return await db
        .select()
        .from(people)
        .where(and(
          eq(people.status, 'Ativo'),
          or(eq(people.tipo, type), eq(people.tipo, 'Ambos'))
        ))
        .orderBy(asc(people.nome));
    }

    return await db
      .select()
      .from(people)
      .where(eq(people.status, 'Ativo'))
      .orderBy(asc(people.nome));
  }

  // Devolution methods
  async getDevolution(id: number): Promise<Devolution | undefined> {
    const [devolution] = await db.select().from(devolutions).where(eq(devolutions.id, id));
    return devolution || undefined;
  }

  async createDevolution(insertDevolution: InsertDevolution): Promise<Devolution> {
    const [devolution] = await db
      .insert(devolutions)
      .values(insertDevolution)
      .returning();
    return devolution;
  }

  async updateDevolution(id: number, devolutionData: Partial<Devolution>): Promise<Devolution | undefined> {
    const [devolution] = await db
      .update(devolutions)
      .set({ ...devolutionData, updatedAt: new Date() })
      .where(eq(devolutions.id, id))
      .returning();
    return devolution || undefined;
  }

  async getAllDevolutions(): Promise<Devolution[]> {
    return await db.select().from(devolutions).orderBy(desc(devolutions.createdAt));
  }

  async searchDevolutions(criteria: any): Promise<Devolution[]> {
    const conditions = [];

    if (criteria.codigo_peca) {
      conditions.push(like(devolutions.codigo_peca, `%${criteria.codigo_peca}%`));
    }
    if (criteria.descricao_peca) {
      conditions.push(like(devolutions.descricao_peca, `%${criteria.descricao_peca}%`));
    }
    if (criteria.cliente_id) {
      conditions.push(eq(devolutions.cliente_id, criteria.cliente_id));
    }
    if (criteria.mecanico_id) {
      conditions.push(eq(devolutions.mecanico_id, criteria.mecanico_id));
    }
    if (criteria.numero_pedido) {
      conditions.push(like(devolutions.numero_pedido, `%${criteria.numero_pedido}%`));
    }
    if (criteria.tipo_acao) {
      conditions.push(eq(devolutions.tipo_acao, criteria.tipo_acao));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(devolutions)
        .where(and(...conditions))
        .orderBy(desc(devolutions.createdAt));
    }

    return await db.select().from(devolutions).orderBy(desc(devolutions.createdAt));
  }

  // Utility methods
  async generatePersonCode(): Promise<string> {
    const allPeople = await db.select().from(people);
    const existingCodes = allPeople.map(p => p.codigo);
    
    let newCode = '';
    let counter = 1;
    
    do {
      newCode = `P${counter.toString().padStart(4, '0')}`;
      counter++;
    } while (existingCodes.includes(newCode));
    
    return newCode;
  }
}

export const storage = new DatabaseStorage();
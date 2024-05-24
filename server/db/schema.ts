import { text, integer, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const messagesTable = sqliteTable(
    'messages',
    {
        id: text('id'),
        id_offset: integer('id_offset').primaryKey({ autoIncrement: true }),
        content: text('content'),
        username: text('username'),
    }
);

export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;

export type DatabaseSchema = {
    messagesTable: typeof messagesTable;
};
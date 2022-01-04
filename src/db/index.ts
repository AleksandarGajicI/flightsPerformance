import dotenv from 'dotenv';
import { Pool, QueryResult, PoolClient } from 'pg';

dotenv.config();

let client: PoolClient;

export type QueryCallback<T> = (err: Error, res: QueryResult<T>) => void;

export const connectToDb = async () => {
    if (!client) client = await (new Pool({
        port: 5432,
        user: process.env.POSTGRESQL_USER,
        host: 'localhost',
        database: 'flights',
        password: process.env.POSTGRESQL_PASSWORD,
    })).connect();

    return getWrapperClient();
}

export const getWrapperClient = () => {
    if (!client) throw new Error('client not connected');

    return {
        query: <T = any>(text: string, params: string[] = []) => client.query(text, params) as Promise<QueryResult<T>>,
    }
}

export const getNativeClient = () => client;

export * from './loadFlights';
import { Pool, QueryResult, PoolClient } from 'pg';


export type QueryCallback<T> = (err: Error, res: QueryResult<T>) => void;

let client: PoolClient;

export const connectToDb = async () => {
    if (!client) client = await (new Pool({
        port: 5432,
        user: 'postgres',
        host: 'localhost',
        database: 'flights',
        password: 'PUT PASSWORD HERE',
    })).connect();

    return getClient();
}

export const getClient = () => {
    if (!client) throw new Error('client not connected');

    return {
        query: <T = any>(text: string, params = [], callback: QueryCallback<T>) => client.query(text, params, callback),
    }
}
declare module 'pg' {
  export interface QueryResult<Row = unknown> {
    rows: Row[];
  }

  export interface PoolConfig {
    connectionString?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<Row = unknown>(text: string, values?: unknown[]): Promise<QueryResult<Row>>;
  }
}

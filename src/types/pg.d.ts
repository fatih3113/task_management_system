declare module 'pg' {
  export interface ClientConfig {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  }

  export class Client {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    end(): Promise<void>;
    query(
      text: string,
      values?: unknown[],
    ): Promise<{ rowCount: number | null; rows: unknown[] }>;
  }
}


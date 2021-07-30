import { ConnectionPool, IProcedureResult, ISqlType, IResult, Request } from 'mssql';

const poolConfig = () => ({
    driver: process.env.SQL_DRIVER as string,
    server: process.env.SQL_SERVER as string,
    database: process.env.SQL_DATABASE as string,
    user: process.env.SQL_UID as string,
    password: process.env.SQL_PWD as string,
    options: {
        encrypt: false,
        enableArithAbort: false
    },
});

export class DataAccess {

    static pool: ConnectionPool;

    static async connect() {
        if (!DataAccess.pool) {
            DataAccess.pool = new ConnectionPool(poolConfig());
        }
        if (!DataAccess.pool.connected) {
            await DataAccess.pool.connect();
        }
    }

    static async query<T>(command: string, inputs: Params[] = [], outputs: Params[] = []): Promise<IResult<T>> {
        await DataAccess.connect();
        const request = DataAccess.pool.request();
        DataAccess.assignParams(request, inputs, outputs);
        return request.query<T>(command);
    }

    static async queryEntity<T, E>(command: string, entity: E, outputs: Params[] = []): Promise<IResult<T>> {
        await DataAccess.connect();
        const request = DataAccess.pool.request();
        const inputs = DataAccess.fetchParams(entity);
        DataAccess.assignParams(request, inputs, outputs);
        return request.query<T>(command);
    }

    static async execute<T>(procedure: string, inputs: Params[] = [], outputs: Params[] = []): Promise<IProcedureResult<T>> {
        await DataAccess.connect();
        const request = DataAccess.pool.request();
        DataAccess.assignParams(request, inputs, outputs);
        return request.execute<T>(procedure);
    }

    static async executeEntity<T, E>(command: string, entity: E, outputs: Params[] = []): Promise<IResult<T>> {
        await DataAccess.connect();
        const request = DataAccess.pool.request();
        const inputs = DataAccess.fetchParams(entity);
        DataAccess.assignParams(request, inputs, outputs);
        return request.execute<T>(command);
    }

    private static assignParams(request: Request, inputs: Params[], outputs: Params[]) {
        [inputs, outputs].forEach((operations, index) => {
            operations.forEach(operation => {
                if (operation.type) {
                    index === 0 ?
                        request.input(operation.name, operation.type, operation.value) :
                        request.output(operation.name, operation.type, operation.value);
                } else {
                    index === 0 ?
                        request.input(operation.name, operation.value) :
                        request.output(operation.name, operation.value);
                }
            });
        });
    }

    private static fetchParams<T>(entity: T): Params[] {
        const params: Params[] = [];
        for (const key in entity) {
            /* istanbul ignore else */
            if ((entity as any).hasOwnProperty(key)) {
                const value = entity[key];
                params.push({
                    name: key,
                    value
                });
            }
        }
        return params;
    }
}

export interface Params {
    name: string;
    value: any;
    type?: (() => ISqlType) | ISqlType;
}

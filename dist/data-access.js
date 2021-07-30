"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAccess = void 0;
const mssql_1 = require("mssql");
const poolConfig = () => ({
    driver: process.env.SQL_DRIVER,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_UID,
    password: process.env.SQL_PWD,
    options: {
        encrypt: false,
        enableArithAbort: false
    },
});
class DataAccess {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!DataAccess.pool) {
                DataAccess.pool = new mssql_1.ConnectionPool(poolConfig());
            }
            if (!DataAccess.pool.connected) {
                yield DataAccess.pool.connect();
            }
        });
    }
    static query(command, inputs = [], outputs = []) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DataAccess.connect();
            const request = DataAccess.pool.request();
            DataAccess.assignParams(request, inputs, outputs);
            return request.query(command);
        });
    }
    static queryEntity(command, entity, outputs = []) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DataAccess.connect();
            const request = DataAccess.pool.request();
            const inputs = DataAccess.fetchParams(entity);
            DataAccess.assignParams(request, inputs, outputs);
            return request.query(command);
        });
    }
    static execute(procedure, inputs = [], outputs = []) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DataAccess.connect();
            const request = DataAccess.pool.request();
            DataAccess.assignParams(request, inputs, outputs);
            return request.execute(procedure);
        });
    }
    static executeEntity(command, entity, outputs = []) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DataAccess.connect();
            const request = DataAccess.pool.request();
            const inputs = DataAccess.fetchParams(entity);
            DataAccess.assignParams(request, inputs, outputs);
            return request.execute(command);
        });
    }
    static assignParams(request, inputs, outputs) {
        [inputs, outputs].forEach((operations, index) => {
            operations.forEach(operation => {
                if (operation.type) {
                    index === 0 ?
                        request.input(operation.name, operation.type, operation.value) :
                        request.output(operation.name, operation.type, operation.value);
                }
                else {
                    index === 0 ?
                        request.input(operation.name, operation.value) :
                        request.output(operation.name, operation.value);
                }
            });
        });
    }
    static fetchParams(entity) {
        const params = [];
        for (const key in entity) {
            /* istanbul ignore else */
            if (entity.hasOwnProperty(key)) {
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
exports.DataAccess = DataAccess;

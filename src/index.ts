import dotenv from 'dotenv';
import { DataAccess } from './data-access';
import { Employee } from './models';

dotenv.config();

(async function () {
    const employees = await DataAccess.query<Employee[]>(`SELECT * FROM Employee;`);
    console.log(employees);
})();
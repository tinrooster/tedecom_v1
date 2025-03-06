import { Transform } from 'stream';
import { stringify } from 'csv-stringify';

export interface CSVOptions {
    headers?: string[];
    delimiter?: string;
}

export const generateCSV = async (data: any[], options: CSVOptions = {}): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stringifier = stringify({
            header: true,
            columns: options.headers,
            delimiter: options.delimiter || ',',
        });

        const transformer = new Transform({
            transform(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            },
            flush(callback) {
                const csvContent = Buffer.concat(chunks).toString();
                resolve(csvContent);
                callback();
            }
        });

        stringifier.on('error', reject);
        transformer.on('error', reject);

        stringifier.pipe(transformer);
        data.forEach(row => stringifier.write(row));
        stringifier.end();
    });
};

export default {
    generateCSV
};

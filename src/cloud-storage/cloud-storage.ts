import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ndjson from 'ndjson';
import { Storage } from '@google-cloud/storage';

const client = new Storage();

const bucket = 'send-it-digital-test';

export const writeFile = async (rows: Record<string, any>[], filename: string) => {
    return pipeline(
        Readable.from(rows),
        ndjson.stringify(),
        client.bucket(bucket).file(filename).createWriteStream(),
    ).then(() => filename);
};

import serverless from 'serverless-http';
import { app } from '../../src/app.js';

// serverless-http does not infer binary responses from the content type: without
// an explicit list it base64-encodes nothing, so Buffer bodies get utf8-decoded
// and every compressed PDF stream is destroyed in transit. Text types (JSON, CSV)
// are deliberately left off this list so they keep their charset handling.
export const handler = serverless(app, {
  binary: ['application/pdf', 'application/octet-stream', 'application/zip', 'image/*', 'font/*'],
});

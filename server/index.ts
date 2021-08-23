import next from 'next';

import * as dotenv from 'dotenv';
import express from 'express';
import Gun from 'gun';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  Gun({web: server});

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    //tslint:disable-next-line:no-console
    console.log(
      `> Server listening at 'http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`,
    );
  });

  //tslint:disable-next-line:no-console
  console.log('GUN', Gun.version);
});

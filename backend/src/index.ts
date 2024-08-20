import express, { response } from 'express';
import logger from './middleware/logger';
import { rateLimiter } from './middleware/rateLimiter';
import validator from 'validator';
import helmet from 'helmet';
import urlMetadata from 'url-metadata';
import { Request as expressReq, Response as expressRes } from 'express';
import cookieParser from 'cookie-parser';

import { corsOptions } from './config/corsOptions';
import cors from 'cors';
import csrf from './middleware/csrf';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(logger);
app.use(csrf);

app.post('/fetch-data', async (req: expressReq, res: expressRes) => {
  try {
    if (!req.body) {
      return res.status(400).json({ err: 'No body in request' });
    }

    const { urls } = req.body;
    if (!urls) {
      return res.status(400).json({ err: 'No urls in request body' });
    }

    if (!Array.isArray(urls) || urls.length < 3) {
      return res.status(400).json({
        err: 'Server got less than 3 URLs. Try again with more URLs.',
      });
    }

    // Fetch URLs simultaneously. Each fetch is independent.
    const URLPromises = urls.map(async (url, index) => {
      try {
        if (!validator.isURL(url)) {
          throw new Error('Invalid URL.');
        }
        const response = await urlMetadata(url)
          .then((metadata) => {
            return metadata;
          })
          .catch((err) => {
            throw new Error('Invalid URL.');
          });

        const { title, description, image } = response;

        // Everything went well. resolve
        // console.log(`Resolving ${url}`);
        return Promise.resolve({
          index: index,
          url: url,
          title: title ? title : 'No title in metadata.',
          description: description
            ? description
            : 'No description in metadata.',
          image: image ? image : 'No image in metadata.',
        });
      } catch (err) {
        let errorMessege = `Failed to fetch the metadata of this URL. :(`;
        if (err instanceof Error) {
          errorMessege = err.message;
        }
        // Capture errors - rejecting the promise.
        return Promise.reject({
          index: index,
          url: url,
          error: errorMessege,
        });
      }
    });

    Promise.allSettled(URLPromises).then((fetchedMetadatas) => {
      res.status(200).json({ metadatas: fetchedMetadatas });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ err: 'Server error occured while fetching data.' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

export default app;

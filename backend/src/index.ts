import express, { response } from 'express';
import logger from './middleware/logger';
import urlMetadata from 'url-metadata';
import { Request as expressReq, Response as expressRes } from 'express';

export async function fetchData(req: expressReq, res: expressRes) {}

import { corsOptions } from './config/corsOptions';
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());

// app.get('/', async (req: expressReq, res: expressRes) => {
//   try {
//     const url = 'https://www.npmjs.com/package/dfurl-metadata';
//     const metadata = await urlMetadata(url);
//     console.log(metadata);
//     const { title, description, image } = metadata;
//     console.log(title);
//     console.log(description);
//     console.log(image);
//   } catch (err) {
//     throw new Error('Failed to fetch metadata.');
//   }
// });

app.post('/fetch-data', async (req: expressReq, res: expressRes) => {
  try {
    if (!req.body) {
      console.error('No body');
      return res.status(400).json({ err: 'No body in request' });
    }

    const { urls } = req.body;
    if (!urls) {
      console.error('No urls in body');
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
        console.log(`Fetching metadata of: ${url}`);
        const response = await urlMetadata(url, {
          ensureSecureImageRequest: true,
        })
          .then((metadata) => {
            return metadata;
          })
          .catch((err) => {
            throw new Error('Invalid URL.');
          });

        const { title, description, image } = response;
        // if (!title && !description && !image) {
        //   throw new Error(
        //     'No title, description or image in the fetched metadata.'
        //   );
        // }

        // Everything went well. resolve
        console.log(`Resolving ${url}`);
        return Promise.resolve({
          index: index,
          url: url,
          title: title ?? 'No title in metadata.',
          description: description ?? 'No description in metadata.',
          image: image ?? 'No image in metadata.',
        });
      } catch (err) {
        console.log(`Rejecting ${url}`);
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

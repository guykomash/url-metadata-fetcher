import 'dotenv/config';
const MODE = process.env.MODE;
const clientUrl =
  MODE === 'development' ? process.env.CLIENT_URL_DEV : process.env.CLIENT_URL;
const corsOptions = {
  origin: clientUrl,
};
export { corsOptions };

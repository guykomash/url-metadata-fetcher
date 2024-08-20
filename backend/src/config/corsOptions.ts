const clientUrl = process.env.CLIENT_URL || 'http://127.0.0.1:8080';

const corsOptions = {
  origin: clientUrl,
};

export { corsOptions };

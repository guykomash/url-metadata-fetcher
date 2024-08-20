import request from 'supertest';
import app from '../src/index';

describe('POST /fetch-data', () => {
  it('should return 400 if no urls found in request body', async () => {
    const response = await request(app)
      .post('/fetch-data')
      .send({ key: 'stam' })
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body).toEqual({ err: 'No urls in request body' });
  });

  it('should return 400 if fewer than 3 URLs are provided', async () => {
    const response = await request(app)
      .post('/fetch-data')
      .send({ urls: ['http://example.com'] }) // Send fewer than 3 URLs
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      err: 'Server got less than 3 URLs. Try again with more URLs.',
    });
  });

  it('should return 200 if 3 or more URLs are provided', async () => {
    const response = await request(app)
      .post('/fetch-data')
      .send({
        urls: [
          'http://example.com',
          'http://example2.com',
          'http://example3.com',
        ],
      }) // Send 3 URLs
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('metadatas');

    const metadatas = response.body.metadatas;
    expect(metadatas).toHaveLength(3);
  });

  it('should return 200 and rejected metadatas if invalid urls.', async () => {
    const response = await request(app)
      .post('/fetch-data')
      .send({
        urls: ['invalidURL1', 'invalidURL2', 'invalidURL3'],
      }) // Send 3 URLs
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('metadatas');

    const metadatas = response.body.metadatas;
    expect(metadatas).toHaveLength(3);

    metadatas.forEach((element: { status: string; reason: any }) => {
      expect(element).toHaveProperty('status');
      expect(element).toHaveProperty('reason');
      expect(element.status).toEqual('rejected');
      expect(element.reason).toHaveProperty('index');
      expect(element.reason).toHaveProperty('url');
      expect(element.reason).toHaveProperty('error');
      expect(typeof element.reason.index).toBe('number');
      expect(typeof element.reason.url).toBe('string');
      expect(element.reason.error).toEqual('Invalid URL.');
    });
  });

  it('should return 200 and 1 fulfiled, 2 rejected metadatas if only first is valid url.', async () => {
    const response = await request(app)
      .post('/fetch-data')
      .send({
        urls: ['http://www.google.com/', 'invalidURL2', 'invalidURL3'],
      }) // Send 3 URLs
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('metadatas');

    const metadatas = response.body.metadatas;
    expect(metadatas).toHaveLength(3);

    metadatas.forEach(
      (element: { status: string; reason?: any; value?: any }) => {
        expect(element).toHaveProperty('status');
        if (element.status === 'rejected') {
          expect(element).toHaveProperty('reason');
          expect(element.reason).toHaveProperty('index');
          expect(element.reason).toHaveProperty('url');
          expect(element.reason).toHaveProperty('error');
          expect(typeof element.reason.index).toBe('number');
          expect(typeof element.reason.url).toBe('string');
          expect(element.reason.error).toEqual('Invalid URL.');
        } else {
          expect(element.status).toBe('fulfilled');
          expect(element).toHaveProperty('value');
          expect(element.value).toHaveProperty('index');
          expect(element.value).toHaveProperty('url');
          expect(element.value).toHaveProperty('title');
          expect(element.value).toHaveProperty('description');
          expect(element.value).toHaveProperty('image');

          // Check types of value.
          expect(typeof element.value.index).toBe('number');
          expect(typeof element.value.url).toBe('string');
          expect(typeof element.value.title).toBe('string');
          expect(typeof element.value.description).toBe('string');
          expect(typeof element.value.image).toBe('string');
        }
      }
    );
  });
});

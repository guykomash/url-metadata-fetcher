import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import './App.css';
import { Metadata } from './components/Metadata';
import { ErorrMetadata } from './components/ErorrMetadata';
import { invalidURLI, metadataItemI, URLObj } from './types';
import { v4 as uuidv4 } from 'uuid';

function isMetadataItem(object: any): object is metadataItemI {
  return 'title' in object && 'image' in object && 'description' in object;
}

function App() {
  const [urls, setUrls] = useState<URLObj[]>([
    { id: uuidv4(), url: '' },
    { id: uuidv4(), url: '' },
    { id: uuidv4(), url: '' },
  ]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [metadatas, setMetadatas] = useState<(metadataItemI | invalidURLI)[]>(
    []
  );

  const postUrls = async (urls: string[]) => {
    setError('');
    setLoading(true);
    try {
      if (urls.length < 3) {
        throw new Error('Not Enough URLs.');
      }
      console.log('urls', urls);
      const response = await axios.post('http://localhost:3000/fetch-data', {
        urls: urls,
      });
      const respMetadatas = response.data.metadatas;
      console.log('RESPONSE');
      console.log(respMetadatas);
      setMetadatas(
        respMetadatas.map((resp: PromiseSettledResult<metadataItemI>) => {
          if (resp.status == 'fulfilled') {
            const { index, url, title, description, image } = resp.value;
            return {
              index: index,
              url: url,
              title: title,
              description: description,
              image: image,
            };
          } else {
            // status rejected...
            const { index, url, error } = resp.reason;
            return {
              index,
              url,
              error,
            };
          }
        })
      );

      setLoading(false);
    } catch (err) {
      setLoading(false);
      let message = `${err}`;
      if (err instanceof AxiosError) {
        if (err.response?.status == 429) {
          message = err.response.data;
        } else {
          message = err.message;
        }
      }
      setError(message ?? 'Something went wrong...');
    }
  };

  const handleUrlChange = (id: string, value: string) => {
    setUrls((prev) =>
      prev.map((ustate) =>
        ustate.id === id ? { id: ustate.id, url: value } : ustate
      )
    );
    console.log(urls);
  };
  const handleSubmit = async () => {
    setMetadatas([]);

    // check that urls are valid !
    const validURLs = urls.map((u) => u.url).filter((u) => u);

    await postUrls(validURLs);
  };

  const handleURLDelete = (id: string) => {
    if (urls.length <= 3) {
      alert('Must have at least 3 urls.');
      return;
    } else {
      setUrls((prev) => prev.filter((ustate) => ustate.id !== id));
    }
  };

  const handleURLAdd = () => {
    const newUrl = { id: uuidv4(), url: '' };
    console.log(newUrl);
    setUrls((prev) => [...prev, newUrl]);
  };
  return (
    <>
      <header>
        <h1>Fetch URLs Metadata</h1>
      </header>
      <main>
        <br />
        <h2 style={{ padding: '1rem' }}>Enter your URLS here:</h2>
        <form>
          {urls.map((urlObj, index) => (
            <div className="input-container" key={urlObj.id}>
              <strong>{index}:&nbsp;&nbsp;</strong>
              <input
                type="text"
                value={urlObj.url}
                onChange={(e) => handleUrlChange(urlObj.id, e.target.value)}
                placeholder={`Enter URL here...`}
                style={{ height: '50px', margin: '0.5rem' }}
              />
              {index >= 3 ? (
                <button
                  style={{
                    color: '#ff4c4c',
                    fontSize: '2rem',
                    padding: '0.8rem',
                    width: '40px',

                    // marginBottom: '1rem',
                  }}
                  onClick={() => handleURLDelete(urlObj.id)}
                >
                  X
                </button>
              ) : (
                <></>
              )}
            </div>
          ))}
          <div className="buttons-container">
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                fontSize: '1.3rem',
              }}
              onClick={handleURLAdd}
            >
              ➕ Add another URL
            </button>
            <br />
            <button
              type="button"
              style={{ fontSize: '2rem' }}
              onClick={handleSubmit}
            >
              Submit 🚀
            </button>
            <br />
          </div>
        </form>

        {error && <p style={{ color: '#ff4c4c', fontSize: '2rem' }}>{error}</p>}
        {loading && <p>Fetching Metadatas...</p>}

        <br />
        {metadatas.length > 0 ? (
          <h2 style={{ padding: '1rem' }}>Fetched Metadatas:</h2>
        ) : (
          <></>
        )}

        <div className="metadatas-container">
          {metadatas.length > 0 &&
            metadatas.map((item) => {
              const borderColor = isMetadataItem(item)
                ? '1px solid green'
                : '1px solid red';
              return (
                <div
                  key={item.index}
                  style={{
                    margin: '10px',
                    border: borderColor,
                    borderRadius: '30px',
                    display: 'flex',
                    textOverflow: 'clip',
                    minWidth: '200px',
                  }}
                >
                  {isMetadataItem(item) ? (
                    <Metadata {...item} />
                  ) : (
                    <ErorrMetadata {...item} />
                  )}
                </div>
              );
            })}
        </div>
      </main>
    </>
  );
}

export default App;

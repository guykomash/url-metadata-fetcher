import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import './App.css';
import { Metadata } from './components/Metadata';
import { invalidURL, metadataItem, URLObj } from './types';
import { InvalidURL } from './components/invalidURL';
import { v4 as uuidv4 } from 'uuid';

function isMetadataItem(object: any): object is metadataItem {
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
  const [metadatas, setMetadatas] = useState<(metadataItem | invalidURL)[]>([]);

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
        respMetadatas.map((resp: PromiseSettledResult<metadataItem>) => {
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
        message = err.message;
      }

      setError(message ?? 'Something went wrong...');
      console.log(err);
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
    setUrls((prev) => [...prev, { id: uuidv4(), url: '' }]);
  };
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center',
        flexBasis: '0',
      }}
    >
      <h1>Fetch URLs Metadata</h1>
      {urls.map((urlObj, index) => (
        <div key={urlObj.id}>
          <div className="input-container">
            <strong>{index}:&nbsp;&nbsp;</strong>
            <input
              type="text"
              value={urlObj.url}
              onChange={(e) => handleUrlChange(urlObj.id, e.target.value)}
              placeholder={`Enter URL here...`}
              style={{ width: '400px', height: '20px', margin: '0.5rem' }}
            />
            {index >= 3 ? (
              <button
                style={{
                  backgroundColor: '#f2f2f2',
                  color: '#ff4c4c',
                  fontSize: '1rem',
                  padding: '0.8rem',
                  height: '3rem',
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
        </div>
      ))}
      <div className="buttons-container">
        <button style={{ margin: '0.5rem' }} onClick={handleURLAdd}>
          Add Another URL
        </button>
        <br />
        <button
          style={{ margin: '1rem', fontSize: '1.5rem' }}
          onClick={handleSubmit}
        >
          Submit
        </button>
        <br />
      </div>

      {error && <p style={{ color: '#ff4c4c' }}>{error}</p>}
      {loading && <p>Fetching Metadatas...</p>}

      {/* show metadata items */}
      <div className="metadatas-container">
        {metadatas.length > 0 &&
          metadatas.map((item) => (
            <div
              key={item.index}
              style={{
                margin: '10px',
                border: '1px solid #ddd',
                borderRadius: '1px',
                display: 'flex',
              }}
            >
              {isMetadataItem(item) ? (
                <Metadata {...item} />
              ) : (
                <InvalidURL {...item} />
              )}
            </div>
          ))}
      </div>
    </main>
  );
}

export default App;

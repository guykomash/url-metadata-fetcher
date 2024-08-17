import { invalidURL } from '../types';

export const InvalidURL = ({ index, url, error }: invalidURL) => {
  return (
    <div key={index}>
      <p>{index}</p>
      <p>{url}</p>
      <h2>{`Something went wrong with this URL ❌`}</h2>
      <p>
        <strong>Message from server: </strong>
        <span style={{ color: '#ff4c4c' }}>{error}</span>
      </p>
    </div>
  );
};

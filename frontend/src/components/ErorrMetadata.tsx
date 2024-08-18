import { invalidURLI } from '../types';

export const ErorrMetadata = ({ index, url, error }: invalidURLI) => {
  return (
    <div className="metadata" key={index}>
      <p>
        <strong>Number: </strong>
        {index}
      </p>
      <p>
        <strong>URL: </strong>
        {url}
      </p>
      <h2>{`Something went wrong with this URL ❌`}</h2>
      <p>
        <strong>Message from server: </strong>
        <span style={{ color: '#ff4c4c' }}>{error}</span>
      </p>
    </div>
  );
};

import { metadataItemI } from '../types';

export const Metadata = ({
  index,
  url,
  title,
  description,
  image,
}: metadataItemI) => {
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
      <p>
        <strong>Title: </strong>
        {title}
      </p>

      <p>
        {' '}
        <strong>Description: </strong>
        {description}
      </p>
      <p>
        {' '}
        <strong>Image: </strong>
        {image}
      </p>
    </div>
  );
};

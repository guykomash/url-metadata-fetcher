import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import axios from 'axios';
import App from '../src/App.tsx';

vi.mock('axios');

describe('App Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render App', () => {
    render(<App />);
    expect(screen.getByText('Fetch URLs Metadata'));
    expect(screen.getByText('Enter your URLS here:'));
  });

  it('should add a new URL input field when "Add another URL" button is clicked', () => {
    render(<App />);
    const addURLbtn = screen.getByText('Add another URL ➕');
    fireEvent.click(addURLbtn);
    const inputFields = screen.getAllByPlaceholderText('Enter URL here...');
    expect(inputFields.length).toBe(4); // 3 initial + 1 added
  });

  it('should show an error when submitting with less than 3 URLs', () => {
    render(<App />);
    const submitButton = screen.getByText('Submit 🚀');
    fireEvent.click(submitButton);
    expect(screen.getByText('Error: Not Enough URLs.'));
  });

  it('should remove a URL input when "X" button is clicked', () => {
    render(<App />);
    const addURLbtn = screen.getByText('Add another URL ➕');
    fireEvent.click(addURLbtn);
    const afterAddInputFields =
      screen.getAllByPlaceholderText('Enter URL here...');
    expect(afterAddInputFields.length).toBe(4); // 3 initial + 1 added

    const deleteURLbtn = screen.getByText('X');
    fireEvent.click(deleteURLbtn);
    const afterDeleteInputFields =
      screen.getAllByPlaceholderText('Enter URL here...');
    expect(afterDeleteInputFields.length).toBe(3); // 3 initial + 1 added
  });

  it('should show Network error if API request fail.', async () => {
    (axios.post as vi.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(<App />);
    const inputFields = screen.getAllByPlaceholderText('Enter URL here...');
    fireEvent.change(inputFields[0], {
      target: { value: 'http://google.com/' },
    });
    fireEvent.change(inputFields[1], {
      target: { value: 'https://www.youtube.com/' },
    });
    fireEvent.change(inputFields[2], {
      target: { value: 'https://github.com/guykomash' },
    });

    const submitButton = screen.getByText('Submit 🚀');
    fireEvent.click(submitButton);

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Network Error/));
    });
  });

  it('should display fetched metadata after a successful API request', async () => {
    // Mock a successful Axios response
    const mockMetadata = [
      {
        status: 'fulfilled',
        value: {
          index: 0,
          url: 'https://www.glassdoor.com/',
          title: 'Glassdoor',
          description: 'Glassdoor description.',
          image: 'No image in metadata.',
        },
      },
      {
        status: 'fulfilled',
        value: {
          index: 1,
          url: 'https://www.youtube.com/',
          title: 'YouTube',
          description: 'YouTube description',
          image: 'No image in metadata.',
        },
      },
      {
        status: 'fulfilled',
        value: {
          index: 2,
          url: 'https://github.com/guykomash',
          title: 'guykomash (Guy Komash) · GitHub',
          description: 'Github description',
          image: 'No image in metadata.',
        },
      },
    ];

    (axios.post as vi.Mock).mockResolvedValueOnce({
      data: { metadatas: mockMetadata },
    });

    render(<App />);
    const inputFields = screen.getAllByPlaceholderText('Enter URL here...');
    fireEvent.change(inputFields[0], {
      target: { value: 'https://www.glassdoor.com/' },
    });
    fireEvent.change(inputFields[1], {
      target: { value: 'https://www.youtube.com/' },
    });
    fireEvent.change(inputFields[2], {
      target: { value: 'https://github.com/guykomash' },
    });

    const submitButton = screen.getByText('Submit 🚀');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Glassdoor'));
      expect(screen.getAllByText('Glassdoor description.'));

      expect(screen.getByText('YouTube'));
      expect(screen.getAllByText('YouTube description'));
      expect(screen.getAllByText('guykomash (Guy Komash) · GitHub'));
      expect(screen.getAllByText('Github description'));
    });
  });
});

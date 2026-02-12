import axios from 'axios';
import { AurinkoEmailClient } from '@/lib/clients/aurinko-email-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('AurinkoEmailClient', () => {
  let client: AurinkoEmailClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new AurinkoEmailClient('test-token');
  });

  describe('fetchUpdatedEmails', () => {
    it('sends GET with deltaToken param', async () => {
      const data = { records: [], nextPageToken: '', nextDeltaToken: 'dt2', length: 0 };
      mockedAxios.get.mockResolvedValue({ data });

      const result = await client.fetchUpdatedEmails({ deltaToken: 'dt1' });

      expect(result).toEqual(data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.aurinko.io/v1/email/sync/updated',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
          params: { deltaToken: 'dt1' },
        })
      );
    });

    it('sends GET with pageToken param', async () => {
      const data = { records: [], nextPageToken: '', nextDeltaToken: '', length: 0 };
      mockedAxios.get.mockResolvedValue({ data });

      await client.fetchUpdatedEmails({ pageToken: 'pt1' });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { pageToken: 'pt1' } })
      );
    });

    it('sends GET with both tokens', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { records: [], nextPageToken: '', nextDeltaToken: '', length: 0 },
      });

      await client.fetchUpdatedEmails({ deltaToken: 'dt', pageToken: 'pt' });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { deltaToken: 'dt', pageToken: 'pt' } })
      );
    });

    it('sends GET with no params when neither token provided', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { records: [], nextPageToken: '', nextDeltaToken: '', length: 0 },
      });

      await client.fetchUpdatedEmails({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: {} })
      );
    });
  });

  describe('performInitialSync', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('polls until ready then fetches emails', async () => {
      // First call: not ready, second call: ready
      mockedAxios.post
        .mockResolvedValueOnce({
          data: { ready: false, syncUpdatedToken: '', syncDeletedToken: '' },
        })
        .mockResolvedValueOnce({
          data: { ready: true, syncUpdatedToken: 'delta-1', syncDeletedToken: '' },
        });

      // fetchUpdatedEmails: single page, no more pages
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          records: [{ id: 'e1', threadId: 't1' }],
          nextPageToken: '',
          nextDeltaToken: 'delta-2',
          length: 1,
        },
      });

      const promise = client.performInitialSync();

      // Advance past the setTimeout(1000) for polling
      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toEqual({
        emails: [{ id: 'e1', threadId: 't1' }],
        deltaToken: 'delta-2',
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('paginates through multiple pages', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ready: true, syncUpdatedToken: 'delta-1', syncDeletedToken: '' },
      });

      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            records: [{ id: 'e1' }],
            nextPageToken: 'page2',
            nextDeltaToken: 'delta-2',
            length: 1,
          },
        })
        .mockResolvedValueOnce({
          data: {
            records: [{ id: 'e2' }],
            nextPageToken: '',
            nextDeltaToken: 'delta-3',
            length: 1,
          },
        });

      const result = await client.performInitialSync();

      expect(result!.emails).toHaveLength(2);
      expect(result!.deltaToken).toBe('delta-3');
    });

    it('returns undefined on error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.performInitialSync();

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });

    it('uses correct auth headers', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ready: true, syncUpdatedToken: 'dt', syncDeletedToken: '' },
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: { records: [], nextPageToken: '', nextDeltaToken: 'dt2', length: 0 },
      });

      await client.performInitialSync();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    it('updates deltaToken from nextDeltaToken', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ready: true, syncUpdatedToken: 'initial-delta', syncDeletedToken: '' },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          records: [{ id: 'e1' }],
          nextPageToken: '',
          nextDeltaToken: 'updated-delta',
          length: 1,
        },
      });

      const result = await client.performInitialSync();
      expect(result!.deltaToken).toBe('updated-delta');
    });
  });
});

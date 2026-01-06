import axios from 'axios';

import {
  EmailMessage,
  SyncResponse,
  UpdatedEmailsSyncResponse,
} from '../types/aurinkoDTO';

export class MailAccountWrapper {
  private accessToken;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async beginSync(): Promise<SyncResponse> {
    const response = await axios.post<SyncResponse>(
      'https://api.aurinko.io/v1/email/sync',
      {},
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          daysWithin: 1,
          bodyType: 'html',
        },
      }
    );

    return response.data;
  }

  async fetchUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }): Promise<UpdatedEmailsSyncResponse> {
    const params: Record<string, string> = {};
    if (deltaToken) params.deltaToken = deltaToken;
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.get<UpdatedEmailsSyncResponse>(
      'https://api.aurinko.io/v1/email/sync/updated',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params,
      }
    );

    return response.data;
  }

  async performInitialSync() {
    try {
      let syncResponse = await this.beginSync();
      while (!syncResponse.ready) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        syncResponse = await this.beginSync();
      }

      let deltaToken: string = syncResponse.syncUpdatedToken;
      let updatedEmailsResponse = await this.fetchUpdatedEmails({
        deltaToken,
      });
      if (updatedEmailsResponse.nextDeltaToken)
        deltaToken = updatedEmailsResponse.nextDeltaToken;

      let emails: EmailMessage[] = updatedEmailsResponse.records;
      while (updatedEmailsResponse.nextPageToken) {
        updatedEmailsResponse = await this.fetchUpdatedEmails({ deltaToken });
        emails = emails.concat(updatedEmailsResponse.records);
        if (updatedEmailsResponse.nextDeltaToken)
          deltaToken = updatedEmailsResponse.nextDeltaToken;
      }

      console.log(
        'initial sync completed, fetched ',
        emails.length,
        ' emails.'
      );

      return {
        emails,
        deltaToken,
      };
    } catch (err) {
      console.error(err);
    }
  }
}

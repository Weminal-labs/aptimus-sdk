import {
  CreateKeylessZkpApiInput,
  CreateKeylessZkpApiResponse,
  CreateSponsoredTransactionApiInput,
  CreateSponsoredTransactionApiResponse,
} from "./type";

const DEFAULT_API_URL = "http://localhost:3000";
const KEYLESS_HEADER = "keyless-jwt";

export interface AptimusClientConfig {
  /** The API key for the Aptimus app, available in the Aptimus Portal. */
  apiKey: string;

  /** The API URL for Aptimus. In most cases, this should not be set. */
  apiUrl?: string;
}

export class AptimusClientError extends Error {
  errors: { code: string; message: string; data: unknown }[] = [];

  constructor(status: number, response: string) {
    let errors;
    try {
      const parsedResponse = JSON.parse(response) as {
        errors: { code: string; message: string; data: unknown }[];
      };
      errors = parsedResponse.errors;
    } catch (e) {
      // Ignore
    }
    const cause = errors?.[0] ? new Error(errors[0].message) : undefined;
    // @ts-ignore - Error constructor just take 0-1 arguments
    super(`Request to Aptimus API failed (status: ${status})`, {
      cause,
    });
    this.errors = errors ?? [];
    this.name = "AptimusClientError";
  }
}

/**
 * A low-level client for interacting with the Aptimus API.
 */
export class AptimusClient {
  private version: string;
  private apiUrl: string;
  private apiKey: string;

  constructor(config: AptimusClientConfig) {
    this.version = "v1";
    this.apiUrl = config.apiUrl ?? DEFAULT_API_URL;
    this.apiKey = config.apiKey;
  }

  createZkLoginZkp(input: CreateKeylessZkpApiInput) {
    return this.fetch<CreateKeylessZkpApiResponse>("zklogin/zkp", {
      method: "POST",
      headers: {
        [KEYLESS_HEADER]: input.jwt,
      },
      body: JSON.stringify({
        network: input.network,
        ephemeralKeyPairBase64: input.ephemeralKeyPairBase64,
      }),
    });
  }

  createSponsoredTransaction(input: CreateSponsoredTransactionApiInput) {
    return this.fetch<CreateSponsoredTransactionApiResponse>(
      "transaction-blocks/sponsor",
      {
        method: "POST",
        headers: input.jwt
          ? {
              [KEYLESS_HEADER]: input.jwt,
            }
          : {},
        body: JSON.stringify({
          network: input.network,
          transactionBytesBase64: input.transactionBytesBase64,
          sender: input.sender,
          allowedAddresses: input.allowedAddresses,
          allowedMoveCallTargets: input.allowedMoveCallTargets,
        }),
      }
    );
  }

  private async fetch<T = unknown>(
    path: string,
    init: RequestInit
  ): Promise<T> {
    const res = await fetch(`${this.apiUrl}/${this.version}/${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Request-Id": crypto.randomUUID(),
      },
    });

    if (!res.ok) {
      throw new AptimusClientError(res.status, await res.text());
    }

    const { data } = await res.json();

    return data as T;
  }
}

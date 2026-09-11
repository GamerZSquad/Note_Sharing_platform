/**
 * Maps Blob upload failures to safe client responses.
 * Internal reasons are for server logs only — never returned to the browser.
 */
export class BlobUploadDenied extends Error {
  constructor(
    readonly status: 401 | 403 | 400,
    readonly logReason: string,
  ) {
    super(logReason);
    this.name = "BlobUploadDenied";
  }
}

export function blobUploadClientError(error: unknown): {
  status: number;
  body: { error: string };
  log: string;
} {
  if (error instanceof BlobUploadDenied) {
    if (error.status === 401) {
      return {
        status: 401,
        body: { error: "Sign in to upload notes" },
        log: error.logReason,
      };
    }
    if (error.status === 403) {
      return {
        status: 403,
        body: { error: "This account is suspended" },
        log: error.logReason,
      };
    }
    return {
      status: 400,
      body: { error: "Upload could not be authorized" },
      log: error.logReason,
    };
  }

  const detail =
    error instanceof Error ? error.message : "unknown non-Error rejection";
  return {
    status: 400,
    body: { error: "Upload could not be completed" },
    log: `unexpected: ${detail}`,
  };
}

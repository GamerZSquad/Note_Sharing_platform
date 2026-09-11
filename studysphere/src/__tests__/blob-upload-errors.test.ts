import { describe, expect, it } from "vitest";
import { BlobUploadDenied, blobUploadClientError } from "@/lib/blob-upload-errors";

describe("blobUploadClientError", () => {
  it("maps unauthenticated denials to a fixed 401 message", () => {
    const mapped = blobUploadClientError(
      new BlobUploadDenied(401, "unauthenticated token request"),
    );
    expect(mapped.status).toBe(401);
    expect(mapped.body).toEqual({ error: "Sign in to upload notes" });
    expect(mapped.log).toBe("unauthenticated token request");
    expect(JSON.stringify(mapped.body)).not.toContain("token request");
  });

  it("maps suspended denials to a fixed 403 message", () => {
    const mapped = blobUploadClientError(
      new BlobUploadDenied(403, "suspended user token request"),
    );
    expect(mapped.status).toBe(403);
    expect(mapped.body).toEqual({ error: "This account is suspended" });
  });

  it("maps reservation/pathname failures to a fixed 400 without leaking internals", () => {
    const mapped = blobUploadClientError(
      new BlobUploadDenied(400, "pathname does not match reserved fileUrl"),
    );
    expect(mapped.status).toBe(400);
    expect(mapped.body).toEqual({ error: "Upload could not be authorized" });
    expect(mapped.body.error).not.toMatch(/pathname|fileUrl|reservation/i);
    expect(mapped.log).toContain("pathname");
  });

  it("never returns raw unexpected Error.message to the client", () => {
    const mapped = blobUploadClientError(
      new Error("Pathname does not match reserved upload target"),
    );
    expect(mapped.status).toBe(400);
    expect(mapped.body).toEqual({ error: "Upload could not be completed" });
    expect(mapped.body.error).not.toContain("Pathname");
    expect(mapped.log).toContain("Pathname does not match reserved upload target");
  });
});

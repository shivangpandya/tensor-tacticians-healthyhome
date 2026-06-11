import { createHash, createSign } from "node:crypto";
import { buildSearchPrompt, extractJsonObject, normalizeIntent } from "@/lib/search-intent";
import type { SearchIntent } from "@/lib/types";

function getOciPrivateKey() {
  const raw = process.env.OCI_PRIVATE_KEY;
  if (!raw) return "";
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function ociEndpoint() {
  if (process.env.OCI_GENAI_ENDPOINT_URL) {
    return process.env.OCI_GENAI_ENDPOINT_URL;
  }

  const region = process.env.OCI_REGION;
  if (!region) {
    return "";
  }

  return `https://inference.generativeai.${region}.oci.oraclecloud.com/20231130/actions/chat`;
}

function hasOciConfig() {
  const servingTarget = process.env.OCI_GENAI_MODEL_ID || process.env.OCI_GENAI_ENDPOINT_ID;
  return Boolean(
    process.env.OCI_TENANCY_OCID &&
      process.env.OCI_USER_OCID &&
      process.env.OCI_FINGERPRINT &&
      getOciPrivateKey() &&
      process.env.OCI_COMPARTMENT_OCID &&
      servingTarget &&
      ociEndpoint()
  );
}

function buildOciPayload(query: string) {
  const endpointId = process.env.OCI_GENAI_ENDPOINT_ID;
  const modelId = process.env.OCI_GENAI_MODEL_ID;

  return {
    compartmentId: process.env.OCI_COMPARTMENT_OCID,
    servingMode: endpointId
      ? {
          servingType: "DEDICATED",
          endpointId
        }
      : {
          servingType: "ON_DEMAND",
          modelId
        },
    chatRequest: {
      apiFormat: "GENERIC",
      messages: [
        {
          role: "USER",
          content: [
            {
              type: "TEXT",
              text: buildSearchPrompt(query)
            }
          ]
        }
      ],
      maxTokens: 900,
      temperature: 0,
      topP: 0.75
    }
  };
}

function signOciRequest(url: URL, body: string) {
  const method = "post";
  const path = `${url.pathname}${url.search}`;
  const host = url.host;
  const date = new Date().toUTCString();
  const bodyHash = createHash("sha256").update(body).digest("base64");
  const contentLength = Buffer.byteLength(body).toString();
  const signingHeaders = "(request-target) host date x-content-sha256 content-type content-length";
  const signingString = [
    `(request-target): ${method} ${path}`,
    `host: ${host}`,
    `date: ${date}`,
    `x-content-sha256: ${bodyHash}`,
    "content-type: application/json",
    `content-length: ${contentLength}`
  ].join("\n");
  const keyId = `${process.env.OCI_TENANCY_OCID}/${process.env.OCI_USER_OCID}/${process.env.OCI_FINGERPRINT}`;
  const privateKey = getOciPrivateKey();
  const signer = createSign("RSA-SHA256");
  signer.update(signingString);
  const signature = signer.sign(
    process.env.OCI_PRIVATE_KEY_PASSPHRASE
      ? { key: privateKey, passphrase: process.env.OCI_PRIVATE_KEY_PASSPHRASE }
      : privateKey,
    "base64"
  );

  return {
    Authorization: `Signature version="1",keyId="${keyId}",algorithm="rsa-sha256",headers="${signingHeaders}",signature="${signature}"`,
    date,
    host,
    "x-content-sha256": bodyHash,
    "content-type": "application/json",
    "content-length": contentLength
  };
}

function extractOciText(payload: unknown): string | null {
  const data = payload as {
    chatResponse?: {
      text?: string;
      message?: { content?: Array<{ text?: string }> };
      choices?: Array<{ message?: { content?: Array<{ text?: string }> | string } }>;
    };
  };

  const response = data.chatResponse;
  if (!response) return null;
  if (response.text) return response.text;
  const messageText = response.message?.content?.[0]?.text;
  if (messageText) return messageText;
  const choiceContent = response.choices?.[0]?.message?.content;
  if (typeof choiceContent === "string") return choiceContent;
  return choiceContent?.[0]?.text ?? null;
}

export async function parseWithOci(query: string, fallback: SearchIntent): Promise<SearchIntent | null> {
  if (!hasOciConfig()) {
    return null;
  }

  const endpoint = ociEndpoint();
  const url = new URL(endpoint);
  const body = JSON.stringify(buildOciPayload(query));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: signOciRequest(url, body),
      body
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const text = extractOciText(payload);
    if (!text) {
      return null;
    }

    const json = extractJsonObject(text);
    return json ? normalizeIntent(json, fallback) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

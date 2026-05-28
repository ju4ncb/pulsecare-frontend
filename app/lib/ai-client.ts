import { API_BASE_URL, getCookie } from "./api";
import { fetchAuthedJson } from "./api";

export type AiTrainSyncResponse = {
  message?: string;
  status?: string;
  run_id?: string;
  [key: string]: unknown;
};

export type AiTrainAsyncResponse = {
  run_id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
};

export type AiTrainStatusResponse = {
  run_id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
};

export type AiArtifactJsonResponse = {
  message?: string;
  path?: string;
  [key: string]: unknown;
};

export type AiArtifactResponse =
  | {
      kind: "file";
      filename: string;
      blob: Blob;
    }
  | {
      kind: "json";
      data: AiArtifactJsonResponse;
    };

export type AiPredictResponse = {
  predicted_label?: number;
  predicted_label_name?: string;
  probabilities?: Record<string, number>;
  [key: string]: unknown;
};

export type AiValidateResponse = {
  sample_count?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  confusion_matrix?: number[][];
  classification_report?: Record<string, Record<string, number>>;
  [key: string]: unknown;
};

export async function trainModelSync() {
  return fetchAuthedJson<AiTrainSyncResponse>("/api/ai/train", {
    method: "POST",
  });
}

export async function trainModelAsync() {
  return fetchAuthedJson<AiTrainAsyncResponse>("/api/ai/train/async", {
    method: "POST",
  });
}

export async function getTrainRunStatus(runId: string) {
  const safeRunId = encodeURIComponent(runId.trim());
  return fetchAuthedJson<AiTrainStatusResponse>(`/api/ai/train/${safeRunId}`);
}

function extractFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return "model_artifact.bin";
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] ?? "model_artifact.bin";
}

export async function getModelArtifact(): Promise<AiArtifactResponse> {
  const token = getCookie("pulsecare_token");

  const response = await fetch(`${API_BASE_URL}/api/ai/artifact`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let detail = response.statusText || "Request failed";

    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { detail?: string };
      detail = data.detail || detail;
    }

    throw new Error(detail);
  }

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as AiArtifactJsonResponse;
    return { kind: "json", data };
  }

  const blob = await response.blob();
  const filename = extractFilename(response.headers.get("content-disposition"));
  return { kind: "file", filename, blob };
}

export async function predictRiskWithGet(entryId: string) {
  return fetchAuthedJson<AiPredictResponse>(`/api/ai/predict/${encodeURIComponent(entryId.trim())}`);
}

export async function predictRiskWithPost(entryId: string) {
  return fetchAuthedJson<AiPredictResponse>(`/api/ai/predict/${encodeURIComponent(entryId.trim())}`, {
    method: "POST",
  });
}

export async function validateModel() {
  return fetchAuthedJson<AiValidateResponse>("/api/ai/validate");
}

import type { Workspace } from "@/lib/invoices";

export type WorkspaceSnapshot = { workspace: Workspace; revision: string };

async function request<T>(body?: object, query = ""): Promise<T> {
  const response = await fetch("/invoices/data" + query, body ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } : { cache: "no-store" });
  if (response.status === 401) throw new Error("Your session expired. Unlock the workspace again to continue.");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Unable to complete this request.");
  return data as T;
}

export const cloud = {
  load: () => request<WorkspaceSnapshot>(),
  loadHistory: () => request<WorkspaceSnapshot & { sentAtById: Record<string, string> }>(undefined, "?history=1"),
  save: (workspace: Workspace, revision: string) => request<WorkspaceSnapshot>({ action: "save", workspace, revision }),
  pdf: async (id: string, number: string) => {
    const url = "/invoices/data?pdf=" + encodeURIComponent(id);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to download the invoice PDF.");
    const file = new File([await response.blob()], number + ".pdf", { type: "application/pdf" });
    return { url, file };
  },
  email: (id: string, invoice: string) =>
    request<{ alreadySent: boolean; sentAt: string }>({ action: "email", id, invoice }),
};

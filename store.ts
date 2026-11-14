// Browser-only workspace storage for the "My plan" tools, kept per signed-in account.
import type { AppState, SiteAudit, SiteInfo } from "./types";

let currentUserId: string | null = null;
export function setWorkspaceUser(id: string) { currentUserId = id; }

export type Workspace = Pick<AppState, "websiteUrl" | "siteAudit" | "tasksDone" | "reviewLink" | "siteInfo" | "siteHistory" | "reviewsText"> & {
  profile: AppState["profile"];
};
export const EMPTY_WORKSPACE: Workspace = { websiteUrl: null, siteAudit: null, tasksDone: [], reviewLink: null, siteInfo: null, siteHistory: [], reviewsText: "", profile: null };

const key = (id: string) => `visibly.workspace.${id}`;
export function loadWorkspace(id: string): Workspace {
  try { return { ...EMPTY_WORKSPACE, ...JSON.parse(localStorage.getItem(key(id)) ?? "{}") }; } catch { return { ...EMPTY_WORKSPACE }; }
}
function patchWorkspace(p: Partial<Workspace>) {
  if (!currentUserId) throw new Error("not signed in");
  localStorage.setItem(key(currentUserId), JSON.stringify({ ...loadWorkspace(currentUserId), ...p }));
}

export async function saveProfile(profile: NonNullable<Workspace["profile"]>) { patchWorkspace({ profile }); }
export async function saveSiteInfo(siteInfo: SiteInfo) { patchWorkspace({ siteInfo }); }
export async function saveReviews(reviewsText: string) { patchWorkspace({ reviewsText }); }
export async function saveTasksDone(tasksDone: string[]) { patchWorkspace({ tasksDone }); }
export async function saveReviewLink(reviewLink: string | null) { patchWorkspace({ reviewLink }); }
export async function recordAudit(websiteUrl: string, siteAudit: SiteAudit): Promise<AppState["siteHistory"]> {
  const history = [...loadWorkspace(currentUserId!).siteHistory, { at: siteAudit.fetchedAt, score: siteAudit.score }].slice(-30);
  patchWorkspace({ websiteUrl, siteAudit, siteHistory: history });
  return history;
}
export async function authHeaders(): Promise<Record<string, string>> { return {}; }

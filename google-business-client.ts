export function waitForGoogleBusiness(popup: Window) {
  return new Promise<{ code: string; state: string }>((resolve, reject) => {
    let poll: number | undefined;
    let timer: number | undefined;
    const cleanup = () => { window.removeEventListener("message", listener); window.clearInterval(poll); window.clearTimeout(timer); };
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== popup || event.data?.type !== "visibly-google-business") return;
      cleanup();
      if (event.data.ok && typeof event.data.code === "string" && typeof event.data.state === "string") resolve({ code: event.data.code, state: event.data.state });
      else reject(new Error("Google authorization was cancelled. Try again when ready."));
    };
    window.addEventListener("message", listener);
    poll = window.setInterval(() => { if (popup.closed) { cleanup(); reject(new Error("Google authorization window closed.")); } }, 750);
    timer = window.setTimeout(() => { cleanup(); popup.close(); reject(new Error("Google authorization expired. Please try again.")); }, 600000);
  });
}
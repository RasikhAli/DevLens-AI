export interface LinkedInSourceState {
  url: string;
  status: "URL_SUBMITTED" | "ACCESS_UNAVAILABLE" | "USER_PROVIDED" | "AUTHORIZED_AVAILABLE";
  message: string;
  suggestedAction: "UPLOAD_CV_EXPORT" | "MANUAL_ENTRY" | "CONNECT_OAUTH";
}

export class LinkedInHandler {
  public static handleProfileUrl(url: string): LinkedInSourceState {
    const trimmed = url.trim();
    const isLinkedIn = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(trimmed);

    if (!isLinkedIn) {
      return {
        url: trimmed,
        status: "ACCESS_UNAVAILABLE",
        message: "The provided URL is not a valid LinkedIn public profile URL.",
        suggestedAction: "MANUAL_ENTRY",
      };
    }

    // DevLens AI policy: Respect LinkedIn Terms of Service and anti-scraping controls.
    // Rather than brittle, unauthorized scraping, transparently explain that automated scraping is unavailable
    // and guide user to upload a LinkedIn PDF export or provide manual details.
    return {
      url: trimmed,
      status: "ACCESS_UNAVAILABLE",
      message:
        "Direct automated scraping of LinkedIn profiles is prohibited by LinkedIn terms of service and access restrictions. " +
        "To include your LinkedIn data with full evidence verification, please export your profile as a PDF from LinkedIn ('More' -> 'Save to PDF') and upload it, or manually add your experience details.",
      suggestedAction: "UPLOAD_CV_EXPORT",
    };
  }
}

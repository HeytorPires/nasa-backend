import type { ApodResponse } from "../models/apod-response.interface";
import type { WordPressApodPayload } from "../models/wordpress-apod.interface";

export function mapWordPressApod(payload: WordPressApodPayload): ApodResponse {
    return {
        date: payload.date,
        title: payload.title,
        explanation: stripHtml(payload.explanation),
        media_type: payload.media_type,
        url: payload.hdurl ?? payload.url,
        hdurl: payload.hdurl,
        permalink: payload.permalink,
        copyright: payload.copyright ?? payload.credit,
        alt: payload.alt,
    };
}

function stripHtml(value: string): string {
    if (!value) {
        return "";
    }

    return value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

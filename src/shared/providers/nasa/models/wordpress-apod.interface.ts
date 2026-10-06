export interface WordPressApodPayload {
    date: string;
    post_id: number;
    title: string;
    permalink: string;
    media_type: string;
    explanation: string;
    credit?: string;
    copyright?: string;
    alt?: string;
    url: string;
    hdurl?: string;
    basic_html?: string;
    basic_html_url?: string;
}

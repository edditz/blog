import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
    title: "My Blog",
    description: "Sharing tech and life",
    siteUrl: "https://yourblog.com",
    author: {
        name: "Eddie",
        bio: "A personal blog about tech and life.",
    },
    nav: [
        { label: "Writing", href: "/" },
        { label: "Tags", href: "/tags" },
        { label: "About", href: "/about" },
    ],
    socials: {
        github: "",
        twitter: "",
        linkedin: "",
    },
    postsPerPage: 5,
    analytics: {
        umami: {
            websiteId: "",
            src: "",
        },
    },
    rss: {
        title: "My Blog",
        description: "Sharing tech and life",
    },
};

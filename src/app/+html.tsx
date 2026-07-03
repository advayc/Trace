import type { PropsWithChildren } from "react";

import { ScrollViewStyleReset } from "expo-router/html";

const META_TITLE = "Trace - Walk to reveal your map";
const META_DESCRIPTION =
  "Trace is a fog-of-war walking app. Explore your city, reveal H3 territory, and compete with friends.";
const META_IMAGE = "/assets/images/trace-icon.png";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{META_TITLE}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta name="theme-color" content="#0C0E12" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={META_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:image" content={META_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={META_TITLE} />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:image" content={META_IMAGE} />
      </head>
      <body>
        {children}
        <ScrollViewStyleReset />
      </body>
    </html>
  );
}

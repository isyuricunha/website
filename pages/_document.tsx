import { ColorModeScript } from '@chakra-ui/react';

// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

import Script from 'next/script';

export default class MyDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="shortcut icon"
            href="./static/images/toMe/yuricunha-logo.png"
          />
          <link rel="canonical" href="https://yuricunha.com/" />
          <link
            href="https://fonts.googleapis.com/css2?family=Ubuntu+Mono&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter&display=optional"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
            rel="stylesheet"
          />

          <script
            defer
            src="https://umami.yuricunha.com/script.js"
            data-website-id="a458a3e8-e59e-4872-8b2b-fea74fc1755a"
          ></script>
        </Head>
        <body id={'de_body'}>
          <ColorModeScript />
          <Main />

          <NextScript />
        </body>
      </Html>
    );
  }
}

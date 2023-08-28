import Document, { Html, Head, Main, NextScript } from 'next/document';

import { Analytics } from '@vercel/analytics/react';
import { ColorModeScript } from '@chakra-ui/react';

export default class MyDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="shortcut icon"
            href="https://www.yuricunha.com/static/images/yuricunha-logo.png"
          />
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
        </Head>
        <body id={'de_body'}>
          <Head />
          <ColorModeScript />
          <Main />
          <Analytics />
          <NextScript />
        </body>
      </Html>
    );
  }
}

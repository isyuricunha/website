import React, { useState, useEffect } from 'react';
import '../src/styles/global.css';
import { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from 'react-query';
import Router from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { MDXProvider } from '@mdx-js/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/components/i18n';
import Script from 'next/script';

import InstallPwaButton from '@/components/InstallWPA/InstallPwaButton';

import Head from 'next/head';

import theme from '../src/theme';
import MDXComponents from '@/components/MDXComponents';
import AppLayout from '@/components/AppLayout';
import Loader from '@/components/Loader';

const queryClient = new QueryClient();

export default function MyApp({
  Component,
  pageProps,
}: AppProps): React.ReactElement {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'en-US';

    const start = () => setLoading(true);
    const end = () => setLoading(false);

    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', end);
    Router.events.on('routeChangeError', end);

    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', end);
      Router.events.off('routeChangeError', end);
    };
  }, []);

  const pageTitle = 'Yuri Cunha'; // Set the title accordingly

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="./static/images/toMe/favicon-32x32.png"
        />

        <Script
          defer
          src="https://umami.yuricunha.com/script.js"
          data-website-id="ae078a6c-02fb-45c2-96d3-3274da991093"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="./static/images/toMe/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="./static/images/toMe/apple-touch-icon.png"
        />
        <link rel="manifest" href="./static/images/toMe/site.webmanifest" />
        <link
          rel="mask-icon"
          href="./static/images/toMe/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <DefaultSeo
        title={pageTitle}
        defaultTitle={pageTitle}
        titleTemplate="%s"
        description="Not just a DBA, but a data craftsman building digital legacies."
        openGraph={{
          url: 'https://yuricunha.com/',
          title: pageTitle,
          type: 'website',
          site_name: pageTitle,
          images: [
            {
              url: 'https://www.yuricunha.com/static/images/toMe/to-me-hd.png',
              alt: 'Yuri Cunha Logo Picture',
            },
          ],
        }}
        twitter={{
          handle: '@isyuriunha',
          site: 'https://twitter.com/isyuricunha',
          cardType: 'summary_large_image',
        }}
      />

      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <MDXProvider components={MDXComponents}>
            {loading ? (
              <Loader />
            ) : (
              <AppLayout>
                <>
                  <I18nextProvider i18n={i18n}>
                    <Component {...pageProps} />
                  </I18nextProvider>
                </>
              </AppLayout>
            )}
          </MDXProvider>
        </QueryClientProvider>
      </ChakraProvider>

      <InstallPwaButton />
    </>
  );
}

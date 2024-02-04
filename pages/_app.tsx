import React, { useState, useEffect } from 'react';
import '../src/styles/global.css';
import { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from 'react-query';
import Router from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { MDXProvider } from '@mdx-js/react';
import { Analytics } from '@vercel/analytics/react';
import PlausibleProvider from 'next-plausible';
import InstallPwaButton from '@/components/InstallWPA/InstallPwaButton';

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
              url: './static/images/toMe/me.jpg',
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
        <PlausibleProvider
          domain="yuricunha.com/"
          selfHosted
          trackOutboundLinks
          enabled={process.env.NODE_ENV === 'production'}
          customDomain={'https://yuricunha.com'}
        >
          <QueryClientProvider client={queryClient}>
            <MDXProvider components={MDXComponents}>
              {loading ? (
                <Loader />
              ) : (
                <AppLayout>
                  <>
                    <Component {...pageProps} />
                  </>
                </AppLayout>
              )}
            </MDXProvider>
          </QueryClientProvider>
        </PlausibleProvider>
      </ChakraProvider>
      <Analytics />
      <InstallPwaButton />
    </>
  );
}

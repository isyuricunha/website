import React from 'react';
import { Flex, SimpleGrid, Text } from '@chakra-ui/react';
import LineHeading from '@/components/LineHeading';
import LinkCard from '@/components/LinkCard';
import { NextSeo } from 'next-seo';
import links, { LinkType } from '@/data/links';
import Head from 'next/head';
import { t } from 'i18next';

function Links(): React.ReactElement {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://yuricunha.com/links" />
        <Head>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="./static/images/toMe/favicon-32x32.png"
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
          <script
            defer
            src="https://umami.yuricunha.com/script.js"
            data-website-id="a458a3e8-e59e-4872-8b2b-fea74fc1755a"
          ></script>
          <meta name="theme-color" content="#ffffff" />
        </Head>
      </Head>
      <NextSeo
        title={t('titleProjects') + ' / Yuri Cunha'}
        description="Good links (not than me)."
        canonical="https://yuricunha.com/links"
      />
      <Flex
        direction="column"
        alignItems="center"
        width="full"
        minH="100vh"
        mx="auto"
        maxW="6xl"
        py="28"
      >
        <LineHeading
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
          textAlign="center"
        >
          {t('links')}
        </LineHeading>
        <Text mt={3}>{t('linksMyFav')}</Text>
        <SimpleGrid
          width="100%"
          pt={10}
          columns={{ base: 1, sm: 2, md: 3 }}
          spacingX={10}
          spacingY={8}
        >
          {links
            .sort(
              (a: LinkType, b: LinkType) => a.date.getTime() - b.date.getTime()
            )
            .reverse()
            .map((link: LinkType, i: number) => (
              <LinkCard key={i.toString()} {...link} />
            ))}
        </SimpleGrid>
      </Flex>
    </>
  );
}

export default Links;

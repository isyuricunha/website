import React from 'react';
import {
  Heading,
  Avatar,
  chakra,
  Box,
  Flex,
  Link as ChakraLink,
  Text,
  useColorModeValue,
  HStack,
  Tag,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import ViewCounter from '../ViewCounter';
// import Link from 'next/link';
// import { EditIcon } from '@chakra-ui/icons';
import { frontMatterType } from '@/utils/mdx';
import BlogBadge from '../BlogBadge';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { Global, css } from '@emotion/react';
import Head from 'next/head';

import {
  FaWhatsapp, // Icon WhatsApp
  FaXTwitter, // Icon Twitter
  FaFacebook, // Icon Facebook
  FaLinkedinIn, // Icon LinkedIn
  FaReddit, // Icon Reddit
} from 'react-icons/fa6';

import { GiBearFace } from 'react-icons/gi';

import { BsSubstack, BsSpotify, BsYoutube } from 'react-icons/bs';

import { SiGoogletranslate } from 'react-icons/si';

import { Aside } from '@/components/MDXComponents/Aside'; // Importe o componente Aside

interface BlogLayoutProps {
  children: React.ReactNode;
  frontMatter: frontMatterType;
}

const BlogLayout = ({
  children,
  frontMatter,
}: BlogLayoutProps): JSX.Element => {
  const router = useRouter();

  const translatePage = (languageCode) => {
    const currentURL = window.location.href;
    const translatedURL = `https://translate.google.com/translate?hl=${languageCode}&sl=auto&tl=${languageCode}&u=${encodeURIComponent(
      currentURL
    )}`;
    window.open(translatedURL, '_blank');
  };

  const pageTitle = router.asPath.split('/blog/')[1];

  return (
    <>
      <Global
        styles={css`
          * {
            scroll-padding-top: 80px;
          }
        `}
      />

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
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <NextSeo
        title={`${frontMatter.title} / Yuri Cunha`}
        description={frontMatter.summary}
        canonical={`https://yuricunha.com${router.asPath}`}
        twitter={{
          cardType: 'summary_large_image',
          site: '@isyuricunha',
        }}
        openGraph={{
          title: `${frontMatter.title} / Yuri Cunha`,
          site_name: 'Yuri Cunha',
          description: frontMatter.summary,
          url: `https://yuricunha.com${router.asPath}/`,
          type: 'article',
          article: {
            publishedTime: new Date(frontMatter.publishedAt).toISOString(),
          },
          images: [
            {
              url: `https://yuricunha.com${frontMatter.image}`,
            },
          ],
        }}
      />
      <chakra.article
        id="blogArticle"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        pt="20"
        width="full"
        minH="100vh"
        mx="auto"
        maxWidth="2xl"
      >
        {frontMatter.tags && (
          <Flex
            width="full"
            px={3}
            mb={4}
            justifyContent="flex-start"
            flexWrap="wrap"
            sx={{ rowGap: '10px', columnGap: '10px' }}
          >
            {frontMatter.tags.map((tag, i) => (
              <BlogBadge tag={tag} key={i.toString()} />
            ))}
          </Flex>
        )}

        <Heading
          fontSize={{ base: '3xl', md: '6xl' }}
          textAlign={{ base: 'center', md: 'left' }}
          px={2}
        >
          {frontMatter.title}
        </Heading>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ base: 'center', md: 'flex-start' }}
          maxW="2xl"
          mx="auto"
          mb={12}
          mt={5}
          width="full"
        >
          <Flex alignItems="center" my={{ base: 2, md: 0 }}>
            <Tag size="lg" colorScheme="brand" borderRadius="full">
              <Avatar
                name={frontMatter.by.name}
                size="xs"
                ml={-2}
                mr={2}
                src={frontMatter.by.avatar}
              />
              {frontMatter.by.name}
            </Tag>

            <Text color={useColorModeValue('gray.700', 'gray.300')} ml={1}>
              {' • '}
              {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
            </Text>
          </Flex>
          <Text color={useColorModeValue('gray.700', 'gray.300')}>
            {frontMatter.wordCount.toLocaleString() + ' words'}
            {' • '}
            {frontMatter.readingTime?.text}
            {' • '}
            <ViewCounter slug={frontMatter.slug} />
          </Text>
        </Flex>
        <Box>
          <HStack justifyContent="flex-start" mt={2}>
            <SiGoogletranslate // Adicione o ícone do Google Translate aqui
              size={24}
              style={{
                color: useColorModeValue('gray.900', 'white'), // Defina a cor do ícone
                cursor: 'pointer', // Adicione um cursor
              }}
              onClick={() => translatePage('pt')}
            />
            <ChakraLink
              color={useColorModeValue('gray.900', 'white')}
              style={{ cursor: 'pointer' }}
              onClick={() => translatePage('pt')}
            >
              / Google Translate
            </ChakraLink>
          </HStack>
        </Box>
        <Box
          mb={16}
          px={2}
          maxWidth="4xl"
          width="full"
          className="blog-content"
        >
          {children}
          <br />
          {/* <HStack justifyContent="flex-start" mr="auto" mt={2}>
            <EditIcon />
            <Link
              href={`https://github.com/isyuricunha/website/tree/main/data/blog/${frontMatter.slug}.mdx`}
              passHref
            >
              <ChakraLink
                color={useColorModeValue('gray.900', 'white')}
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit on GitHub
              </ChakraLink>
            </Link>
          </HStack> */}
        </Box>

        <Aside
          type={'positive'}
          title={'Share this article with your friends:'}
        >
          <HStack justifyContent="center" mr="auto" mt={1}>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Check out the article: ${frontMatter.title} - https://yuricunha.com${router.asPath}?utm_source=yuricunha.com`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
            >
              <FaWhatsapp
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Check out the article: ${frontMatter.title} - https://yuricunha.com${router.asPath}?utm_source=yuricunha.com`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter/X"
            >
              <FaXTwitter
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://yuricunha.com${
                router.asPath
              }?utm_source=yuricunha.com&quote=${encodeURIComponent(
                `Check out the article: ${frontMatter.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <FaFacebook
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=https://yuricunha.com${
                router.asPath
              }?utm_source=yuricunha.com&title=${encodeURIComponent(
                `Check out the article: ${frontMatter.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <FaLinkedinIn
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://www.reddit.com/submit?url=https://yuricunha.com${
                router.asPath
              }?utm_source=yuricunha.com&title=${encodeURIComponent(
                `Check out the article: ${frontMatter.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Reddit"
            >
              <FaReddit
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://isyuricunha.substack.com${router.asPath}?source_url=yuricunha.com`}
              target="_blank"
              rel="noopener noreferrer"
              title="Substack"
            >
              <BsSubstack
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://yuricunha.bearblog.dev/${pageTitle}?source_url=yuricunha.com`}
              target="_blank"
              rel="noopener noreferrer"
              title="BearBlog"
            >
              <GiBearFace
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://open.spotify.com/show/2XRQ2mpUbtT0ZqxFVrl0KK`}
              target="_blank"
              rel="noopener noreferrer"
              title="Spotify Blog Speech"
            >
              <BsSpotify
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
            <a
              href={`https://www.youtube.com/@isyuricunha/videos`}
              target="_blank"
              rel="noopener noreferrer"
              title="Youtube Channel"
            >
              <BsYoutube
                size={24}
                style={{
                  color: 'gray.900',
                }}
              />
            </a>
          </HStack>
        </Aside>

        <a
          href="https://memo.yuricunha.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Memo Yuricunha"
        >
          <br />
          Click here and enjoy my privacy-first social media.
        </a>
        <br />
      </chakra.article>
    </>
  );
};

export default BlogLayout;

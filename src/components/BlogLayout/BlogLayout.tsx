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

import {
  FaWhatsapp, // Icon WhatsApp
  FaTwitter, // Icon Twitter
  FaFacebook, // Icon Facebook
  FaLinkedin, // Icon LinkedIn
  FaReddit, // Icon Reddit
} from 'react-icons/fa';



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

  return (
    <>
      <Global
        styles={css`
          * {
            scroll-padding-top: 80px;
          }
        `}
      />
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
        <Box
          mb={16}
          px={2}
          maxWidth="4xl"
          width="full"
          className="blog-content"
        >
          {children}
          <Text
            mb={2}
            fontSize="lg"
            color={useColorModeValue('gray.700', 'gray.300')}
          >
            <br />
            Share this article with your friends:
          </Text>
          <HStack justifyContent="flex-start" mr="auto" mt={1}>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Check out the article: ${frontMatter.title} - https://yuricunha.com${router.asPath}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp
                size={24}
                style={{
                  color: 'white',
                }}
              />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Check out the article: ${frontMatter.title} - https://yuricunha.com${router.asPath}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter
                size={24}
                style={{
                  color: 'white',
                }}
              />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://yuricunha.com${
                router.asPath
              }&quote=${encodeURIComponent(
                `Check out the article: ${frontMatter.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook
                size={24}
                style={{
                  color: 'white',
                }}
              />
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=https://yuricunha.com${
                router.asPath
              }&title=${encodeURIComponent(
                `Check out the article: ${frontMatter.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin
                size={24}
                style={{
                  color: 'white',
                }}
              />
            </a>
            <a
              href={`https://www.reddit.com/submit?url=https://yuricunha.com${
                router.asPath
              }&title=${encodeURIComponent(
                `Check out the article: ${frontMatter.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaReddit
                size={24}
                style={{
                  color: 'white',
                }}
              />
            </a>
          </HStack>
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
          <HStack justifyContent="flex-start" mr="auto" mt={2}>
            <ChakraLink
              color={useColorModeValue('gray.900', 'white')}
              onClick={() => translatePage('pt')}
              style={{ cursor: 'pointer' }}
            >
              Auto Translate - Goolge Translate.
              <br />
              Traduzir automaticamente - Google Tradutor.
            </ChakraLink>
          </HStack>{' '}
          <HStack justifyContent="flex-start" mr="auto" mt={2}>
          <a
            href={`https://dashboard.mailerlite.com/forms/581732/107807976844166224/share`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe to my newsletter
          </a>
          </HStack>{' '}
        </Box>
    </chakra.article>
    </>
  );
};

export default BlogLayout;

import Head from 'next/head';
import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';

import BlogPost from '@/components/BlogPost';
import LineHeading from '@/components/LineHeading';
import { getAllFilesFrontMatter } from '@/utils/mdx';

import { t } from 'i18next';

import generateRSS from '@/utils/generateRssFeed';

import Script from 'next/script';

function Blog({ posts }: { posts: any }): React.ReactElement {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('recent');
  posts[0].featured =
    Date.now() - new Date(posts[0].publishedAt).getTime() <
    1000 * 60 * 60 * 24 * 14;

  const filteredBlogPosts = posts
    .filter(
      ({ title, published }: any) =>
        title.toLowerCase().includes(filter) &&
        (published || process.env.NODE_ENV === 'development')
    )
    .sort((a: any, b: any) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();

      if (sort === 'recent') {
        return dateB - dateA;
      } else if (sort === 'old') {
        return dateA - dateB;
      } else {
        return 0;
      }
    });

  if (sort === 'old') {
    filteredBlogPosts.reverse();
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://yuricunha.com/blog" />
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

          <script
            defer
            src="https://umami.yuricunha.com/script.js"
            data-website-id="a458a3e8-e59e-4872-8b2b-fea74fc1755a"
          ></script>
        </Head>
      </Head>
      <NextSeo
        title="Blog / Yuri Cunha"
        description="I'm the DBA that'll make you laugh, cry, and learn about technology."
        canonical="https://yuricunha.com/blog"
      />
      <Flex
        direction="column"
        alignItems="center"
        width="full"
        minH="100vh"
        mx="auto"
        maxW="5xl"
      >
        <LineHeading
          mt="28"
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
          textAlign="center"
        >
          {t('blogPosts')}
        </LineHeading>
        <Text mt={3} px={5}>
          {t('collectionBlogPost')}
        </Text>

        <Box mt="16" width="full">
          <Flex
            width="full"
            direction={{ base: 'column', md: 'row' }}
            my={7}
            px={{ base: 5, sm: 2 }}
            justifyContent="space-between"
          >
            <InputGroup
              maxWidth={{ base: 'full', md: '200px' }}
              mb={{ base: 5, md: 0 }}
            >
              <InputLeftElement pointerEvents="none">
                <AiOutlineSearch color="gray.300" />
              </InputLeftElement>
              <Input
                variant="filled"
                type="text"
                placeholder={t('blogSearch')}
                _placeholder={{
                  color: useColorModeValue('gray.800', 'whiteAlpha.800'),
                }}
                onChange={(e) => setFilter(e.target.value.toLowerCase())}
              />
            </InputGroup>

            <Menu>
              <MenuButton as={Button} rightIcon={<BiChevronDown />}>
                {t('blogSortBy')}
              </MenuButton>
              <MenuList zIndex={998}>
                <MenuItem
                  zIndex={999}
                  isDisabled={sort === 'recent'}
                  onClick={() => setSort('recent')}
                >
                  {t('blogSortRecent')}
                </MenuItem>
                <MenuItem
                  zIndex={999}
                  isDisabled={sort === 'old'}
                  onClick={() => setSort('old')}
                >
                  {t('blogSortOld')}
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          {filteredBlogPosts.length === 0 && (
            <Text fontSize="2xl" textAlign="center">
              {t('blogPosts')}
            </Text>
          )}
          {filteredBlogPosts.map((frontMatter: any) => (
            <BlogPost key={frontMatter.title} {...frontMatter}>
              {frontMatter.content}
            </BlogPost>
          ))}
        </Box>
      </Flex>
    </>
  );
}

export async function getStaticProps(): Promise<{ props: { posts: any } }> {
  await generateRSS(); // calling to generate the feed

  const posts = await getAllFilesFrontMatter();
  return { props: { posts } };
}

export default Blog;

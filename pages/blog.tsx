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
import { Analytics } from '@vercel/analytics/react';
import BlogPost from '@/components/BlogPost';
import LineHeading from '@/components/LineHeading';
import { getAllFilesFrontMatter } from '@/utils/mdx';

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
      if (sort === 'recent') {
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      } else if (sort === 'old') {
        return (
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );
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
        <link rel="canonical" href="https://www.yuricunha.com/blog" />
      </Head>
      <NextSeo title="Blog | Yuri Cunha | isyuricunha" />
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
          Blog Posts
        </LineHeading>
        <Text mt={3} px={5}>
          {`Here ${
            posts.length === 1 ? 'is' : 'are'
          } a collection of my blog post${posts.length > 1 ? 's' : ''} :).`}
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
                placeholder="Search"
                _placeholder={{
                  color: useColorModeValue('gray.800', 'whiteAlpha.800'),
                }}
                onChange={(e) => setFilter(e.target.value.toLowerCase())}
              />
            </InputGroup>

            <Menu>
              <MenuButton as={Button} rightIcon={<BiChevronDown />}>
                Sort by...
              </MenuButton>
              <MenuList zIndex={998}>
                <MenuItem
                  zIndex={999}
                  isDisabled={sort === 'recent'}
                  onClick={() => setSort('recent')}
                >
                  Recent
                </MenuItem>
                <MenuItem
                  zIndex={999}
                  isDisabled={sort === 'old'}
                  onClick={() => setSort('old')}
                >
                  Oldest
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          {filteredBlogPosts.length === 0 && (
            <Text fontSize="2xl" textAlign="center">
              No Results :(
            </Text>
          )}
          {filteredBlogPosts.map((frontMatter: any) => (
            <BlogPost key={frontMatter.title} {...frontMatter} />
          ))}
        </Box>
      </Flex>
      <Analytics />
    </>
  );
}

export async function getStaticProps(): Promise<{ props: { posts: any } }> {
  const posts = await getAllFilesFrontMatter();
  return { props: { posts } };
}
export default Blog;

import {
  Box,
  Flex,
  Heading,
  Image,
  chakra,
  useColorModeValue,
  Skeleton,
  Text,
  Center,
} from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import React, { useState } from 'react';

import { FaGithub } from 'react-icons/fa';
import LineHeading from '@/components/LineHeading';
import RepoCard from '@/components/RepoCard';
import PinnedProjects from '@/components/PinnedProjects';
import { pinnedRepos, pinnedRepoType } from '@/data/pinnedRepos';
import { repoType } from '@/pages/api/github';
import Head from 'next/head';
import { t } from 'i18next';

const About: React.FC = () => {
  const [imageLoad, setImageLoad] = useState([false, false, false, false]);

  const handleImageLoad = (index: number) => {
    setImageLoad((prev) => {
      const newLoad = [...prev];
      newLoad[index] = true;
      return newLoad;
    });
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://yuricunha.com/about" />
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
      </Head>
      <NextSeo
        title={t('titleAboutMe') + ' / Yuri Cunha'}
        description="I'm not just a DBA, I'm the data whisperer, the performance guru, the uptime champion."
        canonical="https://yuricunha.com/projects"
      />
      <Box
        minH="100vh"
        py={{ base: '20', md: '28' }}
        px={{ base: '6', md: '12' }}
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="center"
          maxW="3xl"
          mx="auto"
        >
          <Flex
            wrap="wrap"
            justify="center"
            align="center"
            mb={{ base: 8, md: 0 }}
          >
            {['me', 'running'].map((img, index) => (
              <Skeleton
                key={img}
                isLoaded={imageLoad[index]}
                boxSize={{
                  base: '120px',
                  sm: '150px',
                  md: '200px',
                  lg: '250px',
                }}
                borderRadius="lg"
                m={4}
              >
                <Image
                  src={`/static/images/about/${img}.jpg`}
                  alt={`Image ${index + 1}`}
                  boxSize={{
                    base: '120px',
                    sm: '150px',
                    md: '200px',
                    lg: '250px',
                  }}
                  borderRadius="lg"
                  objectFit="cover"
                  onLoad={() => handleImageLoad(index)}
                />
              </Skeleton>
            ))}
            {['server', 'travelling-qebec'].map((img, index) => (
              <Skeleton
                key={img}
                isLoaded={imageLoad[index + 2]}
                boxSize={{
                  base: '120px',
                  sm: '150px',
                  md: '200px',
                  lg: '250px',
                }}
                borderRadius="lg"
                m={4}
              >
                <Image
                  src={`/static/images/about/${img}.jpg`}
                  alt={`Image ${index + 3}`}
                  boxSize={{
                    base: '120px',
                    sm: '150px',
                    md: '200px',
                    lg: '250px',
                  }}
                  borderRadius="lg"
                  objectFit="cover"
                  onLoad={() => handleImageLoad(index + 2)}
                />
              </Skeleton>
            ))}
          </Flex>
          <Flex
            direction="column"
            align="center"
            maxW="3xl"
            mb={{ base: 8, md: 0 }}
          >
            <Heading
              fontSize={{ base: 'md', md: 'lg' }}
              color={useColorModeValue('gray.700', 'gray.300')}
              mb={4}
            >
              {t('titleAboutMe')}
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color={useColorModeValue('gray.700', 'gray.300')}
            >
              {t('aboutOne')}
              <br />
              <br />
              {t('aboutTwo')}
              <br />
              <br />
              {t('aboutThree')}
              <br />
              <br />
              {t('aboutFour')}
              <br />
              <br />
              {t('aboutFive')}
              <br />
              <br />
            </Text>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default About;

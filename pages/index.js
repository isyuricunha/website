import React from "react";
import Head from "next/head";
import {
  Button,
  Box,
  VStack,
  Text,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import PageTransition from "../components/page-transitions";
import Section from "@/components/section";
import { TwitterLogo } from "phosphor-react";
import ProjectCard from "@/components/project-card";
import { getTable } from "@/lib/airtable";
import Link from "@/components/link";
import SubscribeCard from "@/components/subscribe-card";

const Home = ({ projects }) => (
  <Box>
    <PageTransition>
      <VStack spacing={12}>
        <Section>
          <VStack spacing={4} align="start" fontSize="2xl">
            <Heading size="xl">Ei, eu sou Yuri 👋</Heading>
            <VStack>
              <Text>
                Sou designer, desenvolvedor e empresário. Nascido e criado na
                Alemanha e atualmente morando na Holanda. O foco do meu trabalho
                é a{" "}
                <Link variant="text" href="https://www.facilitator.school">
                  Escola Facilitadora
                </Link>
                . No meu tempo livre, trabalho na{" "}
                <Link variant="text" href="https://markway.io">
                  Markway
                </Link>
                . Também frequento o{" "}
                <Link variant="text" href="https://twitter.com/isyuricunha">
                  Twitter
                </Link>{" "}
                e o{" "}
                <Link
                  variant="text"
                  href="https://www.linkedin.com/in/isyuricunha/"
                >
                  LinkedIn
                </Link>
                , onde aprendo, penso e trabalho em público.
              </Text>
            </VStack>
            {/* <Link href="https://twitter.com/isyuricunha" unstyled>
              <Button
                colorScheme="blue"
                rounded="lg"
                size="lg"
                leftIcon={<TwitterLogo weight="fill" />}
                mt={4}
              >
                Follow me on Twitter
              </Button>
            </Link> */}
          </VStack>
        </Section>
        <Section>
          <SubscribeCard
            title="Assine minha newsletter"
            description="Ferramentas úteis, artigos interessantes e outras descobertas da web. Da minha escrivaninha para a sua."
          />
        </Section>

        <Section>
          <VStack align="start" spacing={8}>
            <Heading size="lg">Projetos</Heading>
            <SimpleGrid columns={1} spacing={4} mt={8} w="100%">
              {projects.map((projects) => (
                <ProjectCard
                  key={projects.id}
                  name={projects.fields.name}
                  description={projects.fields.description}
                  logo={projects.fields.logo}
                  link={projects.fields.link}
                  type={projects.fields.type}
                />
              ))}
            </SimpleGrid>
          </VStack>
        </Section>
      </VStack>
    </PageTransition>
  </Box>
);

export async function getStaticProps() {
  const projects = await getTable("Projects");

  return {
    props: {
      projects,
    },
    revalidate: 600,
  };
}

export default Home;

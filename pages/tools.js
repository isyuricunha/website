import React from "react";
import {
  chakra,
  Icon,
  VStack,
  HStack,
  Text,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  SimpleGrid,
  Box,
  Wrap,
} from "@chakra-ui/react";
import PageTransition from "../components/page-transitions";
import { getTable } from "@/lib/airtable";
import Section from "@/components/section";
import BookCard from "@/components/book-card";

import BookSuggestion from "@/components/book-suggestion";
import {
  BookOpenIcon,
  DesktopComputer,
  HeartIcon,
} from "@heroicons/react/solid";
import sorter from "sort-isostring";
import {
  AndroidLogo,
  AppleLogo,
  WindowsLogo,
  Globe,
  Monitor,
} from "phosphor-react";
import ToolCard from "../components/tool-card";
import { Chrome } from "react-feather";
import Hero from "@/components/hero";

const Tools = ({ tools }) => {
  return (
    <PageTransition>
      <VStack spacing={8}>
        <Hero
          title="Tools"
          subtitle="Uma lista das minhas ferramentas favoritas que uso regularmente e que recomendo experimentar."
        ></Hero>
        <Section>
          <Tabs
            variant="soft-rounded"
            colorScheme="blue"
            align="center"
            w="100%"
          >
            <TabList display="flex" flexWrap="wrap">
              <Tab
                bg={useColorModeValue("neutral.300", "neutralD.300")}
                color={useColorModeValue("neutral.900", "neutralD.900")}
                _selected={{
                  color: useColorModeValue("gray.100", "neutralD.100"),
                  bg: useColorModeValue("gray.900", "gray.100"),
                }}
                mr={2}
                mt={2}
              >
                <HStack spacing={1}>
                  <Icon as={WindowsLogo} weight="fill" />
                  <Text>Windows</Text>
                </HStack>
              </Tab>
              <Tab
                bg={useColorModeValue("neutral.300", "neutralD.300")}
                color={useColorModeValue("neutral.900", "neutralD.900")}
                _selected={{
                  color: "green.800",
                  bg: "green.100",
                }}
                mr={2}
                mt={2}
              >
                <HStack spacing={1}>
                  <Icon as={AndroidLogo} weight="fill" />
                  <Text>Android</Text>
                </HStack>
              </Tab>
              <Tab
                bg={useColorModeValue("neutral.300", "neutralD.300")}
                color={useColorModeValue("neutral.900", "neutralD.900")}
                _selected={{
                  color: "red.800",
                  bg: "red.100",
                }}
                mr={2}
                mt={2}
                s
              >
                <HStack spacing={1}>
                  <Icon as={Chrome} weight="fill" />
                  <Text>Chrome</Text>
                </HStack>
              </Tab>
              <Tab
                bg={useColorModeValue("neutral.300", "neutralD.300")}
                color={useColorModeValue("neutral.900", "neutralD.900")}
                _selected={{
                  color: "blue.800",
                  bg: "blue.100",
                }}
                mr={2}
                mt={2}
              >
                <HStack spacing={1}>
                  <Icon as={DesktopComputer} />
                  <Text>Web</Text>
                </HStack>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <SimpleGrid columns={[1, 2]} spacing={4} mt={8}>
                  {tools
                    .filter((t) => t.fields.Platform === "Mac" || "Windows")
                    .sort((x, y) => sorter(y.fields.ID, x.fields.ID))
                    .map((tool) => (
                      <ToolCard
                        key={tool.id}
                        name={tool.fields.Name}
                        description={tool.fields.Description}
                        image={tool.fields.Image}
                        platform={tool.fields.Platform}
                        isAffiliate={tool.fields.Affiliate}
                        link={tool.fields.Link}
                      />
                    ))}
                </SimpleGrid>
              </TabPanel>
              <TabPanel px={0}>
                <SimpleGrid columns={[1, 2]} spacing={4} mt={8}>
                  {tools
                    .filter((t) => t.fields.Platform === "Android")
                    .sort((x, y) => sorter(y.fields.ID, x.fields.ID))
                    .map((tool) => (
                      <ToolCard
                        key={tool.id}
                        name={tool.fields.Name}
                        description={tool.fields.Description}
                        image={tool.fields.Image}
                        platform={tool.fields.Platform}
                        isAffiliate={tool.fields.Affiliate}
                        link={tool.fields.Link}
                      />
                    ))}
                </SimpleGrid>
              </TabPanel>
              <TabPanel px={0}>
                <SimpleGrid columns={[1, 2]} spacing={4} mt={8}>
                  {tools
                    .filter((t) => t.fields.Platform === "Chrome")
                    .sort((x, y) => sorter(y.fields.ID, x.fields.ID))
                    .map((tool) => (
                      <ToolCard
                        key={tool.id}
                        name={tool.fields.Name}
                        description={tool.fields.Description}
                        image={tool.fields.Image}
                        platform={tool.fields.Platform}
                        isAffiliate={tool.fields.Affiliate}
                        link={tool.fields.Link}
                      />
                    ))}
                </SimpleGrid>
              </TabPanel>
              <TabPanel px={0}>
                <SimpleGrid columns={[1, 2]} spacing={4} mt={8}>
                  {tools
                    .filter((t) => t.fields.Platform === "Web")
                    .sort((x, y) => sorter(y.fields.ID, x.fields.ID))
                    .map((tool) => (
                      <ToolCard
                        key={tool.id}
                        name={tool.fields.Name}
                        description={tool.fields.Description}
                        image={tool.fields.Image}
                        platform={tool.fields.Platform}
                        isAffiliate={tool.fields.Affiliate}
                        link={tool.fields.Link}
                      />
                    ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Section>
      </VStack>
    </PageTransition>
  );
};

export async function getStaticProps() {
  const tools = await getTable("Tools");

  return {
    props: {
      tools,
    },
    revalidate: 600,
  };
}

export default Tools;

import React from "react";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useDisclosure,
  Input,
  Button,
  VStack,
  FormControl,
  Alert,
  AlertIcon,
  FormLabel,
  FormHelperText,
  Textarea,
  Tooltip,
  SimpleGrid,
  useColorModeValue,
  Divider,
  HStack,
} from "@chakra-ui/react";
import {
  GithubLogo,
  LinkedinLogo,
  TwitterLogo,
  YoutubeLogo,
} from "phosphor-react";
import { MailIcon, MenuIcon } from "@heroicons/react/solid";
import { useForm } from "react-hook-form";
import MobileMenuButton from "./mobile-menu-button";
import MobileMenuItem from "./mobile-menu-item";
import ThemeToggle from "./theme-toggle";
import Link from "@/components/link";

const MobileMenuToggle = ({ mobile }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const {
    register,
    handleSubmit,
    watch,
    errors,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm();
  const onSubmit = async (data) => {
    await sendSuggestion(data);
  };

  return (
    <Box>
      <Tooltip label="Newsletter">
        <MobileMenuButton label="Menu" icon={<MenuIcon />} onClick={onOpen} />
      </Tooltip>
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay>
          <DrawerContent
            borderTopRadius="6px"
            bg={useColorModeValue("neutral.50", "neutralD.50")}
          >
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody pb={4}>
              <VStack spacing={4}>
                <VStack w="100%">
                  <MobileMenuItem href="/" title="Home" />
                  <SimpleGrid columns={2} spacing={2} w="100%">
                    <MobileMenuItem href="/about" title="Sobre" />
                    <MobileMenuItem href="/blog" title="Blog" />
                    <MobileMenuItem href="/newsletter" title="Newsletter" />
                    <MobileMenuItem href="/bookmarks" title="Bookmarks" />
                    <MobileMenuItem href="/books" title="Livros" />
                    <MobileMenuItem href="/tools" title="Ferramentas" />
                  </SimpleGrid>
                </VStack>

                <Divider />
                <HStack justify="space-between" w="100%">
                  <HStack spacing={2}>
                    <Link
                      href="https://twitter.com/isyuricunha/"
                      isexternal
                      unstyled
                    >
                      <IconButton
                        size="sm"
                        icon={<TwitterLogo weight="fill" />}
                        color={useColorModeValue(
                          "neutral.800",
                          "neutralD.1000"
                        )}
                      ></IconButton>
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/isyuricunha/"
                      isexternal
                      unstyled
                    >
                      <IconButton
                        size="sm"
                        icon={<LinkedinLogo weight="fill" />}
                        color={useColorModeValue(
                          "neutral.800",
                          "neutralD.1000"
                        )}
                      ></IconButton>
                    </Link>
                    <Link
                      href="https://github.com/isyuricunha"
                      isexternal
                      unstyled
                    >
                      <IconButton
                        size="sm"
                        icon={<GithubLogo weight="fill" />}
                        color={useColorModeValue(
                          "neutral.800",
                          "neutralD.1000"
                        )}
                      ></IconButton>
                    </Link>
                    <Link
                      href="https://www.youtube.com/channel/UCHnkvuxhC6ufNxgIQrQnYSQ"
                      unstyled
                      isexternal
                    >
                      <IconButton
                        size="sm"
                        icon={<YoutubeLogo weight="fill" />}
                        color={useColorModeValue(
                          "neutral.800",
                          "neutralD.1000"
                        )}
                      ></IconButton>
                    </Link>
                  </HStack>
                  <ThemeToggle mobile />
                </HStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </Box>
  );
};

export default MobileMenuToggle;

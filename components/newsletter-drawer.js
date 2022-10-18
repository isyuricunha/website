import React, { useState } from "react";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useColorModeValue,
  Input,
  Button,
  VStack,
  FormControl,
  Alert,
  AlertIcon,
  Tooltip,
  Collapse,
  Text,
  FormHelperText,
} from "@chakra-ui/react";
import { RssIcon, MailIcon, MenuIcon } from "@heroicons/react/outline";
import { useForm } from "react-hook-form";
import MobileMenuButton from "./mobile-menu-button";
import SubscribeCard from "@/components/subscribe-card";

const NewsletterDrawer = ({ mobile, placement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <Box>
      {placement === "blog" ? (
        <Button
          leftIcon={<RssIcon size={20} />}
          onClick={onOpen}
          colorScheme="purple"
        >
          Inscrever-se
        </Button>
      ) : (
        <MobileMenuButton
          label="Subscribe"
          icon={<MailIcon />}
          onClick={onOpen}
        />
      )}
      <Drawer
        isOpen={isOpen}
        size="md"
        placement="bottom"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay>
          <DrawerContent
            borderTopRadius="6px"
            bg={useColorModeValue("white", "neutralD.50")}
          >
            <DrawerCloseButton />
            <DrawerHeader>Inscrever-se</DrawerHeader>
            <DrawerBody pb={4}>
              <SubscribeCard card={false} />
              <VStack align="stretch" spacing={4}>
                <Text>
                  Want to stay in loop on new articles and projects? Then drop
                  your email below. Alternatively, you can{" "}
                  <Link href="/rss.xml">subscribe with RSS</Link>.
                </Text>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                  <VStack spacing={4}>
                    <FormControl w="100%">
                      <Input
                        name="email_address"
                        placeholder="you@email.com"
                        type="email"
                        ref={register({ required: true })}
                        isDisabled={isSuccessful}
                        isloading={isSubmitSuccessful}
                        rounded="lg"
                      />
                      <FormHelperText>Send max. once per month</FormHelperText>
                      {errors.author && (
                        <FormErrorMessage>
                          "E-MailIcon is required"
                        </FormErrorMessage>
                      )}
                    </FormControl>
                    <Button
                      mt={4}
                      colorScheme="purple"
                      type="submit"
                      w="100%"
                      isDisabled={isSuccessful}
                      isloading={isSubmitting}
                      leftIcon={<RssIcon size={20} />}
                      rounded="lg"
                    >
                      Inscrever-se
                    </Button>

                    <Collapse in={isSuccessful} animateOpacity>
                      <Alert borderRadius="md" status="success">
                        <AlertIcon />
                        Success! Now check your email to confirm your
                        subscription.
                      </Alert>
                    </Collapse>
                  </VStack>
                </form>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </Box>
  );
};

export default NewsletterDrawer;

import React, { useState } from "react";
import {
  Box,
  HStack,
  Text,
  Button,
  useClipboard,
  useColorModeValue,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import Highlight from "./highlight";
import { CheckIcon, DuplicateIcon } from "@heroicons/react/solid";

const Codeblock = (props) => {
  const showLines = true;

  const { className, children, viewlines, metastring, ln, ...rest } = props;

  const [editorCode] = useState(children);

  const { hasCopied, onCopy } = useClipboard(editorCode);

  const language = className?.replace(/language-/, "");

  const title = metastring?.match(/title="(.*?)"/)[1];

  return (
    <Box
      rounded="md"
      overflow="hidden"
      bg={useColorModeValue("white", "neutralD.100")}
      my={4}
      borderWidth="1px"
      borderColor={useColorModeValue("neutral.400", "neutralD.400")}
    >
      {title ? (
        <HStack
          px={4}
          py={1}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth="1px"
          borderBottomColor={useColorModeValue("neutral.400", "neutralD.400")}
        >
          <Text
            fontSize="sm"
            fontWeight="500"
            color={useColorModeValue("neutral.1000", "neutralD.1000")}
          >
            {title}
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={onCopy}
              variant="ghost"
              color={
                hasCopied
                  ? useColorModeValue("green.600", "green.100")
                  : useColorModeValue("neutral.1000", "neutralD.1000")
              }
              bg={
                hasCopied
                  ? useColorModeValue("green.50", "green.800")
                  : undefined
              }
              leftIcon={
                hasCopied ? (
                  <Icon as={CheckIcon} size={18} />
                ) : (
                  <Icon as={DuplicateIcon} size={18} />
                )
              }
            >
              {hasCopied ? "Copied" : "Copy"}
            </Button>
          </HStack>
        </HStack>
      ) : undefined}
      <Highlight
        codeString={editorCode}
        language={language}
        metastring={metastring}
        showLines={showLines}
        ln={ln}
      />
    </Box>
  );
};

export default Codeblock;

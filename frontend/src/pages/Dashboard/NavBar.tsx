import { Box, Container, Flex, HStack, Spacer, Image} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  UserButton,
} from "@clerk/clerk-react";

export function NavBar() {
    return (
        <Box>
            {/* --- NAVBAR SUPERIOR --- */}
            <Box borderBottom="1px" borderColor="gray.200" py={4}>
                <Container maxW="full"> 
                <Flex alignItems="center">
                    <HStack spacing={2}>
                    <Box
                        as={RouterLink}
                        to="/dashboard"
                        display="inline-block"
                        lineHeight={0}
                    >
                        <Image src="/Logo.png" alt="Logo" h="56px" w="auto" objectFit="contain" />
                    </Box>
                    </HStack>

                    <Spacer />
                    <HStack spacing={6}>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: {
                                    width: "40px",
                                    height: "40px",
                                },
                            },
                        }}
                    />
                    </HStack>
                </Flex>
                </Container>
            </Box>
        </Box>
    )
}
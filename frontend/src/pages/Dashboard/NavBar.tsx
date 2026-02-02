import { Box, Container, Flex, HStack, Spacer, Icon, Image} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";

export function NavBar() {
    return (
        <Box>
            {/* --- NAVBAR SUPERIOR --- */}
            <Box borderBottom="1px" borderColor="gray.200" py={4}>
                <Container maxW="full"> 
                <Flex alignItems="center">
                    <HStack spacing={2}>
                    <Box as={RouterLink} to="/dashboard">
                        <Image src="/Logo.png" alt="Logo" w={"20%"} />
                    </Box>
                    </HStack>

                    <Spacer />
                    <HStack spacing={6}>
                    <Icon as={FiSettings} w={5} h={5} cursor="pointer" />
                    <Icon as={FiLogOut} w={5} h={5} mr={"5"} cursor="pointer" color={"red"} />
                    </HStack>
                </Flex>
                </Container>
            </Box>
        </Box>
    )
}
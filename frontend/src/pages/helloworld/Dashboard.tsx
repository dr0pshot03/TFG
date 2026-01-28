import { 
  Box, Container, Flex, HStack, Icon, Text, Spacer, Heading, Button, VStack 
} from "@chakra-ui/react";
import { FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";

export default function Dashboard() {
  return (
    <Box bg="white" w="100%" minH="100vh"> 
      
      {/* --- 1. NAVBAR SUPERIOR --- */}
      <Box borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="full"> 
          <Flex alignItems="center">
            <HStack spacing={2}>
              <Icon as={FiBarChart2} w={8} h={8} color="teal.500" />
              <Text fontSize="2xl" fontWeight="bold" color="blue.800">
                TimeExam
              </Text>
            </HStack>

            <Spacer />
            <HStack spacing={6}>
              <Icon as={FiSettings} w={5} h={5} cursor="pointer" />
              <Icon as={FiLogOut} w={5} h={5} color="red.400" cursor="pointer" />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* --- 2. CONTENIDO PRINCIPAL --- */}
      <Container maxW="full" py={10}>
        
        {/* Encabezado: Saludo y Botón Principal */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "start", md: "center" }}
          mb={10}
        >
          <Heading as="h1" size="lg" mb={{ base: 4, md: 0 }}>
            Bienvenido Daniel
          </Heading>
          
          <Button 
            colorScheme="blue" 
            borderRadius="full" 
            px={8}
            bg="#0055D4"
            _hover={{ bg: "#0041a3" }}
          >
            Añadir asignatura
          </Button>
        </Flex>

        {/* Sección: Tus Asignaturas */}
        <Box mb={20}>
          <Heading as="h3" size="md" mb={2}>
            Tus Asignaturas
          </Heading>
          <Text color="gray.500">
            Aquí encontrarás todas las asignaturas que hayas añadido
          </Text>
        </Box>

        {/* --- 3. EMPTY STATE (ESTADO VACÍO) --- */}
        <VStack spacing={4} py={10}>
          <Heading size="md" textAlign="center">
            Ups, parece que tu lista de asignaturas está vacía.
          </Heading>
          <Text color="gray.500" fontSize="sm">
            ¡Prueba a añadir una!
          </Text>
          
          <Box pt={4}>
            <Button 
              colorScheme="blue" 
              size="lg" 
              borderRadius="full" 
              px={10}
              bg="#0055D4"
              _hover={{ bg: "#0041a3" }}
            >
              Añadir asignatura
            </Button>
          </Box>
        </VStack>

      </Container>
    </Box>
  );
}
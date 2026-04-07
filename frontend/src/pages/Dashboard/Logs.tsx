import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { 
  Box,
  Text,
  VStack,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Td,
  Link,
  Container,
  Flex,
  Heading
} from "@chakra-ui/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

export default function Logs() {
    const { idExamen } = useParams<{ idExamen: string }>();
    const dispatch = useDispatch<IDispatch>();

    const examen =  useSelector((state: IRootState) => state.examenModel.selectedExamen);
  const asignatura = useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
    const evento = useSelector((state: IRootState) => state.eventoModel.evento);

    useEffect(() => {
      dispatch.examenModel.getExamen(idExamen!);
    }, [dispatch, idExamen]);

    useEffect(() => {
      const sesionId = examen?.sesion?.[0]?.id;
      if (!sesionId) return;
      dispatch.eventoModel.getAllEventos(sesionId);
    }, [dispatch, examen?.sesion]);

    useEffect(() => {
      const idAsignatura = examen?.id_asign;
      if (!idAsignatura) return;
      dispatch.asignaturaModel.getAsignatura(idAsignatura);
    }, [dispatch, examen?.id_asign]);

    const formatHora = (timestamp: string | Date) => {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    const formatFecha = (timestamp: string | Date | undefined) => {
      if (!timestamp) return "";
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };



    return (
      <Box>
        
        <NavBar></NavBar>
        <Link as={RouterLink} to={`/asignatura/${examen?.id_asign}`} color="blue.600">
          <Text fontSize={"md"} mt={"5"} ml={"3"} > &lt;  Dashboard &lt; {asignatura?.nombre} </Text>
        </Link>
        <Container maxW="full" py={10}>
          <Flex 
          justify="center" 
          align={"center"}
          mb={10}
        >
            <VStack align="start" spacing={4}>
              <Heading as="h1" size="lg">
                Logs del examen {formatFecha(examen?.fecha_examen)} - {asignatura?.nombre}
              </Heading>
            </VStack>

          </Flex>

          <VStack>
            <TableContainer w={"100%"}>
              <Table>
                <Thead>
                  <Tr bg="shade.2" w="100%">
                    <Td borderTopLeftRadius="12px" color="shade.1" textAlign="center" w={"10%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Tipo Evento</Td>
                    <Td borderTopRightRadius="12px" color="shade.1" textAlign="center" w={"20%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Hora </Td>
                  </Tr>
                </Thead>
                <Tbody>
                  {evento.map((event, index) => (
                    <Tr key={event.id || index}  bgColor={"#E2E8F0"}>
                      <Td
                        p={2}
                        textAlign="center"
                        borderRight="1px solid #aaaaaa"
                        borderBottom="1px solid #aaaaaa"
                      >
                        <Text fontSize="lg">{event.tipo_evento}</Text>
                      </Td>

                      <Td
                        p={2}
                        textAlign="center"
                        borderRight="1px solid #aaaaaa"
                        borderBottom="1px solid #aaaaaa"
                      >
                        <Text fontSize="lg"> {formatHora(event.timestamp)} </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        </Container>
      </Box>
    );
}
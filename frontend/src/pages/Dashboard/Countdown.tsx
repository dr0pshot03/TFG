import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  VStack,
  CircularProgress, 
  CircularProgressLabel,
  Text,
  Link,
  Modal, 
  ModalBody,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Grid, 
  GridItem
} from "@chakra-ui/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { useUser } from "@clerk/clerk-react";

import { Link as RouterLink } from "react-router-dom";

export default function Countdown() {
  const dispatch = useDispatch<IDispatch>();
  const navigate = useNavigate();
  const { idAsign } = useParams<{ idAsign: string }>();
  const { idExamen } = useParams<{ idExamen: string }>();
  const { idSesion } = useParams<{ idSesion: string }>();
  const { user } = useUser();

  const asignatura = useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
  const examen = useSelector((state: IRootState) => state.examenModel.selectedExamen);
  const partes = useSelector((state: IRootState) => state.parteExamenModel.partesExamenes);
  const sesion = useSelector((state: IRootState) => state.sesionModel.selectedSesion);

  const { isOpen: isOpenTime, onOpen: onOpenTime, onClose: onCloseTime } = useDisclosure();
  const { isOpen: isOpenFinish, onOpen: onOpenFinish, onClose: onCloseFinish } = useDisclosure();
  const { isOpen: isOpen25, onOpen: onOpen25, onClose: onClose25 } = useDisclosure();

  const [timeExtra, setTimeExtra] = useState(0);
  const [hasExtra25, setHasExtra25] = useState(false);
  const [carryExtraSeconds, setCarryExtraSeconds] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [contador, setContador] = useState(0);
  let totalPartes = partes.length - 1;

  const audioFin = useRef<HTMLAudioElement | null>(null);

  const parteActual = partes[contador];
  const INPUT_HORAS = parteActual?.duracion_h ?? 0; 
  const INPUT_MINUTOS = parteActual?.duracion_m ?? 0;

  const getCursoFromFechaExamen = (fecha?: string | Date) => {
    if (!fecha) return "";

    const parsedDate = new Date(fecha);
    if (Number.isNaN(parsedDate.getTime())) return "";

    // Curso académico: de octubre a septiembre
    const month = parsedDate.getMonth() + 1;
    const year = parsedDate.getFullYear();
    const startYear = month >= 10 ? year : year - 1;
    const endYear = startYear + 1;

    return `${String(startYear).slice(-2)}/${String(endYear).slice(-2)}`;
  };

  const año = examen?.fecha_examen
  ? new Date(examen.fecha_examen).getFullYear()
  : "";
  const cursoAcademico = getCursoFromFechaExamen(examen?.fecha_examen);

  // Convertimos todo a segundos para la lógica interna
  const TOTAL_SECONDS_INITIAL = (INPUT_HORAS * 3600) + (INPUT_MINUTOS * 60);
  const EXTRA_25_SECONDS = hasExtra25 ? Math.floor(TOTAL_SECONDS_INITIAL * 0.25) : 0;
  const EXTRA_TOTAL_SECONDS = EXTRA_25_SECONDS + carryExtraSeconds;
  const TOTAL_SECONDS_WITH_25 = TOTAL_SECONDS_INITIAL + EXTRA_TOTAL_SECONDS;

  useEffect(() => {
    onOpen25();
  }, [onOpen25]);

  useEffect(() => {
    if (idAsign) dispatch.asignaturaModel.getAsignatura(idAsign);
    if (idExamen) {
        dispatch.examenModel.getExamen(idExamen);
        dispatch.parteExamenModel.getPartesExamen(idExamen);
    }
    if(idSesion) {
      dispatch.sesionModel.getSesionbyId(idSesion);
    }
  }, [dispatch, idExamen, idAsign, idSesion]);

  useEffect(() => {
    audioFin.current = new Audio(
      new URL("../../sounds/end.mp3", import.meta.url).toString()
    );
  }, []);

  // --- FUNCIÓN HELPER PARA FORMATEAR (HH:MM:SS) ---
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    // Añadimos ceros a la izquierda si es necesario (ej: 09:05:01)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setTimeLeft(hasExtra25 ? TOTAL_SECONDS_WITH_25 : TOTAL_SECONDS_INITIAL);
    setIsActive(false);
  }, [TOTAL_SECONDS_INITIAL, TOTAL_SECONDS_WITH_25, hasExtra25, idExamen, contador]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const baseTimeLeft = hasExtra25
      ? Math.max(timeLeft - EXTRA_TOTAL_SECONDS, 0)
      : timeLeft;

    // Se realiza la cuenta atrás
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 

    // Si queda 10 segundos lanza el audio
    if (isActive && baseTimeLeft === 10) {
      const audio = audioFin.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);
      }
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }

    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, hasExtra25, EXTRA_TOTAL_SECONDS]);

  const handleStart = async () => {
    if (timeLeft === 0) {
      setTimeLeft(hasExtra25 ? TOTAL_SECONDS_WITH_25 : TOTAL_SECONDS_INITIAL);
    }
    setIsActive(true);
    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: hasMultiplePartes ? "Comenzar examen - " + parteActual.nombre : "Comenzar examen"
    }
    await dispatch.eventoModel.createEvento(payload)
  };

  const handlePause = async () => {
    setIsActive(false);
    setIsPause(true);

    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "Pausa del examen"
    }
    await dispatch.eventoModel.createEvento(payload)
  };

  const handleNext = async () => {
    const baseLeftNow = hasExtra25
      ? Math.max(timeLeft - EXTRA_TOTAL_SECONDS, 0)
      : timeLeft;
    const remainingExtraNow = hasExtra25
      ? Math.max(timeLeft - baseLeftNow, 0)
      : 0;

    if (hasExtra25 && baseLeftNow === 0) {
      setCarryExtraSeconds(remainingExtraNow);
    } else {
      setCarryExtraSeconds(0);
    }

    setIsActive(false);
    setIsPause(false);
    setContador((prev) => Math.min(prev + 1, totalPartes));

    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "Siguiente parte - " + parteActual.nombre
    }
    await dispatch.eventoModel.createEvento(payload)
  };

  const handleBack = async () => {
    setCarryExtraSeconds(0);
    setContador((prev) => Math.min(prev - 1, totalPartes));

    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "Parte anterior - " + parteActual.nombre
    }
    await dispatch.eventoModel.createEvento(payload)
  };

  const handleMoreTime = async () => {
    setTimeLeft((prev) => prev + timeExtra * 60);
    const payload = {
      id: parteActual!.id,
      tiempoExtra: timeExtra
    }
    await dispatch.parteExamenModel.sumarMinutosParteExamen(payload)
    setTimeExtra(0);
    onCloseTime();

    const payload2 = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "Añadir más tiempo extra"
    }
    await dispatch.eventoModel.createEvento(payload2)
  };

  const handleTimeExtraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = Number(event.target.value);
    setTimeExtra(minutes);
  };

  const handleFinish = async () => {
    if (!examen?.id || !idAsign) return;
    await dispatch.examenModel.updateEstadoExamen(examen.id);
    onCloseFinish();
    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "Examen finalizado"
    }
    await dispatch.eventoModel.createEvento(payload)
    const payload2 = {
      id_asignatura: idAsign,
      nombre_p: user?.firstName!,
      apellidos_p: user?.lastName!,
      curso: cursoAcademico,
      n_matriculados: sesion!.n_esperados!,
      n_presentados: sesion!.n_present!,
      porcentaje_aprobados: 0,
      convocatoria: examen.convocatoria,
      tipo_convocatoria: examen.tipo_convocatoria
    }
    await dispatch.historicoModel.createHistorico(payload2);
    navigate(`/asignatura/${idAsign}`);
  }

  const countdownColor = timeLeft < 300 ? "red.800" : "teal.600"; 
  const countdownColor25 = timeLeft < 300 ? "red.500" : "teal.400";

  const toSeconds = (p?: { duracion_h?: number; duracion_m?: number }) =>
  ((p?.duracion_h ?? 0) * 3600) + ((p?.duracion_m ?? 0) * 60);

  const siguientesPartes = partes.slice(contador + 1, contador + 5);
  const hasMultiplePartes = partes.length > 1;

  const getEmpiezaEn = (relativeIndex: number) => {
    const intermedias = siguientesPartes
      .slice(0, relativeIndex)
      .reduce((acc, p) => acc + toSeconds(p), 0);

    const baseTimeLeft = hasExtra25
      ? Math.max(timeLeft - EXTRA_TOTAL_SECONDS, 0)
      : timeLeft;

    return baseTimeLeft + intermedias;
  };

  const handle25 = async () => {
    if (hasExtra25) {
      onClose25();
      return;
    }
    setHasExtra25(true);
    setTimeLeft((prev) => prev + Math.floor(TOTAL_SECONDS_INITIAL * 0.25));
    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "Sí 25% tiempo extra"
    }
    await dispatch.eventoModel.createEvento(payload)
    onClose25();
  };

  const no25 = async () => {
    const payload = {
      id_sesion: idSesion!,
      timestamp: new Date(),
      tipo_evento: "No 25% tiempo extra"
    }
    await dispatch.eventoModel.createEvento(payload)
    onClose25();
  };

  const progressWith25 = TOTAL_SECONDS_WITH_25 === 0
    ? 0
    : (timeLeft / TOTAL_SECONDS_WITH_25) * 100;

  const timeLeftWithout25 = hasExtra25
    ? Math.max(timeLeft - EXTRA_TOTAL_SECONDS, 0)
    : timeLeft;

  const progress = TOTAL_SECONDS_INITIAL === 0 ? 0 : (timeLeftWithout25 / TOTAL_SECONDS_INITIAL) * 100;

  return (
    <Box bg="white" w="100%"> 
      <NavBar />   

      <Link as={RouterLink} to={`/asignatura/${idAsign}`} color="blue.600">
        <Text fontSize={"md"} mt={"5"} ml={"3"} >&lt; Volver atrás</Text>
      </Link>
      
      <Container maxW="100%" >
        <Grid
          templateColumns={hasMultiplePartes ? { base: "1vh", lg: "3fr 1fr" } : { base: "1fr", lg: "1fr" }}
          gap={6}
          alignItems="start"
          >

        <GridItem>
          <VStack align="center" spacing={6} textAlign="center">
          <Box>
            <Heading>
                {asignatura?.nombre || "Asignatura"}
            </Heading>
            <Heading size={"lg"}>
              {parteActual?.nombre || "Parte"}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Convocatoria: {examen?.convocatoria} {cursoAcademico || año} 
            </Text>
            <Text fontSize="lg" color="gray.600" >
                Tiempo total: {INPUT_HORAS !== 0 ? INPUT_HORAS+"h" : ""} {INPUT_MINUTOS !== 0 ? INPUT_MINUTOS+"min" : ""}
            </Text>
          </Box>
        </VStack>

        <Flex justify={"center"}>
          <Box position="relative" w="50vh" h="50vh">
            {hasExtra25 ? (
              <CircularProgress
                value={Math.max(0, Math.min(progressWith25, 100))}
                color={countdownColor}
                size="50vh"
                thickness="8px"
                capIsRound
                trackColor="gray.100"
                position="absolute"
                top="0"
                left="0"
              />
            ) : null}

            <CircularProgress
              value={Math.max(0, Math.min(progress, 100))}
              color={countdownColor25}
              size={hasExtra25 ? "44vh" : "50vh"}
              thickness="8px"
              capIsRound
              trackColor="gray.100"
              position={hasExtra25 ? "absolute" : "relative"}
              top={hasExtra25 ? "3vh" : undefined}
              left={hasExtra25 ? "3vh" : undefined}
            >
              <CircularProgressLabel>
                <VStack spacing={1}>
                  <Text fontSize="4xl" fontWeight="bold" lineHeight="1" textColor={countdownColor25}>
  
                    {formatTime(timeLeftWithout25)}
                  </Text>
                  {hasExtra25 ? (
                    <Text fontSize="lg" fontWeight="semibold" lineHeight="1" textColor={countdownColor}>
                      Con 25%: {formatTime(timeLeft)}
                    </Text>
                  ) : null}
                </VStack>
              </CircularProgressLabel>
            </CircularProgress>
          </Box>
        </Flex>

        <Flex justify={"center"} mt={"5"}>
          <Button 
            colorScheme="teal" 
            size="lg" 
            onClick={handleStart}
            isDisabled={isActive && timeLeft > 0}
            w="25vh"
          >
            {
              isPause ? "Reanudar" : isActive ? "En curso..." : (timeLeft === 0 ? "Reiniciar" : "Comenzar Examen")
            }
          </Button>

          {isActive ? 
          (<Button 
            colorScheme="teal" 
            size="lg" 
            onClick={handlePause}
            isDisabled={!isActive}
            ml="10"
            w="25vh"
          >
            Pausar
          </Button>):(<></>)}

          {(contador !== 0) && (!isActive) ?
            (<Button 
              colorScheme="teal" 
              size="lg" 
              onClick={handleBack}
              isDisabled={isActive && timeLeft > 0}
              w="25vh"
              ml={"10"}
            >
              Parte Anterior
            </Button>
            ) : (<></>)
          }

          {(totalPartes !== contador) && (!isActive || timeLeftWithout25 === 0) ?
            (<Button 
              colorScheme="teal" 
              size="lg" 
              onClick={handleNext}
              isDisabled={isActive && timeLeftWithout25 > 0}
              w="25vh"
              ml={"10"}
            >
              Siguiente parte
            </Button>) : (<></>)
          }

          {(timeLeft == 0) ?
            (<Button 
              colorScheme="teal" 
              size="lg" 
              onClick={onOpenTime}
              w="25vh"
              ml={"10"}
            >
              Añadir más tiempo
            </Button>) : (<></>)
          }

          {!isActive ?
            (<Button 
              colorScheme="teal" 
              size="lg" 
              onClick={onOpenFinish}
              w="25vh"
              ml={"10"}
            >
              Finalizar Examen
            </Button>
            ) : (<></>)
          }
        </Flex>
        </GridItem>
        {hasMultiplePartes ? (
          <GridItem>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Siguientes partes</Heading>

              {siguientesPartes.length === 0 ? (
                <Text color="gray.500">No hay más partes.</Text>
              ) : (
                siguientesPartes.map((p, i) => (
                  <Box key={p.id ?? `${p.nombre}-${i}`} p={4} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold" fontSize={"md"}>{p.nombre}</Text>
                    <Text fontSize="md" color="gray.600">
                      Duración: {formatTime(toSeconds(p))}
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      Empieza en: {formatTime(getEmpiezaEn(i))}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </GridItem>
        ) : null}
        </Grid>
      </Container>  

      <Modal isOpen={isOpenFinish} onClose={onCloseFinish} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"}>
              <ModalHeader textAlign={"center"}>¿Finalizar examen?</ModalHeader>
              <ModalCloseButton />
              <ModalBody >
                <Flex justifyContent={"center"} mb={"3"}>
                  <Button 
                    colorScheme='blue' 
                    onClick={onCloseFinish}
                  >
                    Cancelar
                  </Button>

                  <Button 
                    colorScheme='red' 
                    onClick={handleFinish}
                    ml={3}
                  >
                    Finalizar
                  </Button>
                </Flex>  
              </ModalBody>
            </ModalContent>
      </Modal>

      <Modal isOpen={isOpen25} onClose={onClose25} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"}>
              <ModalHeader textAlign={"center"}>¿Hay alumnos con el 25%?</ModalHeader>
              <ModalBody >
                <Flex justifyContent={"center"} mb={"3"}>
                  <Button 
                    colorScheme='blue' 
                    onClick={handle25}
                    width={"10vh"}
                  >
                    Sí
                  </Button>

                  <Button 
                    colorScheme='blue' 
                    onClick={no25}
                    ml={3}
                    width={"10vh"}
                  >
                    No
                  </Button>
                </Flex>  
              </ModalBody>
            </ModalContent>
      </Modal>

      <Modal isOpen={isOpenTime} onClose={onCloseTime} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"}>
              <ModalHeader textAlign={"center"}>Añadir más tiempo</ModalHeader>
              <ModalCloseButton />
              <ModalBody >
                <Flex justifyContent={"center"} mb={"3"}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">¿Cuántos minutos?</FormLabel>
                    <Input
                      id="minutos" 
                      name="minutos" 
                      type="number"
                      placeholder="" 
                      onChange={handleTimeExtraChange}
                      value={timeExtra === 0 ? "" : timeExtra}
                      size="lg"
                      borderRadius="xl"    
                      focusBorderColor="blue.500"
                    />
                  </FormControl>
                </Flex>
              
                
              </ModalBody>
              <ModalFooter justifyContent={"center"}>
                <Button 
                    colorScheme='blue' 
                    onClick={handleMoreTime}
                    isDisabled={timeExtra <= 0}
                    _hover={{bgcolor:"red"}}
                  >
                    Añadir
                  </Button>
              </ModalFooter>
            </ModalContent>

        </Modal>
    </Box>
  );
}
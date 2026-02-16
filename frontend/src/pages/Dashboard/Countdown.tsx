import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useParams } from "react-router-dom";
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
  Link
} from "@chakra-ui/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";

import { Link as RouterLink } from "react-router-dom";

export default function Countdown() {
  const dispatch = useDispatch<IDispatch>();
  const { idAsign } = useParams<{ idAsign: string }>();
  const { idExamen } = useParams<{ idExamen: string }>();

  const asignatura = useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
  const examen = useSelector((state: IRootState) => state.examenModel.selectedExamen);
  const partes = useSelector((state: IRootState) => state.parteExamenModel.partesExamenes);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [contador, setContador] = useState(0);
  let totalPartes = partes.length - 1;

  const audioFin = useRef<HTMLAudioElement | null>(null);

  const parteActual = partes[contador];
  const INPUT_HORAS = parteActual?.duracion_h ?? 0; 
  const INPUT_MINUTOS = parteActual?.duracion_m ?? 0;

  const año = examen?.fecha_examen
  ? new Date(examen.fecha_examen).getFullYear()
  : "";

  // Convertimos todo a segundos para la lógica interna
  const TOTAL_SECONDS_INITIAL = (INPUT_HORAS * 3600) + (INPUT_MINUTOS * 60);

  useEffect(() => {
    if (idAsign) dispatch.asignaturaModel.getAsignatura(idAsign);
    if (idExamen) {
        dispatch.examenModel.getExamen(idExamen);
        dispatch.parteExamenModel.getPartesExamen(idExamen);
    }
  }, [dispatch, idExamen, idAsign]);

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
    setTimeLeft(TOTAL_SECONDS_INITIAL);
    setIsActive(false);
  }, [TOTAL_SECONDS_INITIAL, idExamen, contador]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // Se realiza la cuenta atrás
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 

    // Si queda 10 segundos lanza el audio
    if (isActive && timeLeft === 10) {
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
  }, [isActive, timeLeft]);

  const handleStart = () => {
    if (timeLeft === 0) setTimeLeft(TOTAL_SECONDS_INITIAL);
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    setIsPause(true);
  };

  const handleNext = () => {
    setContador((prev) => Math.min(prev + 1, totalPartes));
  };

  const handleBack = () => {
    setContador((prev) => Math.min(prev - 1, totalPartes));
  };

  // Cálculo del porcentaje para la barra (0 a 100)
  const progress = TOTAL_SECONDS_INITIAL === 0 ? 0 : (timeLeft / TOTAL_SECONDS_INITIAL) * 100;

  return (
    <Box bg="white" w="100%"> 
      <NavBar />   

      <Link as={RouterLink} to={`/asignatura/${idAsign}`} color="blue.600">
        <Text fontSize={"md"} mt={"5"} ml={"3"} >&lt; Volver atrás</Text>
      </Link>
      
      <Container maxW="full" mt={5}>
        
        <VStack align="center" spacing={6} textAlign="center">
          <Box>
            <Heading>
                {asignatura?.nombre || "Asignatura"}
            </Heading>
            <Heading size={"lg"} mt={2} mb={2}>
              {parteActual?.nombre || "Parte"}
            </Heading>
            <Text fontSize="lg" color="gray.600">
                Convocatoria: {examen?.convocatoria} {año} 
            </Text>
            <Text fontSize="lg" color="gray.600" mb={2}>
                Tiempo total: {INPUT_HORAS !== 0 ? INPUT_HORAS+"h" : ""} {INPUT_MINUTOS !== 0 ? INPUT_MINUTOS+"min" : ""}
            </Text>
          </Box>
        </VStack>

        <Flex justify={"center"}>
          <CircularProgress 
            value={progress} 
            color={timeLeft < 300 ? "red.400" : "teal.400"} // Rojo si quedan menos de 5 min
            size="50vh" 
            thickness="8px" 
            capIsRound
            trackColor="gray.100"
          >
            <CircularProgressLabel 
              fontSize="4xl" 
              fontWeight="bold"
              lineHeight="1"
            >
              {formatTime(timeLeft)}
            </CircularProgressLabel>
          </CircularProgress>
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

          {(totalPartes !== contador) && (!isActive) ?
            (<Button 
              colorScheme="teal" 
              size="lg" 
              onClick={handleNext}
              isDisabled={isActive && timeLeft > 0}
              w="25vh"
              ml={"10"}
            >
              Siguiente parte
            </Button>) : (<></>)
          }
        </Flex>
      </Container>  
    </Box>
  );
}
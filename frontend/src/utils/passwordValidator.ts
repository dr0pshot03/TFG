import { Dispatch, SetStateAction } from "react";

type Props = {
  password: string;
  setPasswordCheck: Dispatch<SetStateAction<boolean>>;
};
export const validatePassword = ({ password, setPasswordCheck }: Props) => {
  // RegEx patterns
  const pattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,}).*$/;
  const regexCheck = pattern.test(password);

  // 1. Password Strength Check
  if (regexCheck) setPasswordCheck(true);
  else setPasswordCheck(false);
};

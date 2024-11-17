import { createContext } from "react";
import { SampleContextType } from "../types/SampleContextTypes";

export const DEFAULT_SAMPLE_CONTEXT = {
  teamName: "SMVS Youth App",
  numTerms: 3,
  members: ["Alex", "Dinu", "Preet", "Rahul"],
  isActive: true,
};

const SampleContext = createContext<SampleContextType>(DEFAULT_SAMPLE_CONTEXT);

export default SampleContext;

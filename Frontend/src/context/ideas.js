import {
  createContext,
  useContext
} from "react";

const IdeasContext = createContext({
  ideas: [],
  setIdeas: () => {}
})

export const IdeasProvider = IdeasContext.Provider;

export const useIdeas = () => {
  return useContext(IdeasContext);
}
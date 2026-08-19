import { useQuery } from "@tanstack/react-query";
import { fetchMenu } from "../lib/api";

export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: fetchMenu,
    placeholderData: (prev) => prev,
  });
}
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteVisitor, getVisitor, postVisitor, putVisitor } from "@Service/Visitor";

export const useVisitorsQuery = ({ page, limit, search }) =>
  useQuery({
    queryKey: ["visitors", page, limit, search || ""],
    queryFn: ({ signal }) => getVisitor(page, limit, search, signal),
    placeholderData: keepPreviousData,
  });

export const useSaveVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitor, uuid }) =>
      uuid ? putVisitor(visitor, uuid) : postVisitor(visitor),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
};

export const useDeleteVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVisitor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
};

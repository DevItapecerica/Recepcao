import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getUser, postUser, resendUserActivation, updateUser } from "@Service/User";

export const useUsersQuery = ({ page, limit, search }) =>
  useQuery({
    queryKey: ["users", page, limit, search || ""],
    queryFn: ({ signal }) => getUser(page, limit, search, signal),
    placeholderData: keepPreviousData,
  });

export const useSaveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ user, uuid }) =>
      uuid ? updateUser(user, uuid) : postUser(user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useResendUserActivation = () => useMutation({ mutationFn: resendUserActivation });

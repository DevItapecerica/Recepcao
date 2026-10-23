import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addVisits, getDashboard, getVisits, getVisitsByVisitorId } from "@Service/Visits";

export const useVisitsQuery = ({ page, limit, search }) =>
  useQuery({
    queryKey: ["visits", page, limit, search?.toISOString() || ""],
    queryFn: ({ signal }) => getVisits(page, limit, search, signal),
    placeholderData: keepPreviousData,
  });

export const useDashboardQuery = ({ dateFrom, dateTo, limit = 5 }) =>
  useQuery({
    queryKey: ["dashboard", dateFrom, dateTo, limit],
    queryFn: ({ signal }) => getDashboard(dateFrom, dateTo, limit, signal),
    placeholderData: keepPreviousData,
  });

export const useVisitorVisitsQuery = (visitorUuid, enabled) =>
  useQuery({
    queryKey: ["visitor-visits", visitorUuid],
    queryFn: ({ signal }) => getVisitsByVisitorId(visitorUuid, signal),
    enabled: enabled && Boolean(visitorUuid),
  });

export const useAddVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitorUuid, visit }) => addVisits(visitorUuid, visit),
    onSuccess: (_data, { visitorUuid }) => {
      queryClient.invalidateQueries({ queryKey: ["visitor-visits", visitorUuid] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

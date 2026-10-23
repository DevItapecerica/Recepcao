
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getOccurrenceTypes,
  getOccurrencesByVisitorId,
  getOccurrenceStatus,
  addOccurrence,
  updateOccurrence,
  deleteOccurrence,
  getOccurrenceAudit,
} from "@Service/Occurrences";

// Tipos de ocorrências disponíveis
export const useOccurrenceTypesQuery = () =>
  useQuery({
    queryKey: ["occurrence-types"],
    queryFn: ({ signal }) => getOccurrenceTypes(signal),
  });

// Histórico do munícipe
export const useVisitorOccurrencesQuery = (visitorUuid, enabled) =>
  useQuery({
    queryKey: ["visitor-occurrences", visitorUuid],
    queryFn: ({ signal }) =>
      getOccurrencesByVisitorId(visitorUuid, signal),
    enabled: Boolean(enabled && visitorUuid),
  });

// Pontuação dos últimos 6 meses
export const useVisitorOccurrenceStatusQuery = (visitorUuid, enabled) =>
  useQuery({
    queryKey: ["visitor-occurrence-status", visitorUuid],
    queryFn: ({ signal }) =>
      getOccurrenceStatus(visitorUuid, signal),
    enabled: Boolean(enabled && visitorUuid),
  });

// Cadastrar ocorrência
export const useAddOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addOccurrence,
    onSuccess: (_data, occurrence) => {
      queryClient.invalidateQueries({
        queryKey: [
          "visitor-occurrences",
          occurrence.visitor_uuid,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "visitor-occurrence-status",
          occurrence.visitor_uuid,
        ],
      });
    },
  });
};

// Editar ocorrência
export const useUpdateOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, occurrence }) =>
      updateOccurrence(uuid, occurrence),
    onSuccess: (data) => {
      const visitorUuid = data.occurrence?.visitor_uuid;

      queryClient.invalidateQueries({
        queryKey: ["visitor-occurrences", visitorUuid],
      });

      queryClient.invalidateQueries({
        queryKey: ["visitor-occurrence-status", visitorUuid],
      });
    },
  });
};

// Excluir ocorrência
export const useDeleteOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid }) => deleteOccurrence(uuid),

    onSuccess: (_data, { visitorUuid }) => {
      queryClient.invalidateQueries({
        queryKey: ["visitor-occurrences", visitorUuid],
      });

      queryClient.invalidateQueries({
        queryKey: ["visitor-occurrence-status", visitorUuid],
      });
    },
  });
};

// Consultar auditoria
export const useOccurrenceAuditQuery = (uuid, enabled) =>
  useQuery({
    queryKey: ["occurrence-audit", uuid],
    queryFn: ({ signal }) => getOccurrenceAudit(uuid, signal),
    enabled: Boolean(enabled && uuid),
  });

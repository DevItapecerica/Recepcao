
import API from "@API/API";

// Listar os tipos de ocorrências predefinidos
export const getOccurrenceTypes = async (signal) => {
  const { data } = await API.get("/occurrences", { signal });
  return data;
};

// Buscar o histórico de ocorrências de um munícipe
export const getOccurrencesByVisitorId = async (uuid, signal) => {
  const { data } = await API.get(
    `/occurrences/visitor/${uuid}`,
    { signal }
  );

  return data;
};

// Consultar a pontuação dos últimos 6 meses
export const getOccurrenceStatus = async (uuid, signal) => {
  const { data } = await API.get(
    `/occurrences/visitor/${uuid}/status`,
    { signal }
  );

  return data;
};

// Cadastrar uma ocorrência
export const addOccurrence = async (occurrence) => {
  const { data } = await API.post("/occurrences", occurrence);
  return data;
};

// Editar uma ocorrência
export const updateOccurrence = async (uuid, occurrence) => {
  const { data } = await API.put(
    `/occurrences/${uuid}`,
    occurrence
  );

  return data;
};

// Excluir logicamente uma ocorrência
export const deleteOccurrence = async (uuid) => {
  const { data } = await API.delete(`/occurrences/${uuid}`);
  return data;
};

// Consultar auditoria
export const getOccurrenceAudit = async (uuid, signal) => {
  const { data } = await API.get(
    `/occurrences/${uuid}/audit`,
    { signal }
  );

  return data;
};

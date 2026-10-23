import API from "@API/API";

function formatDateToQuery(date) {
  return date.toISOString().split("T")[0]; // "2025-08-18"
}

export const getVisits = async (page, limit, search, signal) => {
  const formattedDate = search ? formatDateToQuery(search) : null;

  const url = search
    ? `/visits?page=${page || 0}&limit=${limit || 10}&search=${formattedDate}`
    : `/visits?page=${page || 0}&limit=${limit || 10}`;

  const { data } = await API.get(url, { signal });

  return data;
};

export const getVisitsByVisitorId = async (uuid, signal) => {
  const url = `/visits/visitor/${uuid}`;

  const { data } = await API.get(url, { signal });

  return data;
};

export const getDashboard = async (dateFrom, dateTo, limit = 5, signal) => {
  const { data } = await API.get("/visits/dashboard", {
    params: { dateFrom, dateTo, limit }, signal,
  });

  return data;
};

export const addVisits = async (uuid, newVisit) => {
  const url = `/visits`;

  const { data } = await API.post(url, { ...newVisit, visitor_uuid: uuid });

  return data;
};

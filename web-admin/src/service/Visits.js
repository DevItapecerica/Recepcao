import API from "@API/API";

function formatDateToQuery(date) {
  return date.toISOString().split("T")[0]; // "2025-08-18"
}

export const getVisits = async (page, limit, search) => {
  const formattedDate = search ? formatDateToQuery(search) : null;

  const url = search
    ? `/visits?page=${page || 0}&limit=${limit || 10}&search=${formattedDate}`
    : `/visits?page=${page || 0}&limit=${limit || 10}`;

  const { data } = await API.get(url, {
    headers: { Authorization: localStorage.getItem("token") },
  });

  return data;
};

export const getVisitsByVisitorId = async (uuid) => {
  const url = `/visits/visitor/${uuid}`;

  const { data } = await API.get(url, {
    headers: { Authorization: localStorage.getItem("token") },
  });

  return data;
};

export const addVisits = async (uuid, newVisit) => {
  const url = `/visits`;

  const { data } = await API.post(
    url,
    { ...newVisit, visitor_uuid: uuid },
    {
      headers: { Authorization: localStorage.getItem("token") },
    }
  );

  return data;
};

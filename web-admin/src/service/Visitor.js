import API from "@API/API";

export const getVisitor = async (page, limit, search) => {
  const url = search
    ? `/visitors?page=${page || 0}&limit=${limit || 10}&search=${search}`
    : `/visitors?page=${page || 0}&limit=${limit || 10}`;

  const { data } = await API.get(url, {
    headers: { Authorization: localStorage.getItem("token") },
  });

  return data;
};

export const postVisitor = async (visitor) => {
  const payload = {
    name: visitor.name,
    cpf: visitor.cpf,
    photo: visitor.photo || null,
    email: visitor.email || null,
    phone: visitor.phone || null,
    address: visitor.address || null,
    city: visitor.city || null,
    state: visitor.state || null,
    zipCode: visitor.zipCode || null,
  };

  const { data } = await API.post("/visitors", payload, {
    headers: { Authorization: localStorage.getItem("token") },
  });

  return data;
};

export const putVisitor = async (visitor, uuid) => {
  const payload = {
    name: visitor.name,
    photo: visitor.photo || null,
    email: visitor.email || null,
    phone: visitor.phone || null,
    address: visitor.address || null,
    city: visitor.city || null,
    state: visitor.state || null,
    zipCode: visitor.zipCode || null,
  };

  const { data } = await API.put(`/visitors/${uuid}`, payload, {
    headers: { Authorization: localStorage.getItem("token") },
  });

  return data;
};

export const deleteVisitor = async (uuid) => {
  const { data } = await API.delete(`/visitors/${uuid}`, {
    headers: { Authorization: localStorage.getItem("token") },
  });
  return data;
};

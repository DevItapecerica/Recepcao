import API from "@API/API";

export const getUser = async (page, limit, search, signal) => {
  const url = search
    ? `/user?page=${page || 0}&limit=${limit || 10}&search=${search}`
    : `/user?page=${page || 0}&limit=${limit || 10}`;

  const { data } = await API.get(url, { signal });

  return data;
};

export const postUser = async (newUser) => {
  const payload = {
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    role: newUser.role,
    email: newUser.email,
    cpf: newUser.cpf,
  };

  const { data } = await API.post("/user", payload);

  return data;
};

export const deleteUser = async (uuid) => {
  const { data } = await API.delete(`/user/${uuid}`);
  return data;
};

export const updateUser = async (user, uuid) => {
  const { data } = await API.put(
    `/user/${uuid}`,
    {
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      email: user.email,
    }
  );

  return data;
};

export const resendUserActivation = async (uuid) => {
  const { data } = await API.post(`/user/${uuid}/activation`);
  return data;
};

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TableHeader from "@/components/table/TableHeader";
import { Paginator } from "primereact/paginator";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import { useEffect, useState } from "react";
import { useToast } from "@Context/toast/ToastContext";
import { useUsers } from "@Context/users/UsersContext";
import { getUser } from "@Service/User";

const columns = [
  { field: "first_name", header: "First Name" },
  { field: "last_name", header: "Last Name" },
  { field: "username", header: "Username" },
  { field: "email", header: "Email" },
  { field: "role", header: "Role" },
];

const UserTable = ({ setEditIsVisible, setExcludeIsVisible }) => {
  const { users, setUsers, totalUsers, setTotalUsers, setUserTarget } =
    useUsers();

  const { showToast } = useToast();
  const [query, setQuery] = useState({
    page: 0,
    limit: 10,
    search: null,
  });

  const fetchData = async () => {
    try {
      const { user, count } = await getUser(
        query.page,
        query.limit,
        query.search
      );
      setTotalUsers(count);
      setUsers(user);
    } catch (error) {
      showToast("error", "error", error.response.data.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query]);

  const ActionsFields = (data) => {
    const toEdit = () => {
      setUserTarget(data);
      setEditIsVisible(true);
    };

    const toExclude = () => {
      setUserTarget(data);
      setExcludeIsVisible(true);
    };

    return (
      <div className="flex items-center gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={() => {
            toEdit();
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => {
            toExclude();
          }}
        />
      </div>
    );
  };

  return (
    <section>
      <div className="p-inputgroup flex-1 pb-4">
        <InputText
          type="search"
          placeholder="Pesquisar por nome, CPF ou sobrenome"
          value={query.search || ""}
          onChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              search: e.target.value,
              page: 0,
            }))
          }
          className="w-full px-4 max-w-86"
        />
        <span className="p-inputgroup-addon">
          <i className="pi pi-search" />
        </span>
      </div>
      <TableHeader
        end={
          <div className="md:flex items-center gap-2">
            <Button
              label="New user"
              icon="pi pi-user-plus"
              className="btn-primary"
              onClick={() => setEditIsVisible(true)}
            />
          </div>
        }
        center={<h2 className="text-2xl font-bold">Users</h2>}
        start={
          <div className="flex items-center gap-4">
            <span>Total Users: {totalUsers}</span>
          </div>
        }
      ></TableHeader>
      <DataTable value={users} size="medium" stripedRows>
        {columns.map((col, index) => (
          <Column key={index} field={col.field} header={col.header} />
        ))}
        <Column header="Actions" body={(rowData) => ActionsFields(rowData)} />
      </DataTable>
      <Paginator
        first={query.page}
        rows={query.limit}
        totalRecords={totalUsers}
        rowsPerPageOptions={[1, 10, 20, 30]}
        onPageChange={(e) =>{
          setQuery((prev) => ({
            ...prev,
            page: e.page,
            limit: e.rows,
          }))}
        }
      />
    </section>
  );
};

export default UserTable;

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TableHeader from "@/components/table/TableHeader";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import { useEffect, useState } from "react";
import { useToast } from "@Context/toast/ToastContext";
import { useUsersQuery } from "@/hooks/queries/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import RowActions from "@/components/table/RowActions";
import { confirmDialog } from "primereact/confirmdialog";
import { useDeleteUser } from "@/hooks/queries/useUsers";
import { useResendUserActivation } from "@/hooks/queries/useUsers";
import { useProfile } from "@Context/profile/ProfileContext";

const columns = [
  { field: "first_name", header: "First Name" },
  { field: "last_name", header: "Last Name" },
  { field: "username", header: "Username" },
  { field: "email", header: "Email" },
  { field: "role", header: "Role" },
];

const UserTable = ({ setEditIsVisible, setUserTarget }) => {
  const { showToast } = useToast();
  const [query, setQuery] = useState({
    page: 0,
    limit: 10,
    search: null,
  });

  const search = useDebounce(query.search);
  const { data, isPending, isFetching, error } = useUsersQuery({ ...query, search });
  const users = data?.user || [];
  const totalUsers = data?.count || 0;
  const deleteUser = useDeleteUser();
  const resendActivation = useResendUserActivation();
  const { user: currentUser } = useProfile();

  useEffect(() => {
    if (error) showToast("error", "Erro", error.response?.data?.message || error.message);
  }, [error, showToast]);

  const ActionsFields = (data) => {
    const toEdit = () => {
      setUserTarget(data);
      setEditIsVisible(true);
    };

    const remove = () => confirmDialog({ message: `Excluir ${data.first_name} ${data.last_name}?`, header: "Confirmar exclusão", icon: "pi pi-exclamation-triangle", acceptLabel: "Excluir", rejectLabel: "Cancelar", acceptClassName: "p-button-danger", accept: () => deleteUser.mutateAsync(data.uuid) });
    const canManage = currentUser?.role === "superadmin" || !["admin", "superadmin"].includes(data.role);
    const items = canManage ? [
      { label: "Editar", icon: "pi pi-pencil", command: toEdit },
      ...(data.firstLogin ? [{ label: "Reenviar ativação", icon: "pi pi-envelope", command: async () => { try { const result = await resendActivation.mutateAsync(data.uuid); showToast(result.activationSent ? "success" : "warn", "Ativação", result.message); } catch (error) { showToast("error", "Erro", error.response?.data?.message || error.message); } } }] : []),
      ...(currentUser?.role === "superadmin" ? [{ label: "Excluir", icon: "pi pi-trash", command: remove }] : []),
    ] : [];
    return items.length ? <RowActions label={`Ações de ${data.first_name}`} items={items} /> : null;
  };

  return (
    <section>
      <div className="p-inputgroup flex-1 pb-4">
        <InputText
          type="search"
          placeholder="Buscar por nome"
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
              label="Novo usuário"
              icon="pi pi-user-plus"
              className="btn-primary"
              onClick={() => setEditIsVisible(true)}
            />
          </div>
        }
        center={<h2 className="text-2xl font-bold">Usuários</h2>}
        start={
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{totalUsers} usuários</span>
          </div>
        }
      ></TableHeader>
      <DataTable value={users} lazy paginator first={query.page * query.limit} rows={query.limit} totalRecords={totalUsers} rowsPerPageOptions={[10, 20, 30]} onPage={(e) => setQuery((prev) => ({ ...prev, page: e.page, limit: e.rows }))} scrollable tableStyle={{ minWidth: "64rem" }} stripedRows loading={isPending || isFetching} emptyMessage="Nenhum usuário encontrado.">
        {columns.map((col, index) => (
          <Column key={index} field={col.field} header={col.header} />
        ))}
        <Column header="Actions" body={(rowData) => ActionsFields(rowData)} />
      </DataTable>
    </section>
  );
};

export default UserTable;

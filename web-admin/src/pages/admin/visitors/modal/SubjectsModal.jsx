
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import API from "@API/API";
import { useToast } from "@Context/toast/ToastContext";

const SubjectsModal = ({ visible, onHide }) => {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await API.get("/subjects/");
      return data;
    },
    enabled: visible,
  });

  const subjects = Array.isArray(subjectsQuery.data)
    ? subjectsQuery.data
    : subjectsQuery.data?.subjects || [];

  const saveSubject = useMutation({
    mutationFn: async () => {
      if (editing) {
        return API.put(`/subjects/${editing.uuid}`, { name: name.trim() });
      }
      return API.post("/subjects/", { name: name.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setName("");
      setEditing(null);
      showToast("success", "Sucesso", "Assunto salvo!");
    },
    onError: (error) => {
      showToast("error", "Erro", error.response?.data?.message || error.message);
    },
  });

  const deleteSubject = useMutation({
    mutationFn: (uuid) => API.delete(`/subjects/${uuid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      showToast("success", "Sucesso", "Assunto excluído!");
    },
    onError: (error) => {
      showToast("error", "Erro", error.response?.data?.message || error.message);
    },
  });

  const handleClose = () => {
    setName("");
    setEditing(null);
    onHide();
  };

  return (
    <Dialog
      header="Cadastro de Assuntos"
      visible={visible}
      onHide={handleClose}
      modal
      style={{ width: "35rem", maxWidth: "95vw" }}
    >
      <form
        className="flex gap-2 mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) saveSubject.mutate();
        }}
      >
        <InputText
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome do assunto"
          className="flex-1"
          required
        />
        <Button
          type="submit"
          label={editing ? "Atualizar" : "Adicionar"}
          loading={saveSubject.isPending}
        />
      </form>

      <DataTable
        value={subjects}
        loading={subjectsQuery.isLoading}
        emptyMessage="Nenhum assunto cadastrado."
        paginator
        rows={5}
      >
        <Column field="name" header="Assunto" />
        <Column
          header="Ações"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                rounded
                text
                aria-label="Editar assunto"
                onClick={() => {
                  setEditing(row);
                  setName(row.name);
                }}
              />
              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                aria-label="Excluir assunto"
                disabled={deleteSubject.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Deseja excluir o assunto "${row.name}"?`
                    )
                  ) {
                    deleteSubject.mutate(row.uuid);
                  }
                }}
              />
            </div>
          )}
        />
      </DataTable>
    </Dialog>
  );
};

export default SubjectsModal;

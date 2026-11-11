
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import API from "@API/API";
import { useToast } from "@Context/toast/ToastContext";
import { useProfile } from "@/context/profile/ProfileContext";

export default function RegistryTab({ type, title }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { user } = useProfile();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const canEdit = ["admin", "superadmin"].includes(user?.role);
  const canDelete = user?.role === "superadmin";

  const query = useQuery({
    queryKey: [type],
    queryFn: async () => {
      const { data } = await API.get(`/${type}/`);
      return data;
    },
  });

  const records = Array.isArray(query.data)
    ? query.data
    : query.data?.[type] || [];

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (editing) {
        return API.put(`/${type}/${editing.uuid}`, body);
      }

      return API.post(`/${type}/`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      resetForm();
      showToast("success", "Sucesso", "Cadastro salvo com sucesso!");
    },
    onError: (error) => {
      showToast(
        "error",
        "Erro",
        error.response?.data?.message || error.message
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid) => API.delete(`/${type}/${uuid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      showToast("success", "Sucesso", "Cadastro excluído!");
    },
    onError: (error) => {
      showToast(
        "error",
        "Erro",
        error.response?.data?.message || error.message
      );
    },
  });

  return (
    <div className="flex flex-col gap-5">
      {canEdit && (
        <form
          className="flex flex-col gap-3 rounded-lg border border-border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) saveMutation.mutate();
          }}
        >
          <h2 className="text-lg font-semibold text-font-secondary">
            {editing ? `Editar ${title}` : `Cadastrar ${title}`}
          </h2>

          <div>
            <label className="block mb-2 font-medium">Nome *</label>
            <InputText
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={150}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Descrição</label>
            <InputTextarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2">
            {editing && (
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                onClick={resetForm}
              />
            )}
            <Button
              type="submit"
              label={editing ? "Atualizar" : "Cadastrar"}
              loading={saveMutation.isPending}
              disabled={!name.trim()}
            />
          </div>
        </form>
      )}

      <DataTable
        value={records}
        loading={query.isLoading}
        paginator={records.length > 5}
        rows={5}
        emptyMessage={
          query.isError
            ? "Erro ao carregar os registros."
            : "Nenhum registro cadastrado."
        }
      >
        <Column field="name" header="Nome" />
        <Column field="description" header="Descrição" />

        {(canEdit || canDelete) && (
          <Column
            header="Ações"
            body={(record) => (
              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(record);
                      setName(record.name);
                      setDescription(record.description || "");
                    }}
                  />
                )}

                {canDelete && (
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    aria-label="Excluir"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Deseja excluir "${record.name}"?`
                        )
                      ) {
                        deleteMutation.mutate(record.uuid);
                      }
                    }}
                  />
                )}
              </div>
            )}
          />
        )}
      </DataTable>
    </div>
  );
}

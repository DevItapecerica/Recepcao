import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import TableHeader from "../../../components/table/TableHeader";

import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import { format } from "date-fns";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Paginator } from "primereact/paginator";
import { Button } from "primereact/button";
import { useVisitsQuery } from "@/hooks/queries/useVisits";
import { useToast } from "@Context/toast/ToastContext";

export default function VisitsTable() {
  const calendarRef = useRef(null);
  const [query, setQuery] = useState({
    page: 0,
    limit: 10,
    search: null,
  });
  const { showToast } = useToast();
  const { data, isPending, isFetching, error } = useVisitsQuery(query);

  useEffect(() => {
    if (error) showToast("error", "Erro", error.response?.data?.message || error.message);
  }, [error, showToast]);

  return (
    <section>
      <TableHeader
        start={<h3 className="text-3xl">Visits</h3>}
        end={
          <div className="flex gap-4 items-end">
            <Button
              icon="pi pi-calendar"
              className="p-button-outlined"
              onClick={() => {
                if (calendarRef.current) {
                  calendarRef.current.show();
                }
              }}
            />
            <Calendar
              ref={calendarRef}
              onChange={(e) => {
                setQuery((prev) => ({
                  ...prev,
                  page: 0,
                  search: e.value,
                }));
              }}
              dateFormat="dd/mm/yy"
              className="w-80"
              placeholder="Buscar por visitante, assunto ou criador"
              manualInput
            />
            <Button
              icon="pi pi-times"
              className="p-button-outlined"
              onClick={() => {
                setQuery((prev) => ({ ...prev, search: null }));
              }}
            />
          </div>
        }
      />

      <div className="shadow-sm p-4 rounded-2xl flex flex-col gap-">
        <DataTable value={data?.visits || []} className="text-sm" loading={isPending || isFetching} emptyMessage="Nenhuma visita encontrada.">
          <Column
            header="Visitante"
            body={(rowData) => (
              <div className="flex items-center gap-3">
                <Avatar
                  image={rowData.visitor.photo}
                  shape="circle"
                  size="xlarge"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {rowData.visitor.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rowData.creator.username}
                  </div>
                </div>
              </div>
            )}
          />
          <Column
            field="subject"
            header="Assunto"
            body={(rowData) => <span>{rowData.subject}</span>}
          />
          <Column
            field="creator"
            header="Registrado por"
            body={(rowData) => (
              <div>
                <div>{rowData.creator.username}</div>
                <div className="text-xs text-gray-500">
                  {rowData.creator.role}
                </div>
              </div>
            )}
          />
          <Column
            field="createdAt"
            header="Date and Hour"
            body={(rowData) => (
              <span>{format(rowData.date, "dd/MM/yyyy HH:mm")}</span>
            )}
          />
        </DataTable>
        <Paginator
          first={query.page * query.limit}
          rows={query.limit}
          totalRecords={data?.count || 0}
          rowsPerPageOptions={[1, 10, 20, 30]}
          onPageChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              page: e.page,
              limit: e.rows,
            }))
          }
        />
      </div>
    </section>
  );
}

import { fireEvent, render, screen } from "@testing-library/react";
import { PrimeReactProvider } from "primereact/api";
import { Calendar } from "primereact/calendar";
import { describe, expect, it } from "vitest";
import { primeReactConfig } from "./primeReact";

describe("calendários em português do Brasil", () => {
  it("traduz meses, dias e navegação e exibe datas no formato brasileiro", () => {
    render(
      <PrimeReactProvider value={primeReactConfig}>
        <Calendar inputId="data-teste" aria-label="Data da visita" value={new Date(2026, 10, 19)}
          showIcon />
        <Calendar inline value={new Date(2026, 10, 19)} showButtonBar />
      </PrimeReactProvider>,
    );
    expect(screen.getByRole("combobox")).toHaveValue("19/11/2026");
    expect(screen.getByRole("button", { name: "Escolher data" })).toBeInTheDocument();
    expect(screen.getByText("novembro")).toBeInTheDocument();
    expect(screen.getByText("Do")).toBeInTheDocument();
    expect(screen.getByText("Sá")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próximo mês" }));
    expect(screen.getByText("dezembro")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mês anterior" }));
    expect(screen.getByText("novembro")).toBeInTheDocument();
  });

  it("traduz os controles de horário nos calendários com data e hora", () => {
    render(
      <PrimeReactProvider value={primeReactConfig}>
        <Calendar inline value={new Date(2026, 10, 19, 14, 30)} showTime hourFormat="24" />
      </PrimeReactProvider>,
    );
    expect(screen.getByRole("button", { name: "Próxima hora" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hora anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próximo minuto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minuto anterior" })).toBeInTheDocument();
  });
});

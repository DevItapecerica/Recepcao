import { useRef } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import PropTypes from "prop-types";

export default function RowActions({ items, label = "Ações do registro" }) {
  const menu = useRef(null);
  return <><Menu model={items} popup ref={menu} /><Button type="button" icon="pi pi-ellipsis-v" text rounded aria-label={label} onClick={(event) => menu.current.toggle(event)} /></>;
}
RowActions.propTypes = { items: PropTypes.array.isRequired, label: PropTypes.string };

import PropTypes from "prop-types";
const TableHeader = ({ start, center, end }) => <header className="mb-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end"><div>{center}<div className="mt-1 text-sm text-muted">{start}</div></div><div className="flex flex-wrap items-center gap-2 md:justify-end">{end}</div></header>;
TableHeader.propTypes = { start: PropTypes.node, center: PropTypes.node, end: PropTypes.node };
export default TableHeader;

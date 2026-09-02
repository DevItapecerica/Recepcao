import VisitorsTable from "./table/VisitorsTable";

import VisitorsModal from "./modal/VisitorsModal";
import VisitorsDeleteModal from "./modal/VisitorsDeleteModal";

import { useState } from "react";

import VisitorDetailsModal from "./modal/VisitsDetailsModal";

const Visitors = () => {
  // VisitorsModal
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isExcludeVisible, setIsExcludeVisible] = useState(false);

  // 2. Crie o estado para o novo modal de detalhes
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [visitorTarget, setVisitorTarget] = useState(null);

  return (
    <>
      <VisitorsModal
        visible={isEditVisible}
        onHide={() => setIsEditVisible(false)}
        visitorTarget={visitorTarget}
        setVisitorTarget={setVisitorTarget}
      />
      <VisitorsDeleteModal
        visible={isExcludeVisible}
        onHide={() => setIsExcludeVisible(false)}
        visitorTarget={visitorTarget}
        setVisitorTarget={setVisitorTarget}
      />

      {/* 4. Renderize o novo modal */}
      <VisitorDetailsModal
        visible={isDetailsVisible}
        setVisible={setIsDetailsVisible}
        visitorTarget={visitorTarget}
        setVisitorTarget={setVisitorTarget}
      />

      <VisitorsTable
        setEditIsVisible={setIsEditVisible}
        setExcludeIsVisible={setIsExcludeVisible}
        // 5. Passe o controle do modal para a tabela
        setDetailsIsVisible={setIsDetailsVisible}
        setVisitorTarget={setVisitorTarget}
      />
    </>
  );
};

export default Visitors;

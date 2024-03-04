"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import DataTable from "react-data-table-component";

interface CommonDataTableProps {
  columns: any;
  data: any;
  count?: any;
  customStyles?: any;
  updateData?: any;
  subHeaderComponent?: any;
  subHeader?: any;
  renderRow?: any;
  expandable?: boolean;
  expandableRowsComponent?: any;
  onRowClick?: any;
}

const CommonDataTable: React.FC<CommonDataTableProps> = ({
  columns,
  count,
  data,
  customStyles,
  expandableRowsComponent,
  updateData,
  subHeaderComponent,
  subHeader,
  renderRow,
  expandable = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(count);
  const [limitData, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (count >= 0) {
      setTotalRows(count);
    }
    setLoading(false);
  }, [count]);

  const handlePageChange = (page: number) => {
    updateData(page, limitData);
    setPage(page);
  };

  const handleRowsPerPageChange = async (newRowsPerPage: number) => {
    if (!data.length) return;
    updateData(1, newRowsPerPage);
    setLimit(newRowsPerPage);
    setPage(1);
  };

  return (
    <div className="items-center rounded-lg overflow-hidden border border-grey-100">
      <DataTable
        pagination
        persistTableHead
        fixedHeader={true}
        noDataComponent={
          <p className="py-3 font-bold text-lg">No data available in table</p>
        }
        fixedHeaderScrollHeight="auto"
        paginationServer
        customStyles={customStyles}
        columns={columns}
        subHeader={subHeader}
        subHeaderComponent={subHeaderComponent}
        data={data}
        progressPending={loading}
        // selectableRowsNoSelectAll={true}
        paginationTotalRows={totalRows}
        paginationDefaultPage={page}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        paginationPerPage={limitData}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
        sortServer
        expandableRows={expandable}
        expandableRowsComponent={expandableRowsComponent}
      />
    </div>
  );
};

export default CommonDataTable;

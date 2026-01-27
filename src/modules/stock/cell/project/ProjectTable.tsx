import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type ValueGetterParams,
  type ValueFormatterParams,
} from 'ag-grid-community';
import type { CellInventoryDetail } from './ProjectService';

ModuleRegistry.registerModules([AllCommunityModule]);

interface ProjectTableProps {
  data: CellInventoryDetail[];
}

export default function ProjectTable({ data }: ProjectTableProps) {
  const hasAllProjectNo = data.every(item => item.projectNo);
  const hasAllModel = data.every(item => item.model);
  const showProjectNoAndModel = hasAllProjectNo && hasAllModel;

  const columnDefs = useMemo<ColDef<CellInventoryDetail>[]>(() => {
    const baseCols: ColDef<CellInventoryDetail>[] = [
      {
        headerName: 'No.',
        valueGetter: (params: ValueGetterParams<CellInventoryDetail>) =>
          params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
        width: 70,
        filter: false,
      },
      { headerName: 'Lot No.', field: 'lot', filter: 'agTextColumnFilter' },
      { headerName: '프로젝트명', field: 'projectName', filter: 'agTextColumnFilter' },
    ];

    if (showProjectNoAndModel) {
      baseCols.push(
        { headerName: 'Project No.', field: 'projectNo', filter: 'agTextColumnFilter' },
        { headerName: '모델', field: 'model', filter: 'agTextColumnFilter' }
      );
    }

    baseCols.push(
      { headerName: '등급', field: 'grade', filter: 'agTextColumnFilter' },
      {
        headerName: 'NCR 등급',
        field: 'ncrGrade',
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams) => params.value || '-'
      },
      { headerName: '보관 일자', field: 'date', filter: 'agTextColumnFilter' },
      { headerName: '보관 위치', field: 'storageLocation', filter: 'agTextColumnFilter' },
      {
        headerName: '출고 일자',
        field: 'shippingDate',
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams) => params.value || '-'
      },
      {
        headerName: '출고 현황',
        field: 'shippingStatus',
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams) => params.value || '-'
      },
      { headerName: '인계자', field: 'deliverer', filter: 'agTextColumnFilter' },
      { headerName: '인수자', field: 'receiver', filter: 'agTextColumnFilter' },
      {
        headerName: '상세',
        field: 'details',
        filter: 'agTextColumnFilter',
        valueFormatter: (params: ValueFormatterParams) => params.value || '-'
      },
      {
        headerName: '상태',
        field: 'isShipped',
        filter: 'agTextColumnFilter',
        valueGetter: (params: ValueGetterParams<CellInventoryDetail>) =>
          params.data?.isShipped ? '출고' : ''
      },
      {
        headerName: '재입고',
        field: 'isRestocked',
        filter: 'agTextColumnFilter',
        valueGetter: (params: ValueGetterParams<CellInventoryDetail>) =>
          params.data?.isRestocked ? '재입고' : ''
      }
    );

    return baseCols;
  }, [showProjectNoAndModel]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
    minWidth: 100,
  }), []);

  const getRowStyle = (params: { data?: CellInventoryDetail }) => {
    if (params.data?.isShipped) {
      return { backgroundColor: '#fff9e6' };
    }
    return undefined;
  };

  if (data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <AgGridReact<CellInventoryDetail>
        theme={themeQuartz}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowStyle={getRowStyle}
        pagination={true}
        paginationPageSize={50}
        paginationPageSizeSelector={[20, 50, 100]}
      />
    </div>
  );
}

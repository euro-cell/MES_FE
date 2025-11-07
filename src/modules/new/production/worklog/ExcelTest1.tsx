import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

export default function WorklogPage() {
  const [data, setData] = useState<any[][]>([]);
  const [mergeCells, setMergeCells] = useState<any[]>([]);
  const [cellMeta, setCellMeta] = useState<any[]>([]);

  useEffect(() => {
    const loadExcel = async () => {
      const response = await fetch('/worklog.xlsx');
      const buffer = await response.arrayBuffer();

      const workbook = XLSX.read(buffer, { type: 'array', cellStyles: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const range = XLSX.utils.decode_range(sheet['!ref']!);
      const rows: any[][] = [];
      for (let r = range.s.r; r <= range.e.r; r++) {
        const row: any[] = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = sheet[addr];
          row.push(cell?.v ?? '');
        }
        rows.push(row);
      }

      const merges = (sheet['!merges'] || []).map(m => ({
        row: m.s.r,
        col: m.s.c,
        rowspan: m.e.r - m.s.r + 1,
        colspan: m.e.c - m.s.c + 1,
      }));

      const meta: any[] = [];
      for (const addr in sheet) {
        if (addr[0] === '!') continue;
        const cell = sheet[addr];
        if (cell?.s) {
          const pos = XLSX.utils.decode_cell(addr);
          const style: any = {};

          const fill = cell.s.fill?.fgColor?.rgb;
          if (fill) style.backgroundColor = `#${fill.slice(2)}`;
          const font = cell.s.font;
          if (font?.bold) style.fontWeight = 'bold';
          if (font?.color?.rgb) style.color = `#${font.color.rgb.slice(2)}`;
          if (font?.sz) style.fontSize = `${font.sz}px`;

          const align = cell.s.alignment;
          if (align?.horizontal) style.textAlign = align.horizontal;
          if (align?.vertical) style.verticalAlign = align.vertical;

          meta.push({ row: pos.r, col: pos.c, style });
        }
      }

      setData(rows);
      setMergeCells(merges);
      setCellMeta(meta);
    };

    loadExcel();
  }, []);

  return (
    <div style={{ background: '#fff', padding: 20 }}>
      <h2 style={{ marginBottom: 10 }}>코팅 작업 일지</h2>

      {data.length > 0 ? (
        <HotTable
          data={data}
          rowHeaders={false}
          colHeaders={false}
          mergeCells={mergeCells}
          licenseKey='non-commercial-and-evaluation'
          readOnly={true}
          className='htCenter htMiddle'
          cells={(row, col) => {
            const meta = cellMeta.find(m => m.row === row && m.col === col);
            if (meta) return { renderer: customRenderer(meta.style) };
            return {};
          }}
          stretchH='all'
        />
      ) : (
        <p>엑셀 데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
}

function customRenderer(style: React.CSSProperties) {
  return function (
    instance: Handsontable.Core,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: any,
    value: any,
    cellProperties: any
  ) {
    Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cellProperties);
    Object.assign(td.style, style);
  };
}

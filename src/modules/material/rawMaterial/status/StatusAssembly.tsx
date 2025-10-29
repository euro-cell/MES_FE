import '../../../../styles/material/rawMaterial.css';

export default function StatusAssembly() {
  const data = [
    {
      no: 1,
      category: '분리막',
      type: 'Separator',
      purpose: '생산',
      productName: 'MS-PCS12_192mm',
      lotNo: 'A250101',
      company: '에너에버배터리솔루션',
      origin: '국내',
      unit: 'M',
      price: '2,000',
      note: 'Thickness: 153μm',
      stock: 500,
    },
    {
      no: 2,
      category: '파우치',
      type: 'Pouch',
      purpose: '개발',
      productName: 'CP-153A',
      lotNo: 'A250207',
      company: '디아인텍',
      origin: '국내',
      unit: 'M',
      price: '3,500',
      note: '',
      stock: 300,
    },
    {
      no: 3,
      category: '전해액',
      type: 'Electrolyte',
      purpose: '생산',
      productName: 'ED-UFC-026A1',
      lotNo: 'A250215',
      company: '동화일렉트로라이트',
      origin: '국내',
      unit: 'Kg',
      price: '60,000',
      note: '1.15M LiPF6 in PC/EP/PP + 1% TMSB',
      stock: 120,
    },
  ];

  return (
    <div className='status-assembly'>
      <h4>🔧 조립 자재 현황</h4>

      <table className='raw-detail-table'>
        <thead>
          <tr>
            <th>No.</th>
            <th>
              자재
              <br />
              (중분류)
            </th>
            <th>
              종류
              <br />
              (소분류)
            </th>
            <th>용도</th>
            <th>제품명</th>
            <th>Lot No.</th>
            <th>제조/공급처</th>
            <th>국내/해외</th>
            <th>단위</th>
            <th>가격</th>
            <th>비고</th>
            <th>재고</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.no}>
              <td>{row.no}</td>
              <td>{row.category}</td>
              <td>{row.type}</td>
              <td>{row.purpose}</td>
              <td>{row.productName}</td>
              <td>{row.lotNo}</td>
              <td>{row.company}</td>
              <td>{row.origin}</td>
              <td>{row.unit}</td>
              <td>{row.price}</td>
              <td>{row.note}</td>
              <td>{row.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

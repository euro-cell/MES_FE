import '../../../../styles/material/rawMaterial.css';

export default function StatusElectrode() {
  const data = [
    {
      no: 1,
      category: '양극재',
      type: 'NCM622',
      purpose: '생산',
      productName: 'NCM622',
      lotNo: 'L240101',
      company: 'Easpring',
      origin: '해외',
      unit: 'Kg',
      price: '45,000',
      note: '',
      stock: 320,
    },
    {
      no: 2,
      category: '도전재',
      type: 'Super-P Li',
      purpose: '개발',
      productName: 'Super-P Li',
      lotNo: 'S240305',
      company: 'Imerys',
      origin: '해외',
      unit: 'Kg',
      price: '12,000',
      note: '',
      stock: 150,
    },
    {
      no: 3,
      category: '바인더',
      type: 'Solef5130',
      purpose: '생산',
      productName: 'Solef5130',
      lotNo: 'B240201',
      company: 'Solvay',
      origin: '해외',
      unit: 'Kg',
      price: '30,000',
      note: '',
      stock: 80,
    },
  ];

  return (
    <div className='status-electrode'>
      <h4>⚡ 전극 자재 현황</h4>

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

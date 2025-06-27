export default function Table({ columns, data }) {
  return (
    <table className="w-full text-[11px] bg-gray-800 rounded">
      <thead>
        <tr className="text-green-300 text-left border-b border-gray-700">
          {columns.map((col, idx) => (
            <th key={idx} className="p-2">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 text-gray-200">
            {row.map((cell, j) => (
              <td key={j} className="p-2 whitespace-pre-wrap">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

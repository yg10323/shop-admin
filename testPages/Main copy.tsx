import React from "react";
import ReactDOM from 'react-dom'
import { Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Table2SheetOpts } from 'xlsx'
import XLSX from "xlsx";

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
  description: string;
}

const columns: ColumnsType<DataType> = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Age", dataIndex: "age", key: "age" },
  { title: "Address", dataIndex: "address", key: "address" },
  {
    title: "Action",
    dataIndex: "",
    key: "x",
    render: () => <span>Delete</span>
  }
];

const data: DataType[] = [
  {
    key: 1,
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    description:
      "My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park."
  },
  {
    key: 2,
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    description:
      "My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park."
  },
  {
    key: 3,
    name: "Not Expandable",
    age: 29,
    address: "Jiangsu No. 1 Lake Park",
    description: "This not expandable"
  },
  {
    key: 4,
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    description:
      "My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park."
  }
];

const createNewTable = () => {
  const element = document.createElement("div");
  ReactDOM.render(
    <table>
      <tr>
        <th colSpan={18}>这是插入的新表头</th>
      </tr>
    </table>,
    element
  )
  return element
}

const handleDownload = () => {
  const newTableDom = createNewTable()
  const ws = XLSX.utils.table_to_sheet(newTableDom, { raw: true });
  XLSX.utils.sheet_add_dom(ws, document.querySelector("table"), { raw: true, origin: -1 } as Table2SheetOpts)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, "表单列表.xlsx");
};

const Main: React.FC = () => (
  <React.Fragment>
    <Table
      columns={columns}
      expandable={{
        expandedRowRender: (record) => (
          <p style={{ margin: 0 }}>{record.description}</p>
        ),
        rowExpandable: (record) => record.name !== "Not Expandable"
      }}
      dataSource={data}
    />
    <Button onClick={handleDownload}>下载</Button>
  </React.Fragment>
);

export default Main;

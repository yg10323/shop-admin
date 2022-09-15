import { useRef } from 'react'
import ReactDOM from 'react-dom';
import { Dropdown, Menu, Table, message } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import XLSX from 'xlsx'

type Props = {
  fileName?: string,
  tableID?: string,
  columns?: any[],
  dataSource?: any[],
  remoteMethod?: Function
}

const ExportToExcel = (props: Props) => {
  // 导出
  const exportToExcel = (tableDom: any) => {
    const ws = XLSX.utils.table_to_sheet(tableDom, { raw: true })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${props.fileName || '表单列表'}.xlsx`)
    tableDom = undefined
  }

  // 构建table
  const createTable = (dataSource: any = null) => {
    // 过滤操作相关的列
    let columns = (props.columns && [...props.columns]) || []
    columns = columns.filter((column: any) => column.key !== 'filterKey')
    let wrapperEle: any = document.createElement('div')
    ReactDOM.render(
      <Table
        rowKey='ID'
        columns={columns}
        dataSource={dataSource || props.dataSource}
        pagination={false}
      />,
      wrapperEle
    )
    let tableDom: any = wrapperEle.querySelector('table')
    exportToExcel(tableDom)

    wrapperEle = undefined
  }

  // 按条件导出
  const totalDataSource = useRef<any[]>([])
  const queryExport = (pageOptions: any = { PageIndex: 1, Limit: 1000 }) => {
    if (props.remoteMethod) {
      props.remoteMethod({ pageOptions }).then((data: any) => {
        const { dataSource, total } = data
        const { PageIndex, Limit } = pageOptions
        totalDataSource.current = totalDataSource.current.concat(dataSource)
        if (PageIndex * Limit < total) {
          queryExport({ PageIndex: PageIndex + 1, Limit })
        } else {
          createTable(totalDataSource)
          totalDataSource.current = []
        }
      })
    } else if (props.dataSource?.length) {
      createTable()
    } else {
      message.error('缺少remoteMethod')
    }
  }

  // 导出当前页
  const currentExport = () => {
    let tableDom: any = document.querySelector(`#${props.tableID}`)?.querySelector('table')
    tableDom ? exportToExcel(tableDom) : message.error('缺少tableID')
  }

  // 按选择导出
  const selectExport = () => {
    (props.dataSource?.length && props.columns?.length) ? createTable() : message.error('缺少选择行对应的dataSource')
  }

  const handleMenuClick = ({ key }: any) => {
    switch (key) {
      case 'query':
        queryExport()
        break
      case 'current':
        currentExport()
        break
      case 'select':
        selectExport()
        break
      default:
        break
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          label: '按条件导出',
          key: 'query',
        },
        {
          label: '按选择导出',
          key: 'select',
          disabled: !props.dataSource?.length
        },
      ]}
    />
  );

  return (
    < Dropdown.Button
      icon={<MoreOutlined />}
      onClick={() => handleMenuClick({ key: 'current' })}
      overlay={menu} >
      导出
    </ Dropdown.Button >
  )
}

export default ExportToExcel
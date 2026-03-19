import React, { useState } from 'react'
import { Tabs, Card, Table, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { ClassTypeConfig, PriceRangeConfig, CourseSystemConfig, LevelConfig } from '@/api/course'

const mockClassTypes: ClassTypeConfig[] = [
  { id: 1, name: '标准班', enabled: true, sort: 1 },
  { id: 2, name: '进阶班', enabled: true, sort: 2 },
  { id: 3, name: '1V1定制', enabled: true, sort: 3 },
]
const mockPriceRanges: PriceRangeConfig[] = [
  { id: 1, name: '0-500元', startPrice: 0, endPrice: 500, sort: 1 },
  { id: 2, name: '500-2000元', startPrice: 500, endPrice: 2000, sort: 2 },
]
const mockSystems: CourseSystemConfig[] = [
  { id: 1, name: 'AI素养体系', desc: '面向素养提升', sort: 1, enabled: true },
]
const mockLevels: LevelConfig[] = [
  { id: 1, name: 'L1', title: '入门', desc: '零基础', sort: 1, enabled: true },
  { id: 2, name: 'L2', title: '进阶', desc: '有基础', sort: 2, enabled: true },
]

export default function CourseConfig() {
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'class' | 'price' | 'system' | 'level'>('class')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [classTypes, setClassTypes] = useState<ClassTypeConfig[]>(mockClassTypes)
  const [priceRanges, setPriceRanges] = useState<PriceRangeConfig[]>(mockPriceRanges)
  const [systems, setSystems] = useState<CourseSystemConfig[]>(mockSystems)
  const [levels, setLevels] = useState<LevelConfig[]>(mockLevels)

  const openAdd = (type: typeof modalType) => {
    setModalType(type)
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ enabled: true, sort: 99 })
    setModalOpen(true)
  }

  const openEdit = (type: typeof modalType, record: ClassTypeConfig | PriceRangeConfig | CourseSystemConfig | LevelConfig) => {
    setModalType(type)
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setSubmitLoading(true)
      await new Promise((r) => setTimeout(r, 300))
      message.success(editingId ? '保存成功' : '新增成功')
      setModalOpen(false)
    } catch { /* validation failed */ } finally { setSubmitLoading(false) }
  }

  const moveUp = <T extends { id: number; sort: number }>(list: T[], index: number, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (index <= 0) return
    const arr = [...list]
    ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
    setter(arr.map((r, i) => ({ ...r, sort: i + 1 })) as T[])
  }

  const moveDown = <T extends { id: number; sort: number }>(list: T[], index: number, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (index >= list.length - 1) return
    const arr = [...list]
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    setter(arr.map((r, i) => ({ ...r, sort: i + 1 })) as T[])
  }

  const toggleEnabled = <T extends { id: number; enabled?: boolean }>(list: T[], id: number, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter(list.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) as T[])
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>AI能力课程 - 全局配置</h2>
      <Tabs
        items={[
          {
            key: 'class',
            label: '班型配置',
            children: (
              <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd('class')}>新增班型</Button>}>
                <Table
                  dataSource={classTypes}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '班型名称', dataIndex: 'name' },
                    { title: '启用', dataIndex: 'enabled', width: 80, render: (v, r) => <Switch size="small" checked={v} onChange={() => toggleEnabled(classTypes, r.id, setClassTypes)} /> },
                    { title: '排序', dataIndex: 'sort', width: 80 },
                    {
                      title: '操作',
                      width: 180,
                      render: (_, r, i) => (
                        <Space>
                          <a onClick={() => openEdit('class', r)}>编辑</a>
                          <a onClick={() => moveUp(classTypes, i, setClassTypes)}><ArrowUpOutlined /></a>
                          <a onClick={() => moveDown(classTypes, i, setClassTypes)}><ArrowDownOutlined /></a>
                          <Popconfirm title="确定删除？" onConfirm={() => { setClassTypes(classTypes.filter((x) => x.id !== r.id)); message.success('已删除'); }}>
                            <a style={{ color: '#ff4d4f' }}>删除</a>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'price',
            label: '价格区间配置',
            children: (
              <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd('price')}>新增价格区间</Button>}>
                <Table
                  dataSource={priceRanges}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '区间名称', dataIndex: 'name' },
                    { title: '起始价格', dataIndex: 'startPrice', width: 100 },
                    { title: '结束价格', dataIndex: 'endPrice', width: 100 },
                    { title: '排序', dataIndex: 'sort', width: 80 },
                    {
                      title: '操作',
                      width: 150,
                      render: (_, r, i) => (
                        <Space>
                          <a onClick={() => openEdit('price', r)}>编辑</a>
                          <a onClick={() => moveUp(priceRanges, i, setPriceRanges)}><ArrowUpOutlined /></a>
                          <a onClick={() => moveDown(priceRanges, i, setPriceRanges)}><ArrowDownOutlined /></a>
                          <Popconfirm title="确定删除？" onConfirm={() => { setPriceRanges(priceRanges.filter((x) => x.id !== r.id)); message.success('已删除'); }}>
                            <a style={{ color: '#ff4d4f' }}>删除</a>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'system',
            label: '课程体系',
            children: (
              <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd('system')}>新增体系</Button>}>
                <Table
                  dataSource={systems}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '体系名称', dataIndex: 'name' },
                    { title: '体系简介', dataIndex: 'desc', ellipsis: true },
                    { title: '排序', dataIndex: 'sort', width: 80 },
                    { title: '启用', dataIndex: 'enabled', width: 80, render: (v, r) => <Switch size="small" checked={v} onChange={() => toggleEnabled(systems, r.id, setSystems)} /> },
                    {
                      title: '操作',
                      width: 180,
                      render: (_, r, i) => (
                        <Space>
                          <a onClick={() => openEdit('system', r)}>编辑</a>
                          <a onClick={() => moveUp(systems, i, setSystems)}><ArrowUpOutlined /></a>
                          <a onClick={() => moveDown(systems, i, setSystems)}><ArrowDownOutlined /></a>
                          <Popconfirm title="确定删除？" onConfirm={() => { setSystems(systems.filter((x) => x.id !== r.id)); message.success('已删除'); }}>
                            <a style={{ color: '#ff4d4f' }}>删除</a>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'level',
            label: '层级配置',
            children: (
              <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd('level')}>新增层级</Button>}>
                <Table
                  dataSource={levels}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '层级名称', dataIndex: 'name', width: 100 },
                    { title: '层级标题', dataIndex: 'title' },
                    { title: '图标', dataIndex: 'iconUrl', width: 80, render: (v) => v ? <img src={v} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} /> : '-' },
                    { title: '描述', dataIndex: 'desc', ellipsis: true },
                    { title: '排序', dataIndex: 'sort', width: 80 },
                    { title: '启用', dataIndex: 'enabled', width: 80, render: (v, r) => <Switch size="small" checked={v} onChange={() => toggleEnabled(levels, r.id, setLevels)} /> },
                    {
                      title: '操作',
                      width: 180,
                      render: (_, r, i) => (
                        <Space>
                          <a onClick={() => openEdit('level', r)}>编辑</a>
                          <a onClick={() => moveUp(levels, i, setLevels)}><ArrowUpOutlined /></a>
                          <a onClick={() => moveDown(levels, i, setLevels)}><ArrowDownOutlined /></a>
                          <Popconfirm title="确定删除？" onConfirm={() => { setLevels(levels.filter((x) => x.id !== r.id)); message.success('已删除'); }}>
                            <a style={{ color: '#ff4d4f' }}>删除</a>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={
          modalType === 'class' ? '班型' : modalType === 'price' ? '价格区间' : modalType === 'system' ? '课程体系' : '层级'
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {modalType === 'class' && (
            <>
              <Form.Item name="name" label="班型名称" rules={[{ required: true }]}>
                <Input placeholder="如：标准班" />
              </Form.Item>
              <Form.Item name="enabled" label="启用" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="sort" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
          {modalType === 'price' && (
            <>
              <Form.Item name="name" label="区间名称" rules={[{ required: true }]}>
                <Input placeholder="如：0-500元" />
              </Form.Item>
              <Form.Item name="startPrice" label="起始价格" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="endPrice" label="结束价格" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="sort" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
          {modalType === 'system' && (
            <>
              <Form.Item name="name" label="体系名称" rules={[{ required: true }]}>
                <Input placeholder="如：AI素养体系" />
              </Form.Item>
              <Form.Item name="desc" label="体系简介">
                <Input.TextArea rows={2} placeholder="简要描述" />
              </Form.Item>
              <Form.Item name="sort" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="enabled" label="启用" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}
          {modalType === 'level' && (
            <>
              <Form.Item name="name" label="层级名称" rules={[{ required: true }]}>
                <Input placeholder="如：L1" />
              </Form.Item>
              <Form.Item name="title" label="层级标题" rules={[{ required: true }]}>
                <Input placeholder="如：入门" />
              </Form.Item>
              <Form.Item name="iconUrl" label="图标URL">
                <Input placeholder="上传后填写地址" />
              </Form.Item>
              <Form.Item name="desc" label="层级描述">
                <Input.TextArea rows={2} placeholder="如：零基础" />
              </Form.Item>
              <Form.Item name="sort" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="enabled" label="启用" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

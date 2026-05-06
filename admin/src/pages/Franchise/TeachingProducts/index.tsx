import React, { useMemo, useState } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Form, Image, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag, Typography, Upload, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd/es/upload/interface'
import { HolderOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import {
  DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  type TeachingProduct,
  deleteTeachingProduct,
  listTeachingProductsAdmin,
  reorderTeachingProducts,
  upsertTeachingProduct,
} from '@/mock/franchiseTeachingCatalog'

const COVER_UPLOAD_MAX_BYTES = 1024 * 1024

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

const SortableRow: React.FC<SortableRowProps> = (props) => {
  const { children, ...rest } = props
  const rowKey = rest['data-row-key']
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: rowKey,
  })
  const style: React.CSSProperties = {
    ...rest.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#fafafa' } : {}),
  }

  return (
    <tr {...rest} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        const colKey = (child.props as { column?: { key?: React.Key } }).column?.key
        if (colKey === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <span
                ref={setActivatorNodeRef}
                style={{ cursor: 'grab', touchAction: 'none', display: 'inline-flex', alignItems: 'center' }}
                {...listeners}
                aria-label="拖拽排序"
              >
                <HolderOutlined style={{ color: '#999' }} />
              </span>
            ),
          })
        }
        return child
      })}
    </tr>
  )
}

export default function FranchiseTeachingProducts() {
  const [tick, setTick] = useState(0)
  const data = useMemo(() => {
    void tick
    return listTeachingProductsAdmin()
  }, [tick])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm<TeachingProduct & { id: string }>()
  const coverImageUrlWatch = Form.useWatch('coverImageUrl', form)
  const coverPreviewSrc =
    typeof coverImageUrlWatch === 'string' && coverImageUrlWatch.trim()
      ? coverImageUrlWatch.trim()
      : DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL

  const refresh = () => setTick((t) => t + 1)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = data.findIndex((x) => x.id === active.id)
    const newIndex = data.findIndex((x) => x.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(data, oldIndex, newIndex)
    reorderTeachingProducts(next.map((x) => x.id))
    refresh()
    message.success('排序已保存')
  }

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      id: `kit-${Date.now().toString(36)}`,
      name: '',
      price: 0,
      desc: '',
      coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
      enabled: true,
    })
    setOpen(true)
  }

  const openEdit = (row: TeachingProduct) => {
    setEditingId(row.id)
    form.setFieldsValue({
      ...row,
      coverImageUrl: row.coverImageUrl ?? DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
    })
    setOpen(true)
  }

  const beforeCoverUpload: UploadProps['beforeUpload'] = (file) => {
    const okType = file.type.startsWith('image/')
    if (!okType) {
      message.error('请上传图片文件')
      return Upload.LIST_IGNORE
    }
    if (file.size > COVER_UPLOAD_MAX_BYTES) {
      message.error('图片大小不能超过 1MB（演示环境 Base64 入库）')
      return Upload.LIST_IGNORE
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url) {
        form.setFieldValue('coverImageUrl', url)
        message.success('图片已载入，请点击「确定」保存商品')
      }
    }
    reader.readAsDataURL(file)
    return false
  }

  const submit = async () => {
    try {
      const v = await form.validateFields()
      const r = upsertTeachingProduct({
        ...v,
        id: editingId ?? v.id.trim(),
        price: Number(v.price),
        coverImageUrl: v.coverImageUrl?.trim() || DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
      })
      if (!r.ok) {
        message.error(r.msg || '保存失败')
        return
      }
      message.success(editingId ? '已更新' : '已创建')
      setOpen(false)
      refresh()
    } catch {
      /* validate only */
    }
  }

  const columns: ColumnsType<TeachingProduct> = [
    {
      key: 'sort',
      align: 'center',
      width: 52,
      render: () => <HolderOutlined style={{ color: '#ccc' }} />,
    },
    {
      title: '封面',
      key: 'cover',
      width: 118,
      render: (_, row) => {
        const src = row.coverImageUrl?.trim() || DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL
        return (
          <div style={{ width: 96 }}>
            <Image src={src} alt="" width={96} height={56} style={{ objectFit: 'cover', borderRadius: 6 }} />
          </div>
        )
      },
    },
    { title: '标题', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{Number(v).toFixed(2)}</span>,
    },
    {
      title: '上架',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (v) => (v !== false ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 160,
      render: (_, row) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该学具商品？" onConfirm={() => { deleteTeachingProduct(row.id); message.success('已删除'); refresh() }}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>学具商品配置</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建商品
        </Button>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <Table<TeachingProduct>
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 880 }}
            components={{ body: { row: SortableRow } }}
          />
        </SortableContext>
      </DndContext>
      <Modal
        title={editingId ? '编辑学具商品' : '新建学具商品'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          {!editingId ? (
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          ) : (
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="name" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="售价（元）" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="desc" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="封面图片">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Image src={coverPreviewSrc} alt="封面预览" width={180} height={102} style={{ objectFit: 'cover', borderRadius: 8 }} />
              <Upload
                accept="image/*"
                maxCount={1}
                beforeUpload={beforeCoverUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>上传封面</Button>
              </Upload>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                演示环境将图片转为 Base64 写入本地配置（≤1MB）；保存商品后加盟商端可见。
              </Typography.Text>
              <Form.Item name="coverImageUrl" hidden>
                <Input />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="enabled" label="上架" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
